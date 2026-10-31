"""
Learner Model & Adaptivity API Endpoints.
Exposes student mastery profiles, prerequisite tracking, and adaptive recommendations.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from src.learner.mastery import LearnerEngine

router = APIRouter(prefix="/learner", tags=["Learner Engine"])
engine = LearnerEngine()


class ResetRequest(BaseModel):
    student_id: Optional[str] = "default_student"


@router.get("/profile")
async def get_student_profile(student_id: str = Query("default_student")):
    """
    Returns the comprehensive student diagnostic profile:
    overall mastery %, topic breakdown, strengths, and priority focus areas.
    """
    try:
        profile = engine.get_diagnostic_profile(student_id=student_id)
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations")
async def get_practice_recommendations(student_id: str = Query("default_student")):
    """
    Returns dynamically recommended next practice topic and difficulty tier
    based on knowledge gaps, staleness, and prerequisite readiness.
    """
    try:
        rec = engine.recommend_next_practice(student_id=student_id)
        return rec
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/events")
async def get_learning_events(
    student_id: str = Query("default_student"),
    limit: int = Query(50, ge=1, le=200)
):
    """
    Returns the persistent history of student learning events (quizzes, code runs, grades).
    """
    try:
        events = engine.db.get_recent_events(student_id=student_id, limit=limit)
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset")
async def reset_learner_state(req: Optional[ResetRequest] = None):
    """
    Resets student progress to default initial baseline for testing.
    """
    student_id = req.student_id if req else "default_student"
    try:
        engine.db.reset_student_data(student_id=student_id)
        return {"status": "success", "message": f"Student '{student_id}' data reset."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
