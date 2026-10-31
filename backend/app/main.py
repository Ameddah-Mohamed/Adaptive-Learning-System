"""
FastAPI Application Entry Point for NLP Adaptive Learning System.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.core.config import settings
from backend.app.api import tutor, quiz, evaluator, sandbox, knowledge, learner

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for ENSIA NLP Adaptive Learning & Automated Grading Platform"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(tutor.router, prefix=settings.API_PREFIX)
app.include_router(quiz.router, prefix=settings.API_PREFIX)
app.include_router(evaluator.router, prefix=settings.API_PREFIX)
app.include_router(sandbox.router, prefix=settings.API_PREFIX)
app.include_router(knowledge.router, prefix=settings.API_PREFIX)
app.include_router(learner.router, prefix=settings.API_PREFIX)

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/v1/models")
async def v1_models():
    """Satisfy model discovery probes from local AI dev tools/extensions."""
    return {
        "object": "list",
        "data": [
            {"id": settings.DEFAULT_LLM, "object": "model", "owned_by": "ollama"}
        ]
    }

# Serve Frontend static assets if built
FRONTEND_DIST = settings.PROJECT_ROOT / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    async def root():
        return {
            "status": "online",
            "system": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "docs_url": "/docs"
        }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
