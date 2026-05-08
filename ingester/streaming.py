from redis.asyncio import Redis


async def publish_to_stream(redis_client: Redis, stream_name: str, payload: dict[str, str]) -> str:
    message_id = await redis_client.xadd(stream_name, payload)
    return str(message_id)


def get_redis_client() -> Redis:
    from redis.asyncio import from_url
    from config import settings
    return from_url(settings.redis_url, decode_responses=True)
