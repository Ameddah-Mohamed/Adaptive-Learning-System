"""
Learning Database Module (Teammate 4 Task: SQLite Persistence).

TODO for Teammate 4:
1. Initialize SQLite database with WAL mode enabled.
2. Maintain tables: students, topics, concept_attempts, student_mastery, chat_history.
3. Persist and retrieve student learning events.

Refer to: docs/TEAM_DATA_HANDOFF_AND_TASKS_GUIDE.md
"""

import logging
import sqlite3
from pathlib import Path
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "learning_state.db"


class LearningDatabase:
    """Starter skeleton for Learning State Database."""

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = Path(db_path) if db_path else DEFAULT_DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("""
                CREATE TABLE IF NOT EXISTS student_profiles (
                    student_id TEXT PRIMARY KEY,
                    display_name TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS topic_mastery (
                    student_id TEXT,
                    topic TEXT,
                    mastery_score REAL DEFAULT 0.5,
                    PRIMARY KEY (student_id, topic)
                );
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS chat_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    student_id TEXT,
                    role TEXT,
                    content TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

    def ensure_student_profile(self, student_id: str, display_name: Optional[str] = None):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT OR IGNORE INTO student_profiles (student_id, display_name) VALUES (?, ?)",
                (student_id, display_name or student_id)
            )

    def ensure_chat_session(self, session_id: str, student_id: str):
        self.ensure_student_profile(student_id)

    def add_chat_message(self, session_id: str, student_id: str, role: str, content: str):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO chat_history (session_id, student_id, role, content) VALUES (?, ?, ?, ?)",
                (session_id, student_id, role, content)
            )

    def get_chat_history(self, session_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT role, content FROM chat_history WHERE session_id = ? ORDER BY id ASC LIMIT ?",
                (session_id, limit)
            )
            return [{"role": r, "content": c} for r, c in cursor.fetchall()]

    def get_all_mastery(self, student_id: str) -> Dict[str, float]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT topic, mastery_score FROM topic_mastery WHERE student_id = ?",
                (student_id,)
            )
            return {topic: score for topic, score in cursor.fetchall()}

    def get_topic_mastery(self, student_id: str, topic: str) -> float:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT mastery_score FROM topic_mastery WHERE student_id = ? AND topic = ?",
                (student_id, topic)
            )
            row = cursor.fetchone()
            return row[0] if row else 0.5

    def update_topic_mastery(self, student_id: str, topic: str, new_score: float):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO topic_mastery (student_id, topic, mastery_score) VALUES (?, ?, ?) "
                "ON CONFLICT(student_id, topic) DO UPDATE SET mastery_score = ?",
                (student_id, topic, new_score, new_score)
            )

    def record_learning_event(self, student_id: str, event_type: str, details: Dict[str, Any]):
        pass

    def get_recent_events(self, student_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        return []

    def reset_student_data(self, student_id: str):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM topic_mastery WHERE student_id = ?", (student_id,))
            conn.execute("DELETE FROM chat_history WHERE student_id = ?", (student_id,))
