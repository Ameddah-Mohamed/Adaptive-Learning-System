"""
NLP Course Knowledge Retriever.
Queries ChromaDB vector store using qwen3-embedding:4b with cosine metric calibration
to return relevant course slides, formulas, and assessment solutions.
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
import chromadb
import ollama


EMBED_MODEL = "qwen3-embedding:4b"
COLLECTION_NAME = "nlp_course_kb"


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
    def __init__(self, persist_dir: Optional[Path] = None):
        if persist_dir is None:
            project_root = Path(__file__).resolve().parents[2]
            persist_dir = project_root / "data" / "chroma_db"
            
        self.persist_dir = persist_dir
        self.client = chromadb.PersistentClient(path=str(self.persist_dir))
        self.collection = self.client.get_collection(COLLECTION_NAME)

    def retrieve(
        self,
        query: str,
        top_k: int = 4,
        category: Optional[str] = None,
        chapter: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        # Generate raw query embedding
        res = ollama.embed(model=EMBED_MODEL, input=[query])
        raw_query_emb = np.array(res["embeddings"][0], dtype=np.float32)
        
        # Build filter condition if provided
        where_filter = None
        conditions = []
        if category:
            conditions.append({"category": category})
        if chapter is not None:
            conditions.append({"chapter": chapter})
            
        if len(conditions) == 1:
            where_filter = conditions[0]
        elif len(conditions) > 1:
            where_filter = {"$and": conditions}
            
        # Retrieve candidate pool from Chroma
        n_candidates = max(top_k * 5, 20)
        total_items = self.collection.count()
        n_candidates = min(n_candidates, total_items)
        
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
                    sim = 0.5
                    
                candidates.append({
                    "id": doc_id,
                    "document": meta.get("document", ""),
                    "chapter": meta.get("chapter"),
                    "slide_num": meta.get("slide_num"),
                    "category": meta.get("category"),
                    "text": text,
                    "similarity_score": round(sim, 4),
                    "citation": f"[{meta.get('document')}, Slide {meta.get('slide_num')}]"
                })
                
        # Sort strictly by calibrated cosine similarity descending
        candidates.sort(key=lambda x: x["similarity_score"], reverse=True)
        return candidates[:top_k]

    def format_context_for_prompt(self, retrieved_chunks: List[Dict[str, Any]]) -> str:
        """Helper to format retrieved chunks as context for LLM prompt."""
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
    test_queries = [
        "What is the mathematical formula for Scaled Dot-Product Attention and why do we divide by sqrt(d_k)?",
        "How do we calculate perplexity of a language model?",
        "What is Chomsky Normal Form CNF conversion in CKY parsing?"
    ]
    
    for q in test_queries:
        print(f"\n=======================================================")
        print(f"QUERY: {q}")
        print(f"=======================================================")
        results = retriever.retrieve(q, top_k=2)
        for r in results:
            print(f"-> {r['citation']} | Score: {r['similarity_score']}")
            print(f"   Snippet: {r['text'][:180].replace(chr(10), ' ')}...\n")
