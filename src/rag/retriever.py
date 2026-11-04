"""
Course Retriever Module (Teammate 1 Task: RAG & Knowledge Retrieval).

TODO for Teammate 1:
1. Ingest clean markdown from data/processed/markdown/ or pre-chunked references.
2. Build/connect to ChromaDB (data/chroma_db) using embedding model (e.g., qwen3-embedding:4b).
3. Implement retrieve() and retrieve_hierarchical() with cosine similarity thresholding (min_similarity = 0.50).
4. Implement format_context_for_prompt() to format slide and textbook citations.

Refer to: docs/TEAM_DATA_HANDOFF_AND_TASKS_GUIDE.md
"""

import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

LECTURE_COLLECTION = "nlp_course_kb"
EVAL_COLLECTION = "instructor_eval_kb"
REFERENCE_COLLECTION = "reference_kb"


class CourseRetriever:
    """Starter skeleton for Course Knowledge Retrieval."""

    def __init__(
        self,
        collection_name: str = LECTURE_COLLECTION,
        persist_dir: str = "data/chroma_db",
        min_similarity: float = 0.50,
        client: Optional[Any] = None
    ):
        self.collection_name = collection_name
        self.persist_dir = persist_dir
        self.min_similarity = min_similarity
        logger.info(f"CourseRetriever initialized on '{collection_name}' in STARTER mode. (Teammate 1 Task)")

    def retrieve(
        self,
        query: str,
        collection_name: str = LECTURE_COLLECTION,
        top_k: int = 3,
        chapter_filter: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        TODO (Teammate 1):
        Query ChromaDB collection using cosine similarity.
        Filter by chapter if chapter_filter is provided.
        Filter out results below self.min_similarity.
        """
        logger.warning("CourseRetriever.retrieve() called in starter mode. Implement in src/rag/retriever.py")
        return []

    def retrieve_hierarchical(
        self,
        query: str,
        primary_k: int = 3,
        ref_k: int = 2
    ) -> Dict[str, Any]:
        """
        TODO (Teammate 1):
        Perform two-tier hierarchical retrieval:
        1. Search primary course lecture slides (nlp_course_kb).
        2. Enrich with textbook/paper references (reference_kb).
        Never leak instructor exam solutions (instructor_eval_kb).
        """
        logger.warning("CourseRetriever.retrieve_hierarchical() called in starter mode. Implement in src/rag/retriever.py")
        return {
            "primary": [],
            "reference": [],
            "citations": []
        }

    def format_context_for_prompt(self, chunks: List[Dict[str, Any]]) -> str:
        """
        TODO (Teammate 1):
        Format retrieved chunks into a clean prompt context string with citations.
        """
        if not chunks:
            return "No retrieved course materials available (RAG is currently in starter mode)."
        return "\n\n".join(c.get("text", "") for c in chunks)

    def is_in_domain(self, query: str) -> bool:
        """
        TODO (Teammate 1):
        Return True if query similarity is >= min_similarity, False otherwise (abstention).
        """
        return True
