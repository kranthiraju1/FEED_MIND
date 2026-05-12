import asyncio
import json
from typing import Any

from redis.asyncio import Redis


def _normalize_payload(payload: Any) -> dict[str, Any] | None:
    if isinstance(payload, dict):
        return payload
    if isinstance(payload, str):
        try:
            return json.loads(payload)
        except ValueError:
            return None
    return None


async def start_notification_listener(redis_client: Redis, manager: Any, channel: str) -> None:
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(channel)
    try:
        async for message in pubsub.listen():
            if message is None or message.get("type") != "message":
                continue
            data = message.get("data")
            if isinstance(data, bytes):
                data = data.decode("utf-8")
            payload = _normalize_payload(data)
            if not payload:
                continue
            try:
                await manager.broadcast_json(payload)
            except Exception:
                continue
            await asyncio.sleep(0)
    finally:
        try:
            await pubsub.unsubscribe(channel)
        except Exception:
            pass
