from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.feedback import FeedbackAlert, FeedbackPost, SentimentAnalysis


async def get_distribution(session: AsyncSession) -> dict[str, int]:
    rows = await session.execute(
        select(SentimentAnalysis.sentiment_label, func.count()).group_by(SentimentAnalysis.sentiment_label)
    )
    counts = {"positive": 0, "negative": 0, "neutral": 0}
    for label, total in rows.all():
        counts[label] = int(total)
    return counts


async def get_aggregate(session: AsyncSession, hours: int = 24) -> list[dict[str, object]]:
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    rows = await session.execute(
        select(
            func.date_trunc("hour", FeedbackPost.created_at).label("bucket"),
            SentimentAnalysis.sentiment_label,
            func.count(),
        )
        .join(SentimentAnalysis, SentimentAnalysis.feedback_id == FeedbackPost.feedback_id)
        .where(FeedbackPost.created_at >= since)
        .group_by("bucket", SentimentAnalysis.sentiment_label)
        .order_by("bucket")
    )
    series: dict[str, dict[str, object]] = {}
    for bucket, label, total in rows.all():
        key = bucket.isoformat()
        series.setdefault(key, {"timestamp": key, "positive": 0, "negative": 0, "neutral": 0})
        series[key][label] = int(total)
    return list(series.values())


async def get_recent_feedback(session: AsyncSession, limit: int = 10) -> list[dict[str, object]]:
    rows = await session.execute(
        select(FeedbackPost, SentimentAnalysis.sentiment_label, SentimentAnalysis.confidence_score, SentimentAnalysis.emotion)
        .join(SentimentAnalysis, SentimentAnalysis.feedback_id == FeedbackPost.feedback_id, isouter=True)
        .order_by(FeedbackPost.created_at.desc())
        .limit(limit)
    )
    items: list[dict[str, object]] = []
    for feedback, sentiment_label, confidence_score, emotion in rows.all():
        items.append(
            {
                "id": feedback.id,
                "feedback_id": feedback.feedback_id,
                "student_name": feedback.student_name,
                "hall_ticket": feedback.hall_ticket,
                "department": feedback.department,
                "year": feedback.year,
                "category": feedback.category,
                "rating": feedback.rating,
                "feedback_message": feedback.feedback_message,
                "created_at": feedback.created_at.isoformat(),
                "sentiment_label": sentiment_label,
                "confidence_score": confidence_score,
                "emotion": emotion,
            }
        )
    return items


async def get_alerts(session: AsyncSession, limit: int = 25) -> list[FeedbackAlert]:
    rows = await session.execute(select(FeedbackAlert).order_by(FeedbackAlert.triggered_at.desc()).limit(limit))
    if hasattr(rows, "scalars"):
        return list(rows.scalars().all())
    return list(rows.all())
