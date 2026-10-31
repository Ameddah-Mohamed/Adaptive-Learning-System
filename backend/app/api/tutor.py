"""
Tutor Chat API Endpoints with grounding, multi-turn memory, and streaming support.
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import ollama

from src.rag.retriever import CourseRetriever
from src.models.prompts import TUTOR_SYSTEM_PROMPT, TUTOR_USER_PROMPT
from backend.app.core.config import settings
from src.learner.db import LearningDatabase

router = APIRouter(prefix="/tutor", tags=["Tutor"])

retriever = CourseRetriever()
db = LearningDatabase()


class ChatRequest(BaseModel):
    question: str
    model: Optional[str] = None
    chapter_filter: Optional[int] = None
    category_filter: Optional[str] = None
    top_k: int = 3
    session_id: Optional[str] = "default_session"
    student_id: Optional[str] = "default_student"


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
    session_id: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
async def ask_tutor(req: ChatRequest):
    try:
        model_name = req.model or settings.DEFAULT_LLM
        session_id = req.session_id or "default_session"
        student_id = req.student_id or "default_student"

        # 1. Retrieve course context
        retrieved = retriever.retrieve(
            query=req.question,
            top_k=req.top_k,
            chapter=req.chapter_filter,
            category=req.category_filter
        )
        context_str = retriever.format_context_for_prompt(retrieved)

        # 2. Fetch recent conversation history from SQLite for multi-turn awareness
        history = db.get_chat_history(session_id=session_id, limit=6)

        user_message = TUTOR_USER_PROMPT.format(
            context=context_str if context_str else "*(No specific slides retrieved, rely on core NLP curriculum)*",
            question=req.question
        )

        messages = [{"role": "system", "content": TUTOR_SYSTEM_PROMPT}]
        for past_msg in history:
            messages.append({"role": past_msg["role"], "content": past_msg["content"]})
        messages.append({"role": "user", "content": user_message})

        # 3. Query LLM
        res = ollama.chat(
            model=model_name,
            messages=messages,
            options={"temperature": 0.2, "top_p": 0.9}
        )

        answer_content = res["message"]["content"]

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

        citations_dicts = [c.dict() for c in citations]

        # 4. Persist multi-turn conversation in SQLite
        db.add_chat_message(session_id, "user", req.question, student_id=student_id)
        db.add_chat_message(session_id, "assistant", answer_content, citations=citations_dicts, student_id=student_id)

        # 5. Record learning activity event
        db.record_learning_event(
            student_id=student_id,
            kind="tutor",
            chapter=req.chapter_filter,
            topic=None,
            score=None,
            max_score=None,
            passed=True,
            details={"question": req.question[:120], "citations_count": len(citations)}
        )

        return ChatResponse(
            question=req.question,
            answer=answer_content,
            citations=citations,
            session_id=session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/stream")
async def ask_tutor_stream(req: ChatRequest):
    """
    Streams tokens in Server-Sent Events (SSE) format with multi-turn history.
    """
    try:
        model_name = req.model or settings.DEFAULT_LLM
        session_id = req.session_id or "default_session"
        student_id = req.student_id or "default_student"

        retrieved = retriever.retrieve(
            query=req.question,
            top_k=req.top_k,
            chapter=req.chapter_filter,
            category=req.category_filter
        )
        context_str = retriever.format_context_for_prompt(retrieved)

        history = db.get_chat_history(session_id=session_id, limit=6)

        user_message = TUTOR_USER_PROMPT.format(
            context=context_str if context_str else "*(No specific slides retrieved, rely on core NLP curriculum)*",
            question=req.question
        )

        messages = [{"role": "system", "content": TUTOR_SYSTEM_PROMPT}]
        for past_msg in history:
            messages.append({"role": past_msg["role"], "content": past_msg["content"]})
        messages.append({"role": "user", "content": user_message})

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
            # Send citations first
            yield f"event: citations\ndata: {json.dumps(citations_data)}\n\n"

            accumulated_tokens = []
            stream = ollama.chat(
                model=model_name,
                messages=messages,
                stream=True,
                options={"temperature": 0.2, "top_p": 0.9}
            )
            for chunk in stream:
                content = chunk.get("message", {}).get("content", "")
                if content:
                    accumulated_tokens.append(content)
                    yield f"event: token\ndata: {json.dumps({'token': content})}\n\n"

            yield "event: done\ndata: {}\n\n"

            # Persist dialogue on stream completion
            full_response = "".join(accumulated_tokens)
            if full_response:
                try:
                    db.add_chat_message(session_id, "user", req.question, student_id=student_id)
                    db.add_chat_message(session_id, "assistant", full_response, citations=citations_data, student_id=student_id)
                    db.record_learning_event(
                        student_id=student_id,
                        kind="tutor",
                        chapter=req.chapter_filter,
                        topic=None,
                        score=None,
                        max_score=None,
                        passed=True,
                        details={"question": req.question[:120]}
                    )
                except Exception:
                    pass

        return StreamingResponse(event_stream(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_chat_history(
    session_id: str = Query("default_session"),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Returns the recent multi-turn chat message history for the session.
    """
    try:
        history = db.get_chat_history(session_id=session_id, limit=limit)
        return {"session_id": session_id, "messages": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
