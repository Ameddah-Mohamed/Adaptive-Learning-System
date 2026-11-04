"""
Dynamic Quiz Generator Module (Teammate 4 Task: Adaptive Assessment).

TODO for Teammate 4:
1. Ingest verified questions from data/sft/exercise_bank.jsonl.
2. Filter questions by topic and difficulty (beginner, intermediate, advanced).
3. Optionally call local LLM with structured Pydantic schema to generate novel variations.
4. Return standardized quiz item dictionary.

Refer to: docs/TEAM_DATA_HANDOFF_AND_TASKS_GUIDE.md
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
EXERCISE_BANK_PATH = PROJECT_ROOT / "data" / "sft" / "exercise_bank.jsonl"


class QuizGenerator:
    """Starter skeleton for Dynamic Quiz Generator."""

    def __init__(self, model_name: str = "qwen3.5:latest"):
        self.model_name = model_name
        logger.info("QuizGenerator initialized in STARTER mode. (Teammate 4 Task)")

    def generate_exercise(
        self,
        topic: str,
        difficulty: str = "intermediate",
        ex_type: str = "mcq"
    ) -> Dict[str, Any]:
        """
        TODO (Teammate 4):
        Query data/sft/exercise_bank.jsonl for matching exercises on `topic`,
        or prompt LLM to generate an exercise adhering to the official syllabus.
        """
        logger.warning(f"QuizGenerator.generate_exercise('{topic}') called in starter mode.")
        return {
            "id": "STARTER-EX-01",
            "topic": topic,
            "difficulty": difficulty,
            "type": ex_type,
            "question": f"Starter placeholder question on {topic}. Implement generator in src/models/quiz_generator.py.",
            "options": {
                "A": "Option A (Pending implementation)",
                "B": "Option B (Pending implementation)",
                "C": "Option C (Pending implementation)",
                "D": "Option D (Pending implementation)"
            },
            "correct_answer": "A",
            "points": 1.0,
            "explanation": "Implement full generation logic using data/sft/exercise_bank.jsonl."
        }
