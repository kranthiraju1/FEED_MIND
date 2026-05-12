from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.feedback import FeedbackAlert, FeedbackPost, SentimentAnalysis


def _format_alert_notification(alert: FeedbackAlert) -> dict[str, object]:
    severity = "critical" if "critical" in alert.alert_type else "warning" if "negative" in alert.alert_type else "info"
    title = {
        "high_negative_ratio": "Negative Sentiment Spike",
        "category_spike": "Category Activity Surge",
        "critical_keyword": "Critical Complaint Detected",
    }.get(alert.alert_type, "Feedback Alert")
    return {
        "id": f"alert_{alert.id}",
        "type": "alert",
        "severity": severity,
        "title": title,
        "summary": f"{alert.post_count} posts triggered {alert.alert_type.replace('_', ' ')}.",
        "details": alert.details,
        "timestamp": alert.triggered_at.isoformat() if alert.triggered_at else datetime.now().isoformat(),
    }


def _format_feedback_notification(feedback: FeedbackPost, sentiment_label: str | None, emotion: str | None) -> dict[str, object]:
    return {
        "id": feedback.feedback_id,
        "type": "feedback",
        "severity": sentiment_label == "negative" and "warning" or sentiment_label == "positive" and "success" or "info",
        "title": "New Student Feedback",
        "summary": f"{feedback.department} {feedback.section} • {feedback.faculty_name} • {sentiment_label or 'pending'}",
        "details": {
            "student_name": feedback.student_name,
            "subject": feedback.subject,
            "reported_emotion": feedback.reported_emotion,
            "sentiment_emotion": emotion,
        },
        "timestamp": feedback.created_at.isoformat(),
    }


async def get_notifications(session: AsyncSession, limit: int = 25) -> list[dict[str, object]]:
    alert_rows = await session.execute(select(FeedbackAlert).order_by(FeedbackAlert.triggered_at.desc()).limit(limit))
    alerts = [row for row in alert_rows.scalars().all()]

    feedback_rows = await session.execute(
        select(FeedbackPost, SentimentAnalysis.sentiment_label, SentimentAnalysis.emotion)
        .join(SentimentAnalysis, SentimentAnalysis.feedback_id == FeedbackPost.feedback_id, isouter=True)
        .order_by(FeedbackPost.created_at.desc())
        .limit(limit)
    )
    notifications: list[dict[str, object]] = [
        _format_alert_notification(alert)
        for alert in alerts
    ]
    for feedback, sentiment_label, emotion in feedback_rows.all():
        notifications.append(_format_feedback_notification(feedback, sentiment_label, emotion))

    notifications.sort(key=lambda item: item["timestamp"], reverse=True)
    return notifications[:limit]
