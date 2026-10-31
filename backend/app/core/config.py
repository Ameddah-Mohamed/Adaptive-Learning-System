"""
Backend Configuration Settings for NLP Course Adaptive Learning Platform.
"""

from pathlib import Path
from pydantic_settings import BaseSettings

PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    PROJECT_NAME: str = "ENSIA NLP Adaptive Learning System"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    
    # Models
    DEFAULT_LLM: str = "qwen3.5:latest"
    CODER_LLM: str = "qwen3.5:latest"
    EMBED_MODEL: str = "qwen3-embedding:4b"
    
    # Paths
    PROJECT_ROOT: Path = PROJECT_ROOT
    CHROMA_DIR: Path = PROJECT_ROOT / "data" / "chroma_db"
    CHUNKS_FILE: Path = PROJECT_ROOT / "data" / "processed" / "chunks" / "course_chunks.json"
    SFT_DIR: Path = PROJECT_ROOT / "data" / "sft"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000"
    ]


settings = Settings()
