"""
Direct Vector Knowledge Base & Slide Explorer Endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from src.rag.retriever import CourseRetriever, LECTURE_COLLECTION, EVAL_COLLECTION, REFERENCE_COLLECTION
from backend.app.core.config import settings

router = APIRouter(prefix="/knowledge", tags=["Knowledge"])

course_retriever = CourseRetriever(collection_name=LECTURE_COLLECTION)
ref_retriever = CourseRetriever(collection_name=REFERENCE_COLLECTION)
eval_retriever = CourseRetriever(collection_name=EVAL_COLLECTION)


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    chapter_filter: Optional[int] = None
    category_filter: Optional[str] = None
    collection: Optional[str] = "nlp_course_kb"  # "nlp_course_kb", "reference_kb", "hierarchical"


@router.get("/stats")
async def get_stats():
    try:
        lecture_count = course_retriever.collection.count()
        ref_count = ref_retriever.collection.count()
        eval_count = eval_retriever.collection.count()
        total_count = lecture_count + ref_count + eval_count

        return {
            "total_chunks": total_count,
            "lecture_chunks": lecture_count,
            "reference_chunks": ref_count,
            "eval_chunks": eval_count,
            "collections": {
                "nlp_course_kb": lecture_count,
                "reference_kb": ref_count,
                "instructor_eval_kb": eval_count
            },
            "embed_model": settings.EMBED_MODEL,
            "vector_dimension": 2560,
            "metric": "calibrated_cosine_similarity"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search")
async def search_knowledge_base(req: SearchRequest):
    try:
        if req.collection == "reference_kb":
            results = ref_retriever.retrieve(
                query=req.query,
                top_k=req.top_k,
                chapter=req.chapter_filter,
                category=req.category_filter
            )
        elif req.collection == "hierarchical":
            h_res = course_retriever.retrieve_hierarchical(
                query=req.query,
                lecture_top_k=req.top_k,
                reference_top_k=max(2, req.top_k // 2)
            )
            results = h_res["all"]
        else:
            results = course_retriever.retrieve(
                query=req.query,
                top_k=req.top_k,
                chapter=req.chapter_filter,
                category=req.category_filter
            )

        return {
            "query": req.query,
            "collection": req.collection,
            "results_count": len(results),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
