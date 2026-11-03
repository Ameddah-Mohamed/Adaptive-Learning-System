"""
Index Course Knowledge Base into ChromaDB using Ollama qwen3-embedding:4b.
Maintains two segregated collections:
1. 'nlp_course_kb' - Lecture slide decks (accessible to student tutor & quiz generator)
2. 'instructor_eval_kb' - Exam & quiz answer keys (restricted to rubric grading)
"""

import json
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
import chromadb
import ollama

EMBED_MODEL = "qwen3-embedding:4b"
LECTURE_COLLECTION = "nlp_course_kb"
EVAL_COLLECTION = "instructor_eval_kb"
REFERENCE_COLLECTION = "reference_kb"
BATCH_SIZE = 32


def get_chroma_collection(persist_dir: Path, collection_name: str = LECTURE_COLLECTION):
    persist_dir.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(persist_dir))
    collection = client.get_or_create_collection(
        name=collection_name,
        metadata={
            "hnsw:space": "cosine",
            "description": f"ENSIA NLP {collection_name} Knowledge Base"
        }
    )
    return collection


def index_chunks(chunks_file: Path, persist_dir: Path, batch_size: int = BATCH_SIZE):
    if not chunks_file.exists():
        raise FileNotFoundError(f"Chunks file not found at: {chunks_file}")

    with open(chunks_file, "r", encoding="utf-8") as f:
        chunks: List[Dict[str, Any]] = json.load(f)

    # Separate lecture chunks from exam chunks
    lecture_chunks = [c for c in chunks if c.get("category") == "lectures"]
    exam_chunks = [c for c in chunks if c.get("category") == "exams_and_quizzes"]

    print(f"Loaded {len(chunks)} chunks ({len(lecture_chunks)} lectures, {len(exam_chunks)} exams/quizzes)")

    _index_category_chunks(lecture_chunks, persist_dir, LECTURE_COLLECTION, batch_size)
    _index_category_chunks(exam_chunks, persist_dir, EVAL_COLLECTION, batch_size)


def _index_category_chunks(chunks: List[Dict[str, Any]], persist_dir: Path, collection_name: str, batch_size: int):
    collection = get_chroma_collection(persist_dir, collection_name)
    existing_count = collection.count()
    print(f"\nCollection '{collection_name}' currently contains {existing_count} items.")

    existing_ids = set()
    if existing_count > 0:
        existing_res = collection.get(include=[])
        existing_ids = set(existing_res["ids"])

    chunks_to_index = [c for c in chunks if c["id"] not in existing_ids]
    print(f"Remaining chunks to index for '{collection_name}': {len(chunks_to_index)} (Skipping {len(existing_ids)})")

    if not chunks_to_index:
        return collection

    total = len(chunks_to_index)
    start_time = time.time()

    for i in range(0, total, batch_size):
        batch = chunks_to_index[i:i + batch_size]
        batch_ids = [c["id"] for c in batch]
        batch_texts = [c["enriched_text"] for c in batch]
        batch_metadatas = [
            {
                "document": c.get("document", ""),
                "chapter": c.get("chapter") if c.get("chapter") is not None else -1,
                "slide_num": c.get("slide_num") if c.get("slide_num") is not None else (c.get("page_num") if c.get("page_num") is not None else -1),
                "category": c.get("category", "")
            }
            for c in batch
        ]

        # Generate embeddings via local Ollama
        emb_res = ollama.embed(model=EMBED_MODEL, input=batch_texts)
        raw_embeddings = emb_res["embeddings"]

        # Insert into ChromaDB
        collection.add(
            ids=batch_ids,
            embeddings=raw_embeddings,
            documents=[c["text"] for c in batch],
            metadatas=batch_metadatas
        )

        elapsed = time.time() - start_time
        print(f"  Indexed {min(i + batch_size, total)}/{total} chunks into '{collection_name}' ({elapsed:.1f}s)")

    print(f"Finished indexing for '{collection_name}'! Total items: {collection.count()}")
    return collection


def index_reference_chunks(ref_chunks_file: Path, persist_dir: Path, batch_size: int = BATCH_SIZE):
    if not ref_chunks_file.exists():
        print(f"[!] Reference chunks file not found: {ref_chunks_file}")
        return

    with open(ref_chunks_file, "r", encoding="utf-8") as f:
        chunks: List[Dict[str, Any]] = json.load(f)

    print(f"\nIndexing Reference Knowledge Base ({len(chunks)} chunks)...")
    _index_category_chunks(chunks, persist_dir, REFERENCE_COLLECTION, batch_size)


if __name__ == "__main__":
    PROJECT_ROOT = Path(__file__).resolve().parents[2]
    chunks_path = PROJECT_ROOT / "data" / "processed" / "chunks" / "course_chunks.json"
    ref_chunks_path = PROJECT_ROOT / "data" / "processed" / "chunks" / "reference_chunks.json"
    chroma_path = PROJECT_ROOT / "data" / "chroma_db"

    # Index primary course materials (lectures & exams)
    index_chunks(chunks_path, chroma_path)

    # Index reference materials (textbook & papers)
    if ref_chunks_path.exists():
        index_reference_chunks(ref_chunks_path, chroma_path)
