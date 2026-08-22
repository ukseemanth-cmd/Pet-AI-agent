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


def test_companion_profile_endpoints():
    # 1. Get companion profile
    get_res = client.get("/api/companion/profile")
    assert get_res.status_code == 200
    profile = get_res.json()
    assert "pet_type" in profile
    assert "personality" in profile
    assert "theme" in profile
    assert "accessories" in profile

    # 2. Update companion profile (choose Fox, name Blaze, ambitious personality)
    put_res = client.put(
        "/api/companion/profile",
        json={
            "pet_type": "fox",
            "pet_name": "Blaze",
            "personality": "strict",
            "theme": "sunset",
            "accessories": ["glasses", "dev_badge"],
            "onboarding_done": True,
        }
    )
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["pet_type"] == "fox"
    assert updated["pet_name"] == "Blaze"
    assert updated["personality"] == "strict"
    assert updated["theme"] == "sunset"
    assert "glasses" in updated["accessories"]
    assert updated["onboarding_done"] is True

    # 3. Verify /api/pet returns unified companion data
    pet_res = client.get("/api/pet")
    assert pet_res.status_code == 200
    pet_data = pet_res.json()
    assert pet_data["pet"]["name"] == "Blaze"
    assert pet_data["pet"]["pet_type"] == "fox"
    assert pet_data["pet"]["personality"] == "strict"
    assert pet_data["pet"]["theme"] == "sunset"
    assert "glasses" in pet_data["pet"]["accessories"]
    assert pet_data["pet"]["onboarding_done"] is True

