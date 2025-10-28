# tests/test_async_generation.py (OPTIONAL - unit tests)

import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_generate_plans_async():
    """Test async plan generation endpoint"""
    response = client.post(
        "/generate-plans",
        json={
            "user_id": "test-user-123",
            "quiz_result_id": "test-quiz-456",
            "answers": {
                "age": 30,
                "gender": "Male",
                "height": {"cm": 180},
                "currentWeight": {"kg": 80},
                "targetWeight": {"kg": 75},
                # ... other required fields
            },
            "ai_provider": "openai",
            "model_name": "gpt-4o-mini"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "calculations" in data
    assert "macros" in data
    assert data["meal_plan_status"] == "generating"
    assert data["workout_plan_status"] == "generating"


def test_plan_status_endpoint():
    """Test plan status checking endpoint"""
    response = client.get("/plan-status/test-user-123")
    
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        data = response.json()
        assert "meal_plan_status" in data
        assert "workout_plan_status" in data


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ai_providers" in data