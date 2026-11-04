"""
Submission Evaluator Module (Teammate 3 Task: Deliverable 2 - Autograder & Rubric Grader).

TODO for Teammate 3:
1. Ingest official marking rubrics from data/sft/grading_rubrics.jsonl.
2. Compare student submission against criteria breakdown.
3. Call local LLM (e.g. qwen3.5:latest) with strict JSON schema forcing itemized points.
4. Return structured score matching backend API requirements.

Refer to: docs/TEAM_DATA_HANDOFF_AND_TASKS_GUIDE.md
"""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class SubmissionEvaluator:
    """Starter skeleton for Rubric Grading Engine."""

    def __init__(self, model_name: str = "qwen3.5:latest"):
        self.model_name = model_name
        logger.info("SubmissionEvaluator initialized in STARTER mode. (Teammate 3 Task)")

    def grade(
        self,
        task_id: str,
        student_submission: str,
        reference_solution: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        TODO (Teammate 3):
        Load the rubric for task_id from data/sft/grading_rubrics.jsonl.
        Evaluate student_submission against criteria.
        Return itemized scores, total score, and feedback.
        """
        logger.warning("SubmissionEvaluator.grade() called in starter mode. Implement in src/evaluator/grader.py")
        return {
            "score": 0.0,
            "max_score": 5.0,
            "passed": False,
            "feedback": "Autograder is currently in starter mode. Implement rubric grading in src/evaluator/grader.py.",
            "criteria_scores": [
                {"criterion": "Conceptual Setup", "awarded": 0.0, "max": 2.0, "feedback": "Pending implementation."},
                {"criterion": "Mathematical Derivation", "awarded": 0.0, "max": 2.0, "feedback": "Pending implementation."},
                {"criterion": "Final Accuracy", "awarded": 0.0, "max": 1.0, "feedback": "Pending implementation."}
            ]
        }
