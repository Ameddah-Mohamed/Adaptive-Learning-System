"""
Rubric Evaluator & Grader API Endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from src.evaluator.grader import SubmissionEvaluator
from backend.app.core.config import settings

router = APIRouter(prefix="/evaluator", tags=["Evaluator"])


class GradeRequest(BaseModel):
    problem_statement: str
    marking_scheme: str
    student_submission: str
    model: Optional[str] = None


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
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
