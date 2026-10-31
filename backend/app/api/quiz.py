"""
Dynamic Quiz & Exercise Generator API Endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from src.models.quiz_generator import QuizGenerator
from backend.app.core.config import settings

router = APIRouter(prefix="/quiz", tags=["Quiz"])


class QuizRequest(BaseModel):
    topic: str
    difficulty: str = "intermediate"  # beginner, intermediate, advanced
    question_type: str = "mcq"       # mcq, calculation, derivation, coding
    model: Optional[str] = None


@router.post("/generate")
async def generate_quiz(req: QuizRequest):
    try:
        model_name = req.model or settings.DEFAULT_LLM
        generator = QuizGenerator(model_name=model_name)
        result = generator.generate_exercise(
            topic=req.topic,
            difficulty=req.difficulty,
            question_type=req.question_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
