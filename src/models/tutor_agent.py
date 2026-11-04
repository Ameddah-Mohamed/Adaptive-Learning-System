"""
AI Course Tutor Agent Module.

TODO for Teammate 1 / Team:
1. Ingest user query and retrieve course slide context via CourseRetriever.
2. Construct grounded prompt with slide citations and strict syllabus boundaries.
3. Call local LLM (Ollama qwen3.5:latest or fine-tuned LoRA model) with streaming support.

Refer to: docs/TEAM_DATA_HANDOFF_AND_TASKS_GUIDE.md
"""

import logging
from typing import Dict, Any, List, Optional
from src.rag.retriever import CourseRetriever

logger = logging.getLogger(__name__)


class NLPTutorAgent:
    """Starter skeleton for NLP Tutor Agent."""

    def __init__(self, model_name: str = "qwen3.5:latest", top_k_retrieval: int = 3):
        self.model_name = model_name
        self.top_k = top_k_retrieval
        self.retriever = CourseRetriever()
        logger.info("NLPTutorAgent initialized in STARTER mode.")

    def answer_question(self, question: str) -> Dict[str, Any]:
        """
        TODO: Retrieve context and generate grounded tutor response.
        """
        logger.warning("NLPTutorAgent.answer_question() called in starter mode.")
        return {
            "answer": "The AI Tutor is currently in starter mode. Implement retrieval and response generation in src/models/tutor_agent.py.",
            "citations": []
        }
