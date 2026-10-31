"""
Dynamic Quiz & Exercise Generator API Endpoints with Adaptive Mastery Integration.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from src.models.quiz_generator import QuizGenerator
from backend.app.core.config import settings
from src.learner.mastery import LearnerEngine

router = APIRouter(prefix="/quiz", tags=["Quiz"])
engine = LearnerEngine()


class QuizRequest(BaseModel):
    topic: Optional[str] = None  # None, "auto", or specific topic
    difficulty: Optional[str] = "intermediate"
    question_type: Optional[str] = "mcq"
    model: Optional[str] = None
    chapter: Optional[int] = None
    student_id: Optional[str] = "default_student"
    adaptive: Optional[bool] = False


class QuizSubmitRequest(BaseModel):
    chapter: int
    topic: str
    difficulty: str
    selected_answer: str
    correct_answer: str
    points: Optional[float] = 1.0
    student_id: Optional[str] = "default_student"
    question_text: Optional[str] = None


@router.post("/generate")
async def generate_quiz(req: QuizRequest):
    """
    Generates a curriculum-grounded exercise. If adaptive is True or topic is 'auto',
    queries the learner engine for the student's weakest topic and calibrated difficulty.
    """
    try:
        model_name = req.model or settings.DEFAULT_LLM
        student_id = req.student_id or "default_student"
        
        target_topic = req.topic
        target_difficulty = req.difficulty or "intermediate"
        target_chapter = req.chapter
        was_adaptive = False
        recommendation_meta = None

        # Determine if adaptive selection is triggered
        if req.adaptive or not target_topic or target_topic.lower() in ("auto", "adaptive"):
            was_adaptive = True
            rec = engine.recommend_next_practice(student_id=student_id)
            target_topic = rec["topic"]
            target_chapter = rec["chapter"]
            target_difficulty = rec["recommended_difficulty"]
            recommendation_meta = rec

        generator = QuizGenerator(model_name=model_name)
        result = generator.generate_exercise(
            topic=target_topic,
            difficulty=target_difficulty,
            question_type=req.question_type or "mcq",
            chapter=target_chapter
        )

        if was_adaptive:
            result["adaptive_selection"] = {
                "active": True,
                "reason": recommendation_meta["reason"] if recommendation_meta else "Calibrated to student mastery profile.",
                "target_chapter": target_chapter,
                "target_difficulty": target_difficulty
            }

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/submit")
async def submit_quiz_answer(req: QuizSubmitRequest):
    """
    Submits a student's answer, checks correctness, updates topic mastery,
    and returns immediate feedback and the next recommended practice topic.
    """
    try:
        # Evaluate correctness (case and whitespace insensitive)
        clean_sel = req.selected_answer.strip().upper()
        clean_ans = req.correct_answer.strip().upper()
        is_correct = clean_sel == clean_ans or (len(clean_ans) == 1 and clean_sel.startswith(clean_ans))

        awarded = float(req.points) if is_correct else 0.0

        # Update mastery in SQLite
        update_info = engine.update_from_quiz_attempt(
            student_id=req.student_id or "default_student",
            chapter=req.chapter,
            topic=req.topic,
            difficulty=req.difficulty,
            is_correct=is_correct,
            score=awarded,
            max_score=req.points or 1.0,
            details={
                "selected": req.selected_answer,
                "correct": req.correct_answer,
                "question": (req.question_text[:120] if req.question_text else None)
            }
        )

        # Get next recommended practice
        next_rec = engine.recommend_next_practice(student_id=req.student_id or "default_student")

        return {
            "is_correct": is_correct,
            "awarded_points": awarded,
            "max_points": req.points or 1.0,
            "mastery_update": update_info,
            "next_recommendation": next_rec
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendation")
async def get_quiz_recommendation(student_id: str = Query("default_student")):
    """
    Quick endpoint returning the current top recommended topic and difficulty.
    """
    try:
        rec = engine.recommend_next_practice(student_id=student_id)
        return rec
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
