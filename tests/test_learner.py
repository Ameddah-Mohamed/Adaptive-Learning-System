"""
Unit and Integration Tests for Phase 2: Core Adaptivity & Learner Engine.
"""

import pytest
from fastapi.testclient import TestClient
from src.learner.db import LearningDatabase
from src.learner.mastery import LearnerEngine
from backend.app.main import app


@pytest.fixture
def mem_db():
    return LearningDatabase(":memory:")


@pytest.fixture
def engine(mem_db):
    return LearnerEngine(mem_db)


@pytest.fixture
def client():
    return TestClient(app)


def test_db_initialization_and_preseeding(mem_db):
    student_id = "test_student"
    mem_db.ensure_student_profile(student_id, "Test User")
    mastery = mem_db.get_all_mastery(student_id)
    assert len(mastery) == 15
    assert all(m["mastery_score"] == 0.20 for m in mastery)


def test_chat_history_multiturn(mem_db):
    session_id = "session_abc"
    mem_db.add_chat_message(session_id, "user", "What is perplexity?")
    mem_db.add_chat_message(session_id, "assistant", "Perplexity is exp(cross-entropy).")
    mem_db.add_chat_message(session_id, "user", "How does smoothing affect it?")
    
    history = mem_db.get_chat_history(session_id)
    assert len(history) == 3
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "assistant"
    assert history[2]["content"] == "How does smoothing affect it?"


def test_mastery_knowledge_tracing_updates(engine):
    student = "student_tracer"
    # Initial state
    all_init = engine.db.get_all_mastery(student)
    ch3 = [t for t in all_init if t["chapter"] == 3][0]
    assert ch3["mastery_score"] == 0.20
    
    # 1. Successful quiz on intermediate topic
    res_success = engine.update_from_quiz_attempt(
        student_id=student,
        chapter=3,
        topic=ch3["topic"],
        difficulty="intermediate",
        is_correct=True,
        score=1.0,
        max_score=1.0
    )
    assert res_success["new_mastery"] > 0.20
    assert res_success["new_confidence"] > 0.10
    
    # 2. Failed quiz on advanced topic
    res_fail = engine.update_from_quiz_attempt(
        student_id=student,
        chapter=9,
        topic="Self-Attention and Multi-Head Attention",
        difficulty="advanced",
        is_correct=False,
        score=0.0,
        max_score=1.0
    )
    assert res_fail["new_mastery"] < 0.20


def test_adaptive_recommendation_and_prerequisites(engine):
    student = "student_rec"
    rec = engine.recommend_next_practice(student)
    # With all topics at 0.20, Ch 1 (Foundations) should be recommended
    assert rec["chapter"] == 1
    assert rec["recommended_difficulty"] == "beginner"
    
    # Now simulate mastering Chapter 1
    engine.update_from_quiz_attempt(student, 1, "Introduction to NLP and Language Structure", "beginner", is_correct=True, score=1.0)
    engine.update_from_quiz_attempt(student, 1, "Introduction to NLP and Language Structure", "intermediate", is_correct=True, score=1.0)
    
    rec_after = engine.recommend_next_practice(student)
    # Next should be Chapter 2 or another high priority need
    assert rec_after["chapter"] in (2, 3, 4, 18)


def test_code_sandbox_mastery_integration(engine):
    student = "student_coder"
    # Pass BPE tokenizer code
    res = engine.update_from_code_run(
        student_id=student,
        task_id="task_01_bpe",
        passed_tests=2,
        total_tests=2,
        is_success=True
    )
    assert res is not None
    assert res["chapter"] == 2
    assert res["new_mastery"] > 0.20


def test_diagnostic_scorecard(engine):
    student = "student_diag"
    engine.update_from_quiz_attempt(student, 2, "Byte-Pair Encoding (BPE) & Edit Distance", "intermediate", True)
    engine.update_from_code_run(student, "task_03_perplexity", 2, 2, True)
    
    diag = engine.get_diagnostic_profile(student)
    assert diag["overall_mastery_pct"] > 0
    assert diag["activity_counts"]["quizzes_taken"] == 1
    assert diag["activity_counts"]["code_runs"] == 1
    assert len(diag["chapter_breakdown"]) == 15


# --- API Endpoint Integration Tests ---

def test_api_learner_profile(client):
    res = client.get("/api/learner/profile?student_id=test_api_student")
    assert res.status_code == 200
    data = res.json()
    assert "overall_mastery_pct" in data
    assert "chapter_breakdown" in data
    assert len(data["chapter_breakdown"]) == 15


def test_api_learner_recommendations(client):
    res = client.get("/api/learner/recommendations?student_id=test_api_student")
    assert res.status_code == 200
    data = res.json()
    assert "chapter" in data
    assert "recommended_difficulty" in data
    assert "reason" in data


def test_api_quiz_submit_and_mastery_update(client):
    res = client.post("/api/quiz/submit", json={
        "chapter": 3,
        "topic": "Language Modeling and Perplexity",
        "difficulty": "intermediate",
        "selected_answer": "B",
        "correct_answer": "B",
        "points": 1.0,
        "student_id": "api_quiz_student"
    })
    assert res.status_code == 200
    payload = res.json()
    assert payload["is_correct"] is True
    assert payload["awarded_points"] == 1.0
    assert "mastery_update" in payload
    assert payload["mastery_update"]["new_mastery"] > 0.20
    assert "next_recommendation" in payload


def test_api_tutor_history(client):
    res = client.get("/api/tutor/history?session_id=api_test_session")
    assert res.status_code == 200
    assert "messages" in res.json()


def test_api_sandbox_run_updates_mastery(client):
    valid_perp = """
import math
def compute_perplexity(log_probabilities, N):
    cross_entropy = - (1.0 / N) * sum(log_probabilities)
    return math.exp(cross_entropy)
"""
    res = client.post("/api/sandbox/run", json={
        "task_id": "task_03_perplexity",
        "code": valid_perp,
        "request_ai_diagnosis": False,
        "student_id": "sandbox_student"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["execution"]["success"] is True
    assert "mastery_update" in data
    assert data["mastery_update"] is not None
    assert data["mastery_update"]["chapter"] == 3
