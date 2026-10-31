"""
Rubric Evaluator & Grader API Endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from src.evaluator.grader import SubmissionEvaluator
from backend.app.core.config import settings
from src.learner.mastery import LearnerEngine

router = APIRouter(prefix="/evaluator", tags=["Evaluator"])
engine = LearnerEngine()


class GradeRequest(BaseModel):
    problem_statement: str
    marking_scheme: str
    student_submission: str
    model: Optional[str] = None
    student_id: Optional[str] = "default_student"
    chapter: Optional[int] = None
    topic: Optional[str] = None


@router.post("/grade")
async def grade_submission(req: GradeRequest):
    try:
        model_name = req.model or settings.CODER_LLM or settings.DEFAULT_LLM
        evaluator = SubmissionEvaluator(model_name=model_name)
        result = evaluator.grade(
            problem_statement=req.problem_statement,
            marking_scheme=req.marking_scheme,
            student_submission=req.student_submission
        )

        # Log grading event in learner engine
        try:
            eval_data = result.get("evaluation", {})
            earned = float(eval_data.get("earned_score", 0.0))
            total = float(eval_data.get("total_score", 1.0))
            engine.update_from_grading_result(
                student_id=req.student_id or "default_student",
                problem_statement=req.problem_statement,
                earned_score=earned,
                total_score=total,
                chapter=req.chapter,
                topic=req.topic
            )
        except Exception:
            pass

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
