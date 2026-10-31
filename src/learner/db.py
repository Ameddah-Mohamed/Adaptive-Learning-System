"""
SQLite Persistence Layer for the NLP Adaptive Learning System.
Stores student profiles, topic mastery states, learning activity logs,
and multi-turn chat sessions.
"""

import sqlite3
import json
import time
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "learning_state.db"

CURRICULUM_CHAPTERS = [
    {"chapter": 1, "title": "Introduction to NLP", "topic": "Introduction to NLP and Language Structure", "stage": "Foundations"},
    {"chapter": 2, "title": "Tokenization & Edit Distance", "topic": "Byte-Pair Encoding (BPE) & Edit Distance", "stage": "Foundations"},
    {"chapter": 3, "title": "Language Modeling", "topic": "Language Modeling and Perplexity", "stage": "Statistical NLP"},
    {"chapter": 4, "title": "Naive Bayes & Classification", "topic": "Naive Bayes with Laplace Smoothing", "stage": "Statistical NLP"},
    {"chapter": 5, "title": "Logistic Regression", "topic": "Logistic Regression and Gradient Descent", "stage": "Statistical NLP"},
    {"chapter": 6, "title": "Vector Semantics", "topic": "Vector Semantics and Cosine Similarity", "stage": "Neural NLP"},
    {"chapter": 7, "title": "Neural Networks", "topic": "Neural Networks and Backpropagation", "stage": "Neural NLP"},
    {"chapter": 8, "title": "RNNs & LSTMs", "topic": "Recurrent Neural Networks and LSTMs", "stage": "Neural NLP"},
    {"chapter": 9, "title": "The Transformer", "topic": "Self-Attention and Multi-Head Attention", "stage": "Transformers & LLMs"},
    {"chapter": 10, "title": "Large Language Models", "topic": "Large Language Models and Prompting", "stage": "Transformers & LLMs"},
    {"chapter": 11, "title": "Masked Language Models", "topic": "Masked Language Models (BERT) vs Causal (GPT)", "stage": "Transformers & LLMs"},
    {"chapter": 14, "title": "QA, IR & RAG", "topic": "Question Answering, Information Retrieval and RAG", "stage": "Applications"},
    {"chapter": 18, "title": "CFGs & CKY Parsing", "topic": "Chomsky Normal Form and CKY Parsing", "stage": "Parsing"},
    {"chapter": 19, "title": "Dependency Parsing", "topic": "Dependency Parsing and Dependency Grammars", "stage": "Parsing"},
    {"chapter": 20, "title": "Distributed Deep Learning", "topic": "Distributed Training and All-Reduce", "stage": "Appendix"}
]


class LearningDatabase:
    def __init__(self, db_path: Optional[Path | str] = None):
        if db_path is None:
            self.db_path = DEFAULT_DB_PATH
            self.db_path.parent.mkdir(parents=True, exist_ok=True)
            self._mem_conn = None
        elif str(db_path) == ":memory:":
            self.db_path = ":memory:"
            self._mem_conn = sqlite3.connect(":memory:", timeout=10.0, check_same_thread=False)
            self._mem_conn.row_factory = sqlite3.Row
            self._mem_conn.execute("PRAGMA foreign_keys=ON;")
        else:
            self.db_path = Path(db_path)
            self.db_path.parent.mkdir(parents=True, exist_ok=True)
            self._mem_conn = None
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        if self._mem_conn is not None:
            return self._mem_conn
        conn = sqlite3.connect(str(self.db_path), timeout=10.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            # 1. Students table
            conn.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
            """)

            # 2. Topic Mastery table
            conn.execute("""
            CREATE TABLE IF NOT EXISTS topic_mastery (
                student_id TEXT NOT NULL,
                chapter INTEGER NOT NULL,
                topic TEXT NOT NULL,
                short_title TEXT NOT NULL,
                stage TEXT NOT NULL,
                mastery_score REAL NOT NULL DEFAULT 0.20,
                confidence REAL NOT NULL DEFAULT 0.10,
                attempts_count INTEGER NOT NULL DEFAULT 0,
                success_count INTEGER NOT NULL DEFAULT 0,
                last_attempt_at REAL,
                PRIMARY KEY (student_id, chapter, topic),
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
            """)

            # 3. Learning Events (attempts, logs)
            conn.execute("""
            CREATE TABLE IF NOT EXISTS learning_events (
                id TEXT PRIMARY KEY,
                student_id TEXT NOT NULL,
                kind TEXT NOT NULL,
                chapter INTEGER,
                topic TEXT,
                score REAL,
                max_score REAL,
                passed BOOLEAN NOT NULL,
                details_json TEXT,
                timestamp REAL NOT NULL,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
            """)

            # 4. Chat Sessions & Multi-turn messages
            conn.execute("""
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id TEXT PRIMARY KEY,
                student_id TEXT NOT NULL,
                title TEXT,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
            """)

            conn.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                citations_json TEXT,
                timestamp REAL NOT NULL,
                FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
            )
            """)

            # Ensure default student exists
            self.ensure_student_profile("default_student", "ENSIA Student")

    def ensure_student_profile(self, student_id: str, name: str = "Student") -> str:
        now = time.time()
        with self._get_connection() as conn:
            conn.execute("""
            INSERT INTO students (id, name, created_at, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at
            """, (student_id, name, now, now))

            # Pre-seed curriculum topic mastery rows if student has none
            cur = conn.execute("SELECT COUNT(*) as cnt FROM topic_mastery WHERE student_id = ?", (student_id,))
            if cur.fetchone()["cnt"] == 0:
                for c in CURRICULUM_CHAPTERS:
                    conn.execute("""
                    INSERT INTO topic_mastery (
                        student_id, chapter, topic, short_title, stage,
                        mastery_score, confidence, attempts_count, success_count, last_attempt_at
                    ) VALUES (?, ?, ?, ?, ?, 0.20, 0.10, 0, 0, NULL)
                    """, (student_id, c["chapter"], c["topic"], c["title"], c["stage"]))
        return student_id

    # --- Topic Mastery Methods ---

    def get_all_mastery(self, student_id: str = "default_student") -> List[Dict[str, Any]]:
        self.ensure_student_profile(student_id)
        with self._get_connection() as conn:
            rows = conn.execute("""
            SELECT chapter, topic, short_title, stage, mastery_score, confidence,
                   attempts_count, success_count, last_attempt_at
            FROM topic_mastery
            WHERE student_id = ?
            ORDER BY chapter ASC
            """, (student_id,)).fetchall()
            return [dict(r) for r in rows]

    def get_topic_mastery(self, student_id: str, chapter: int, topic: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            row = conn.execute("""
            SELECT chapter, topic, short_title, stage, mastery_score, confidence,
                   attempts_count, success_count, last_attempt_at
            FROM topic_mastery
            WHERE student_id = ? AND chapter = ? AND topic = ?
            """, (student_id, chapter, topic)).fetchone()
            return dict(row) if row else None

    def update_topic_mastery(
        self,
        student_id: str,
        chapter: int,
        topic: str,
        new_mastery: float,
        new_confidence: float,
        is_success: bool
    ):
        self.ensure_student_profile(student_id)
        now = time.time()
        with self._get_connection() as conn:
            conn.execute("""
            UPDATE topic_mastery
            SET mastery_score = ?,
                confidence = ?,
                attempts_count = attempts_count + 1,
                success_count = success_count + ?,
                last_attempt_at = ?
            WHERE student_id = ? AND chapter = ? AND topic = ?
            """, (
                max(0.0, min(1.0, new_mastery)),
                max(0.0, min(1.0, new_confidence)),
                1 if is_success else 0,
                now,
                student_id,
                chapter,
                topic
            ))

    # --- Event Logging ---

    def record_learning_event(
        self,
        student_id: str,
        kind: str,
        chapter: Optional[int],
        topic: Optional[str],
        score: Optional[float],
        max_score: Optional[float],
        passed: bool,
        details: Optional[Dict[str, Any]] = None
    ) -> str:
        self.ensure_student_profile(student_id)
        event_id = str(uuid.uuid4())
        now = time.time()
        details_json = json.dumps(details) if details else None

        with self._get_connection() as conn:
            conn.execute("""
            INSERT INTO learning_events (
                id, student_id, kind, chapter, topic, score, max_score, passed, details_json, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event_id, student_id, kind, chapter, topic, score, max_score,
                passed, details_json, now
            ))
        return event_id

    def get_recent_events(self, student_id: str = "default_student", limit: int = 50) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            rows = conn.execute("""
            SELECT id, kind, chapter, topic, score, max_score, passed, details_json, timestamp
            FROM learning_events
            WHERE student_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
            """, (student_id, limit)).fetchall()
            results = []
            for r in rows:
                item = dict(r)
                if item.get("details_json"):
                    try:
                        item["details"] = json.loads(item["details_json"])
                    except Exception:
                        item["details"] = {}
                results.append(item)
            return results

    # --- Chat History & Multi-turn Session Methods ---

    def ensure_chat_session(self, session_id: str, student_id: str = "default_student", title: str = "Tutoring Session") -> str:
        self.ensure_student_profile(student_id)
        now = time.time()
        with self._get_connection() as conn:
            conn.execute("""
            INSERT INTO chat_sessions (id, student_id, title, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at
            """, (session_id, student_id, title, now, now))
        return session_id

    def add_chat_message(
        self,
        session_id: str,
        role: str,
        content: str,
        citations: Optional[List[Dict[str, Any]]] = None,
        student_id: str = "default_student"
    ) -> str:
        self.ensure_chat_session(session_id, student_id)
        msg_id = str(uuid.uuid4())
        now = time.time()
        citations_json = json.dumps(citations) if citations else None

        with self._get_connection() as conn:
            conn.execute("""
            INSERT INTO chat_messages (id, session_id, role, content, citations_json, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (msg_id, session_id, role, content, citations_json, now))
            conn.execute("UPDATE chat_sessions SET updated_at = ? WHERE id = ?", (now, session_id))
        return msg_id

    def get_chat_history(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            rows = conn.execute("""
            SELECT role, content, citations_json, timestamp
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY timestamp ASC
            LIMIT ?
            """, (session_id, limit)).fetchall()
            history = []
            for r in rows:
                msg = {
                    "role": r["role"],
                    "content": r["content"],
                    "timestamp": r["timestamp"]
                }
                if r["citations_json"]:
                    try:
                        msg["citations"] = json.loads(r["citations_json"])
                    except Exception:
                        msg["citations"] = []
                history.append(msg)
            return history

    def reset_student_data(self, student_id: str = "default_student"):
        with self._get_connection() as conn:
            conn.execute("DELETE FROM learning_events WHERE student_id = ?", (student_id,))
            conn.execute("DELETE FROM chat_messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE student_id = ?)", (student_id,))
            conn.execute("DELETE FROM chat_sessions WHERE student_id = ?", (student_id,))
            conn.execute("DELETE FROM topic_mastery WHERE student_id = ?", (student_id,))
            conn.execute("DELETE FROM students WHERE id = ?", (student_id,))
        self.ensure_student_profile(student_id)
