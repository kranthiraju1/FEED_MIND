import pytest

from backend.services.streaming import ensure_consumer_group, publish_to_stream


class FakeRedis:
    def __init__(self):
        self.messages = []
        self.groups = []

    async def xadd(self, stream_name, payload):
        self.messages.append((stream_name, payload))
        return f"{len(self.messages)}-0"

    async def xgroup_create(self, name, groupname, id, mkstream=False):
        self.groups.append((name, groupname))
        return True


@pytest.mark.asyncio
async def test_publish_to_stream():
    redis = FakeRedis()
    message_id = await publish_to_stream(redis, "test_stream", {"key": "value"})
    assert message_id == "1-0"
    assert len(redis.messages) == 1


@pytest.mark.asyncio
async def test_ensure_consumer_group():
    redis = FakeRedis()
    await ensure_consumer_group(redis, "feedback_stream", "feedmind_workers")
    assert len(redis.groups) == 1
