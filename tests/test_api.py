"""
Integration tests for FastAPI endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}


def test_v1_models_discovery_endpoint(client):
    res = client.get("/v1/models")
    assert res.status_code == 200
    data = res.json()
    assert "data" in data
    assert any(m.get("id") == "qwen3.5:latest" for m in data["data"])


def test_sandbox_tasks_catalog(client):
    res = client.get("/api/sandbox/tasks")
    assert res.status_code == 200
    tasks = res.json()
    assert len(tasks) == 3
    task_ids = {t["id"] for t in tasks}
    assert "task_01_bpe" in task_ids
    assert "task_02_attention" in task_ids
    assert "task_03_perplexity" in task_ids


def test_sandbox_run_perplexity_api(client):
    code = """
import math
def compute_perplexity(log_probabilities, N):
    cross_entropy = - (1.0 / N) * sum(log_probabilities)
    return math.exp(cross_entropy)
"""
    res = client.post("/api/sandbox/run", json={
        "task_id": "task_03_perplexity",
        "code": code,
        "request_ai_diagnosis": False
    })
    assert res.status_code == 200
    payload = res.json()
    assert "execution" in payload
    assert payload["execution"]["success"] is True
    assert payload["execution"]["passed"] == 2
    assert payload["execution"]["total"] == 2


def test_sandbox_run_security_violation_api(client):
    code = "import os; os.system('echo hack')"
    res = client.post("/api/sandbox/run", json={
        "task_id": "task_03_perplexity",
        "code": code,
        "request_ai_diagnosis": False
    })
    assert res.status_code == 200
    payload = res.json()
    assert payload["execution"]["success"] is False
    assert "Security" in payload["execution"]["output"]
