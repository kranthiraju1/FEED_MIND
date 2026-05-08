from __future__ import annotations

import asyncio
import logging

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import async_sessionmaker

from backend.config import settings
from backend.database.redis_client import get_redis_client
from backend.database.session import AsyncSessionLocal, init_db
from backend.services.sentiment_analyzer import SentimentAnalyzer
from backend.services.streaming import ensure_consumer_group
from processor import FeedbackProcessor

logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = logging.getLogger("feedmind.worker")


class SentimentWorker:
    def __init__(self, redis_client: Redis, session_maker: async_sessionmaker, stream_name: str, consumer_group: str, consumer_name: str = "worker-1"):
        self.redis_client = redis_client
        self.session_maker = session_maker
        self.stream_name = stream_name
        self.consumer_group = consumer_group
        self.consumer_name = consumer_name
        self.processor = FeedbackProcessor(session_maker, SentimentAnalyzer(model_type="local"))
        self.running = True

    async def start(self) -> None:
        await ensure_consumer_group(self.redis_client, self.stream_name, self.consumer_group)
        logger.info("worker started stream=%s group=%s", self.stream_name, self.consumer_group)
        while self.running:
            try:
                response = await self.redis_client.xreadgroup(
                    groupname=self.consumer_group,
                    consumername=self.consumer_name,
                    streams={self.stream_name: ">"},
                    count=10,
                    block=5000,
                )
                if not response:
                    continue
                for _, messages in response:
                    for message_id, payload in messages:
                        try:
                            result = await self.processor.process_message(payload)
                            await self.redis_client.xack(self.stream_name, self.consumer_group, message_id)
                            logger.info("processed %s sentiment=%s emotion=%s", result["feedback_id"], result["sentiment_label"], result["emotion"])
                        except Exception as exc:
                            logger.exception("failed to process message %s: %s", message_id, exc)
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                logger.exception("worker loop error: %s", exc)
                await asyncio.sleep(2)


async def main() -> None:
    await init_db()
    redis_client = get_redis_client()
    worker = SentimentWorker(redis_client, AsyncSessionLocal, settings.redis_stream_name, settings.redis_consumer_group)
    await worker.start()


if __name__ == "__main__":
    asyncio.run(main())
