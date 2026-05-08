from __future__ import annotations

import asyncio
import logging
import random
import uuid
from datetime import datetime, timezone

from redis.asyncio import Redis

from config import settings
from streaming import get_redis_client, publish_to_stream

logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = logging.getLogger("feedmind.ingester")

POSITIVE_TEMPLATES = [
    "Faculty teaching is excellent and very clear.",
    "The library support has been amazing this semester.",
    "Placement training sessions are very useful and well organized.",
    "Campus cleanliness has improved a lot and it feels great.",
    "The canteen service is quick and the food quality is good.",
]
NEUTRAL_TEMPLATES = [
    "WiFi is available across most of the hostel blocks.",
    "Lab sessions were conducted according to schedule.",
    "The semester timetable was shared on time.",
    "Transport services run twice in the morning and evening.",
    "The department announcement was posted today.",
]
NEGATIVE_TEMPLATES = [
    "WiFi speed in the hostel is very slow and unstable.",
    "Lab systems are outdated and need maintenance.",
    "The bus timings are irregular and cause delays.",
    "Some classroom projectors are broken and need attention.",
    "There is an issue with hostel water supply and hygiene.",
]

DEPARTMENTS = ["CSE", "ECE", "EEE", "IT", "MECH", "CIVIL", "MBA", "MCA"]
CATEGORIES = ["Faculty", "Labs", "Hostel", "WiFi", "Placements", "Canteen", "Transport", "Library", "Campus"]


class DataIngester:
    """Publishes simulated college feedback to Redis Streams."""

    def __init__(self, redis_client: Redis, stream_name: str, posts_per_minute: int = 60):
        self.redis_client = redis_client
        self.stream_name = stream_name
        self.posts_per_minute = max(1, posts_per_minute)
        self.delay_seconds = 60 / self.posts_per_minute

    def generate_post(self) -> dict[str, str]:
        sentiment_bucket = random.choices(["positive", "neutral", "negative"], weights=[40, 30, 30], k=1)[0]
        template_map = {
            "positive": POSITIVE_TEMPLATES,
            "neutral": NEUTRAL_TEMPLATES,
            "negative": NEGATIVE_TEMPLATES,
        }
        feedback_message = random.choice(template_map[sentiment_bucket])
        return {
            "feedback_id": f"demo_{uuid.uuid4().hex}",
            "student_name": random.choice(["Ananya", "Rahul", "Priya", "Arjun", "Meera", "Karan", "Sneha", "Vikram"]),
            "hall_ticket": f"HT{random.randint(20210000, 20249999)}",
            "department": random.choice(DEPARTMENTS),
            "year": str(random.randint(1, 4)),
            "category": random.choice(CATEGORIES),
            "rating": str(random.randint(1, 5)),
            "feedback_message": feedback_message,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    async def publish_post(self, post_data: dict[str, str]) -> bool:
        try:
            await publish_to_stream(self.redis_client, self.stream_name, post_data)
            logger.info("published feedback %s", post_data["feedback_id"])
            return True
        except Exception as exc:
            logger.exception("failed to publish feedback: %s", exc)
            return False

    async def start(self, duration_seconds: int | None = None) -> None:
        started = asyncio.get_event_loop().time()
        while True:
            if duration_seconds is not None and asyncio.get_event_loop().time() - started >= duration_seconds:
                break
            post = self.generate_post()
            await self.publish_post(post)
            await asyncio.sleep(self.delay_seconds)


async def main() -> None:
    """Start the feedback ingester."""
    redis_client = get_redis_client()
    ingester = DataIngester(redis_client, settings.redis_stream_name, posts_per_minute=int(settings.alert_min_posts))
    await ingester.start()


if __name__ == "__main__":
    asyncio.run(main())
