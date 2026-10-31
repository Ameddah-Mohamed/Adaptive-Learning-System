"""
Direct Vector Knowledge Base & Slide Explorer Endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from src.rag.retriever import CourseRetriever
from backend.app.core.config import settings

router = APIRouter(prefix="/knowledge", tags=["Knowledge"])

retriever = CourseRetriever()


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    chapter_filter: Optional[int] = None
    category_filter: Optional[str] = None


@router.get("/stats")
async def get_stats():
    try:
        count = retriever.collection.count()
        return {
            "total_chunks": count,
            "embed_model": settings.EMBED_MODEL,
            "vector_dimension": 2560,
            "metric": "calibrated_cosine_similarity"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search")
async def search_knowledge_base(req: SearchRequest):
    try:
        results = retriever.retrieve(
            query=req.query,
            top_k=req.top_k,
            chapter=req.chapter_filter,
            category=req.category_filter
        )
        return {
            "query": req.query,
            "results_count": len(results),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
