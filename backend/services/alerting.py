from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.feedback import FeedbackAlert, FeedbackPost, SentimentAnalysis

CRITICAL_KEYWORDS = {"unsafe", "harassment", "broken", "issue", "emergency"}


async def evaluate_alerts(session: AsyncSession, feedback_id: str, threshold_ratio: float, window_minutes: int, min_posts: int) -> list[FeedbackAlert]:
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(minutes=window_minutes)

    rows = await session.execute(
        select(SentimentAnalysis.sentiment_label, FeedbackPost.category, FeedbackPost.feedback_message)
        .join(FeedbackPost, FeedbackPost.feedback_id == SentimentAnalysis.feedback_id)
        .where(FeedbackPost.created_at >= window_start)
    )
    items = rows.all()
    if len(items) < min_posts:
        return []

    sentiment_counts = Counter(label for label, _, _ in items)
    negative_ratio = sentiment_counts.get("negative", 0) / max(len(items), 1)
    alerts: list[FeedbackAlert] = []

    if negative_ratio >= threshold_ratio:
        alert = FeedbackAlert(
            alert_type="high_negative_ratio",
            threshold_value=threshold_ratio,
            actual_value=negative_ratio,
            window_start=window_start,
            window_end=now,
            post_count=len(items),
            details={"feedback_id": feedback_id, "negative_ratio": negative_ratio},
        )
        session.add(alert)
        alerts.append(alert)

    category_counts = Counter(category for _, category, _ in items)
    for category, count in category_counts.items():
        if count >= max(min_posts, 5):
            alert = FeedbackAlert(
                alert_type="category_spike",
                threshold_value=float(min_posts),
                actual_value=float(count),
                window_start=window_start,
                window_end=now,
                post_count=len(items),
                details={"category": category, "count": count},
            )
            session.add(alert)
            alerts.append(alert)

    keyword_hits = [message for _, _, message in items if any(keyword in message.lower() for keyword in CRITICAL_KEYWORDS)]
    if keyword_hits:
        alert = FeedbackAlert(
            alert_type="critical_keyword",
            threshold_value=1.0,
            actual_value=float(len(keyword_hits)),
            window_start=window_start,
            window_end=now,
            post_count=len(items),
            details={"keywords": list(CRITICAL_KEYWORDS), "matches": keyword_hits[:5]},
        )
        session.add(alert)
        alerts.append(alert)

    if alerts:
        await session.commit()
        for alert in alerts:
            await session.refresh(alert)
    return alerts
