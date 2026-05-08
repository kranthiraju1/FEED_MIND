import pytest
from fastapi.testclient import TestClient

import backend.main as main_module
from backend.api.routes import router
from backend.database.redis_client import get_redis_client
from backend.database.session import get_db


class FakeResult:
    def all(self):
        return []


class FakeDb:
    def __init__(self):
        self.added = []

    async def execute(self, _query):
        return FakeResult()

    def add(self, obj):
        self.added.append(obj)

    async def commit(self):
        return None

    async def refresh(self, _obj):
        return None


class FakeRedis:
    def __init__(self):
        self.messages = []

    async def ping(self):
        return True

    async def xgroup_create(self, *args, **kwargs):
        return True

    async def xadd(self, stream_name, payload):
        self.messages.append((stream_name, payload))
        return "1-0"


@pytest.fixture()
def client():
    fake_redis = FakeRedis()
    fake_db = FakeDb()

    async def override_db():
        yield fake_db

    def override_redis():
        return fake_redis

    async def noop_async():
        return None

    main_module.init_db = noop_async
    main_module.close_redis_client = noop_async
    main_module.dispose_engine = noop_async
    main_module.get_redis_client = lambda: fake_redis

    main_module.app.dependency_overrides[get_db] = override_db
    main_module.app.dependency_overrides[get_redis_client] = override_redis

    with TestClient(main_module.app) as test_client:
        yield test_client, fake_db, fake_redis


def test_health_endpoint(client):
    test_client, _, _ = client
    response = test_client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] is True
    assert body["redis"] is True


def test_feedback_submission(client, monkeypatch):
    test_client, fake_db, fake_redis = client
    async def fake_publish(redis_client, stream_name, payload):
        return "1-0"

    monkeypatch.setattr("backend.api.routes.publish_to_stream", fake_publish)

    response = test_client.post(
        "/api/feedback",
        json={
            "student_name": "Ananya",
            "hall_ticket": "HT2023001",
            "department": "CSE",
            "year": 3,
            "category": "Faculty",
            "rating": 5,
            "feedback_message": "Faculty teaching is excellent and very helpful.",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "queued"
    assert payload["feedback_id"].startswith("fb_")
    assert fake_db.added
    assert fake_redis.messages == []
