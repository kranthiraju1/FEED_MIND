from redis.asyncio import Redis
from redis.exceptions import ResponseError


async def ensure_consumer_group(redis_client: Redis, stream_name: str, consumer_group: str) -> None:
    try:
        await redis_client.xgroup_create(name=stream_name, groupname=consumer_group, id="0-0", mkstream=True)
    except ResponseError as exc:
        if "BUSYGROUP" not in str(exc):
            raise


async def publish_to_stream(redis_client: Redis, stream_name: str, payload: dict[str, str]) -> str:
    message_id = await redis_client.xadd(stream_name, payload)
    return str(message_id)
