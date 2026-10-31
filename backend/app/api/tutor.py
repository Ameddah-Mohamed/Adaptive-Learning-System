"""
Tutor Chat API Endpoints with grounding and streaming support.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import ollama

from src.rag.retriever import CourseRetriever
from src.models.prompts import TUTOR_SYSTEM_PROMPT, TUTOR_USER_PROMPT
from backend.app.core.config import settings

router = APIRouter(prefix="/tutor", tags=["Tutor"])

retriever = CourseRetriever()


class ChatRequest(BaseModel):
    question: str
    model: Optional[str] = None
    chapter_filter: Optional[int] = None
    category_filter: Optional[str] = None
    top_k: int = 3


class CitationItem(BaseModel):
    citation: str
    document: str
    slide_num: Optional[int]
    relevance_score: float
    excerpt: str


class ChatResponse(BaseModel):
    question: str
    answer: str
    citations: List[CitationItem]


@router.post("/chat", response_model=ChatResponse)
async def ask_tutor(req: ChatRequest):
    try:
        model_name = req.model or settings.DEFAULT_LLM
        retrieved = retriever.retrieve(
            query=req.question,
            top_k=req.top_k,
            chapter=req.chapter_filter,
            category=req.category_filter
        )
        context_str = retriever.format_context_for_prompt(retrieved)
        
        user_message = TUTOR_USER_PROMPT.format(
            context=context_str if context_str else "*(No specific slides retrieved, rely on core NLP curriculum)*",
            question=req.question
        )
        
        messages = [
            {"role": "system", "content": TUTOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]
        
        res = ollama.chat(
            model=model_name,
            messages=messages,
            options={"temperature": 0.2, "top_p": 0.9}
        )
        
        citations = [
            CitationItem(
                citation=c["citation"],
                document=c["document"],
                slide_num=c["slide_num"],
                relevance_score=c["similarity_score"],
                excerpt=c["text"][:300]
            )
            for c in retrieved
        ]
        
        return ChatResponse(
            question=req.question,
            answer=res["message"]["content"],
            citations=citations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/stream")
async def ask_tutor_stream(req: ChatRequest):
    """
    Streams tokens in Server-Sent Events (SSE) format for ChatGPT-like UX.
    """
    try:
        model_name = req.model or settings.DEFAULT_LLM
        retrieved = retriever.retrieve(
            query=req.question,
            top_k=req.top_k,
            chapter=req.chapter_filter,
            category=req.category_filter
        )
        context_str = retriever.format_context_for_prompt(retrieved)
        
        user_message = TUTOR_USER_PROMPT.format(
            context=context_str if context_str else "*(No specific slides retrieved, rely on core NLP curriculum)*",
            question=req.question
        )
        
        messages = [
            {"role": "system", "content": TUTOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]
        
        citations_data = [
            {
                "citation": c["citation"],
                "document": c["document"],
                "slide_num": c["slide_num"],
                "relevance_score": c["similarity_score"],
                "excerpt": c["text"][:300]
            }
            for c in retrieved
        ]
        
        def event_stream():
            # First send citations event
            yield f"event: citations\ndata: {json.dumps(citations_data)}\n\n"
            
            # Stream tokens
            stream = ollama.chat(
                model=model_name,
                messages=messages,
                stream=True,
                options={"temperature": 0.2, "top_p": 0.9}
            )
            for chunk in stream:
                content = chunk.get("message", {}).get("content", "")
                if content:
                    yield f"event: token\ndata: {json.dumps({'token': content})}\n\n"
                    
            yield "event: done\ndata: {}\n\n"
            
        return StreamingResponse(event_stream(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
