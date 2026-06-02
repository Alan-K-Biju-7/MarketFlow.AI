from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root_healthcheck():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_analyze_rejects_invalid_url():
    response = client.post(
        "/analyze",
        json={"url": "not-a-url", "tonePreset": "auto"},
    )

    assert response.status_code == 422


def test_analyze_rejects_localhost_url():
    response = client.post(
        "/analyze",
        json={"url": "http://localhost:8000", "tonePreset": "auto"},
    )

    assert response.status_code == 422
