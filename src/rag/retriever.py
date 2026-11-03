"""
NLP Course Knowledge Retriever with Cosine Calibration and Segregated Collections.
Queries ChromaDB vector store using qwen3-embedding:4b with cosine distance
and relevance thresholding to ensure factual grounding while preventing off-domain hallucinations
and exam ground truth leakage.
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
import chromadb
import ollama

EMBED_MODEL = "qwen3-embedding:4b"
LECTURE_COLLECTION = "nlp_course_kb"
EVAL_COLLECTION = "instructor_eval_kb"
REFERENCE_COLLECTION = "reference_kb"


def normalize_vector(v: List[float]) -> List[float]:
    arr = np.array(v, dtype=np.float32)
    norm = np.linalg.norm(arr)
    if norm > 0:
        arr = arr / norm
    return arr.tolist()


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


class CourseRetriever:
    def __init__(
        self,
        persist_dir: Optional[Path] = None,
        collection_name: str = LECTURE_COLLECTION,
        default_min_similarity: float = 0.50
    ):
        if persist_dir is None:
            project_root = Path(__file__).resolve().parents[2]
            persist_dir = project_root / "data" / "chroma_db"

        self.persist_dir = persist_dir
        self.collection_name = collection_name
        self.default_min_similarity = default_min_similarity
        self.client = chromadb.PersistentClient(path=str(self.persist_dir))
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def retrieve(
        self,
        query: str,
        top_k: int = 4,
        category: Optional[str] = None,
        chapter: Optional[int] = None,
        min_similarity: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        threshold = self.default_min_similarity if min_similarity is None else min_similarity

        # Generate query embedding
        res = ollama.embed(model=EMBED_MODEL, input=[query])
        raw_query_emb = np.array(res["embeddings"][0], dtype=np.float32)

        # Build metadata filter
        conditions = []
        if category:
            conditions.append({"category": category})
        if chapter is not None:
            conditions.append({"chapter": chapter})

        where_filter = None
        if len(conditions) == 1:
            where_filter = conditions[0]
        elif len(conditions) > 1:
            where_filter = {"$and": conditions}

        total_items = self.collection.count()
        if total_items == 0:
            return []

        n_candidates = min(max(top_k * 5, 20), total_items)

        results = self.collection.query(
            query_embeddings=[raw_query_emb.tolist()],
            n_results=n_candidates,
            where=where_filter,
            include=["documents", "metadatas", "embeddings"]
        )

        candidates = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metadatas = results["metadatas"][0]
            ids = results["ids"][0]
            embeddings = results.get("embeddings", [None])[0]

            for idx, (doc_id, text, meta) in enumerate(zip(ids, docs, metadatas)):
                if embeddings is not None and embeddings[idx] is not None:
                    chunk_emb = np.array(embeddings[idx], dtype=np.float32)
                    sim = cosine_similarity(raw_query_emb, chunk_emb)
                else:
                    sim = 0.50

                # Filter out candidates below similarity threshold
                if sim < threshold:
                    continue

                label = "Page" if meta.get("category") in ("textbook", "papers") else "Slide"
                doc_name = meta.get("document", "")
                num = meta.get("slide_num")
                citation = f"[{doc_name}, {label} {num}]" if num and num > 0 else f"[{doc_name}]"

                candidates.append({
                    "id": doc_id,
                    "document": doc_name,
                    "chapter": meta.get("chapter"),
                    "slide_num": num,
                    "category": meta.get("category"),
                    "text": text,
                    "similarity_score": round(sim, 4),
                    "citation": citation
                })

        # Sort strictly by calibrated cosine similarity descending
        candidates.sort(key=lambda x: x["similarity_score"], reverse=True)
        return candidates[:top_k]

    def retrieve_hierarchical(
        self,
        query: str,
        lecture_top_k: int = 3,
        reference_top_k: int = 2,
        min_similarity: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Hierarchical retrieval:
        1. Searches primary course lectures ('nlp_course_kb')
        2. Searches reference textbook & papers ('reference_kb')
        Returns both partitioned and combined result sets.
        """
        lecture_matches = self.retrieve(query, top_k=lecture_top_k, min_similarity=min_similarity)

        ref_retriever = CourseRetriever(
            persist_dir=self.persist_dir,
            collection_name=REFERENCE_COLLECTION,
            default_min_similarity=self.default_min_similarity
        )
        ref_matches = ref_retriever.retrieve(query, top_k=reference_top_k, min_similarity=min_similarity)

        combined = list(lecture_matches)
        for r in ref_matches:
            if not any(c["id"] == r["id"] for c in combined):
                combined.append(r)

        return {
            "lectures": lecture_matches,
            "references": ref_matches,
            "all": combined
        }

    def is_in_domain(self, query: str, threshold: float = 0.50) -> bool:
        """Checks if a query matches any course slide above the threshold."""
        matches = self.retrieve(query, top_k=1, min_similarity=threshold)
        return len(matches) > 0

    def format_context_for_prompt(self, retrieved_chunks: List[Dict[str, Any]]) -> str:
        """Helper to format retrieved chunks as context for LLM prompt."""
        if not retrieved_chunks:
            return ""
        context_blocks = []
        for idx, chunk in enumerate(retrieved_chunks, start=1):
            block = (
                f"### Reference Source {idx}: {chunk['citation']} (Relevance: {chunk['similarity_score']})\n"
                f"{chunk['text']}\n"
            )
            context_blocks.append(block)
        return "\n\n".join(context_blocks)


if __name__ == "__main__":
    retriever = CourseRetriever()
    print("Testing course queries with thresholding...")
    
    # 1. In-domain NLP query
    q1 = "What is the formula for Scaled Dot-Product Attention?"
    r1 = retriever.retrieve(q1, top_k=2)
    print(f"\nQuery: '{q1}' -> {len(r1)} result(s)")
    for r in r1:
        print(f"  - {r['citation']} (score: {r['similarity_score']})")
        
    # 2. Out-of-domain query
    q2 = "What is the capital city of France?"
    r2 = retriever.retrieve(q2, top_k=2, min_similarity=0.55)
    print(f"\nQuery: '{q2}' -> {len(r2)} result(s) (Expected: 0 below threshold)")
