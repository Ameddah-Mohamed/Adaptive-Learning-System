"""
Index Course Knowledge Base into ChromaDB using Ollama qwen3-embedding:4b.
Reads chunks from data/processed/chunks/course_chunks.json, generates embeddings,
and stores them persistently in data/chroma_db.
"""

import json
import time
from pathlib import Path
from typing import List, Dict, Any
import chromadb
import ollama


EMBED_MODEL = "qwen3-embedding:4b"
COLLECTION_NAME = "nlp_course_kb"
BATCH_SIZE = 32


def get_chroma_collection(persist_dir: Path):
    persist_dir.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(persist_dir))
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"description": "ENSIA NLP Course Knowledge Base Chunks"}
    )
    return collection


def index_chunks(chunks_file: Path, persist_dir: Path, batch_size: int = BATCH_SIZE):
    if not chunks_file.exists():
        raise FileNotFoundError(f"Chunks file not found at: {chunks_file}")
        
    with open(chunks_file, "r", encoding="utf-8") as f:
        chunks: List[Dict[str, Any]] = json.load(f)
        
    print(f"Loaded {len(chunks)} chunks from {chunks_file}")
    collection = get_chroma_collection(persist_dir)
    
    # Check already indexed IDs to allow safe resumption
    existing_count = collection.count()
    print(f"Chroma collection currently contains {existing_count} items.")
    
    existing_ids = set()
    if existing_count > 0:
        # Retrieve existing IDs
        existing_res = collection.get(include=[])
        existing_ids = set(existing_res["ids"])
        
    chunks_to_index = [c for c in chunks if c["id"] not in existing_ids]
    print(f"Remaining chunks to index: {len(chunks_to_index)} (Skipping {len(existing_ids)} already indexed)")
    
    if not chunks_to_index:
        print("All chunks are already indexed! Done.")
        return collection
        
    total = len(chunks_to_index)
    start_time = time.time()
    
    for i in range(0, total, batch_size):
        batch = chunks_to_index[i:i + batch_size]
        batch_ids = [c["id"] for c in batch]
        # Use enriched_text for higher retrieval precision
        batch_texts = [c["enriched_text"] for c in batch]
        
        # Prepare metadata (flat dict for ChromaDB)
        batch_metadatas = [
            {
                "document": c.get("document", ""),
                "chapter": c.get("chapter") if c.get("chapter") is not None else -1,
                "slide_num": c.get("slide_num", 0),
                "category": c.get("category", "")
            }
            for c in batch
        ]
        
        batch_t0 = time.time()
        try:
            res = ollama.embed(model=EMBED_MODEL, input=batch_texts)
            embeddings = res.get("embeddings", [])
            
            collection.add(
                ids=batch_ids,
                embeddings=embeddings,
                documents=[c["text"] for c in batch],
                metadatas=batch_metadatas
            )
            
            elapsed_batch = time.time() - batch_t0
            processed = min(i + batch_size, total)
            print(f"[{processed}/{total}] Indexed batch of {len(batch)} chunks in {elapsed_batch:.2f}s ({processed/total*100:.1f}%)")
        except Exception as e:
            print(f"Error indexing batch {i} to {i+batch_size}: {e}")
            raise e
            
    total_time = time.time() - start_time
    print(f"\nIndexing finished in {total_time:.2f}s! Final total count: {collection.count()}")
    return collection


if __name__ == "__main__":
    PROJECT_ROOT = Path(__file__).resolve().parents[2]
    chunks_path = PROJECT_ROOT / "data" / "processed" / "chunks" / "course_chunks.json"
    chroma_path = PROJECT_ROOT / "data" / "chroma_db"
    index_chunks(chunks_path, chroma_path)
