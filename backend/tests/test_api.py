"""Integration tests for FastAPI endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, SessionLocal
from app.seed import seed_if_empty

client = TestClient(app)


def setup_module():
    init_db()
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "Productivity Pet"
    assert data["status"] == "running"


def test_pet_endpoint():
    response = client.get("/api/pet")
    assert response.status_code == 200
    data = response.json()
    assert "pet" in data
    assert data["pet"]["name"] == "Nova"
    assert "user_xp" in data
    assert "user_level" in data


def test_task_crud_and_complete():
    # 1. Create task
    create_res = client.post(
        "/api/tasks",
        json={"title": "Test AI Pipeline", "difficulty": "hard", "estimated_minutes": 45}
    )
    assert create_res.status_code == 200
    task = create_res.json()
    assert task["title"] == "Test AI Pipeline"
    assert task["difficulty"] == "hard"
    assert task["xp_reward"] == 35
    task_id = task["id"]

    # 2. Complete task
    complete_res = client.post(f"/api/tasks/{task_id}/complete")
    assert complete_res.status_code == 200
    res_data = complete_res.json()
    assert res_data["xp_earned"] == 35
    assert "new_total_xp" in res_data
    assert "pet_state" in res_data


def test_agent_chat_endpoint():
    response = client.post(
        "/api/agent/chat",
        json={"message": "I need to finish my ML project."}
    )
    assert response.status_code == 200
    data = response.json()
    assert "intent" in data
    assert "message" in data
    assert "pet_state" in data
