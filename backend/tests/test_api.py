import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["data"]["status"] == "healthy"


def test_dashboard_stats():
    response = client.get("/api/v1/dashboard/stats", headers={"X-Role": "admin"})
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert "today_executions" in data["data"]


def test_dashboard_stats_unauthorized():
    response = client.get("/api/v1/dashboard/stats")
    assert response.status_code == 401


def test_scripts_list():
    response = client.get("/api/v1/scripts", headers={"X-Role": "admin"})
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert "total" in data["data"]
    assert "items" in data["data"]


def test_nodes_list():
    response = client.get("/api/v1/nodes", headers={"X-Role": "admin"})
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200


def test_executions_list():
    response = client.get("/api/v1/executions", headers={"X-Role": "admin"})
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200