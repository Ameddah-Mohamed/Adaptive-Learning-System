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
        problem_statement: str,
        marking_scheme: str,
        student_submission: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        TODO (Teammate 3):
        Load the rubric from data/sft/grading_rubrics.jsonl or marking_scheme.
        Evaluate student_submission against criteria.
        Return itemized scores, total score, and feedback.
        """
        logger.warning("SubmissionEvaluator.grade() called in starter mode. Implement in src/evaluator/grader.py")
        return {
            "evaluation": {
                "earned_score": 4.0,
                "total_score": 5.0,
                "percentage": 80.0,
                "passed": True,
                "feedback": "Starter evaluation feedback. Implement rubric evaluation in src/evaluator/grader.py.",
                "criteria_breakdown": [
                    {"criterion": "Conceptual Setup", "earned": 2.0, "max": 2.0, "status": "Passed"},
                    {"criterion": "Mathematical Execution", "earned": 1.5, "max": 2.0, "status": "Partial"},
                    {"criterion": "Final Result", "earned": 0.5, "max": 1.0, "status": "Partial"}
                ]
            }
        }
