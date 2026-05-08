from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from redis.asyncio import Redis
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.schemas import AlertRead, FeedbackCreate
from backend.database.redis_client import get_redis_client
from backend.database.session import get_db
from backend.models.feedback import FeedbackAlert, FeedbackPost, SentimentAnalysis
from backend.services.aggregator import get_aggregate, get_alerts, get_distribution, get_recent_feedback
from backend.services.streaming import publish_to_stream
from backend.websocket.manager import manager

router = APIRouter(prefix="/api", tags=["FeedMind"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db), redis_client: Redis = Depends(get_redis_client)):
    db_ok = True
    redis_ok = True
    try:
        await db.execute(select(1))
    except Exception:
        db_ok = False
    try:
        await redis_client.ping()
    except Exception:
        redis_ok = False
    return {"status": "ok" if db_ok and redis_ok else "degraded", "database": db_ok, "redis": redis_ok}


@router.post("/feedback")
async def submit_feedback(payload: FeedbackCreate, db: AsyncSession = Depends(get_db), redis_client: Redis = Depends(get_redis_client)):
    feedback_id = f"fb_{uuid4().hex}"
    created_at = payload.created_at or datetime.now(timezone.utc)
    feedback = FeedbackPost(
        feedback_id=feedback_id,
        student_name=payload.student_name,
        hall_ticket=payload.hall_ticket,
        department=payload.department,
        year=payload.year,
        category=payload.category,
        rating=payload.rating,
        feedback_message=payload.feedback_message,
        created_at=created_at,
    )
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)

    stream_payload = {
        "feedback_id": feedback_id,
        "student_name": payload.student_name,
        "hall_ticket": payload.hall_ticket,
        "department": payload.department,
        "year": str(payload.year),
        "category": payload.category,
        "rating": str(payload.rating),
        "feedback_message": payload.feedback_message,
        "created_at": created_at.isoformat(),
    }
    message_id = await publish_to_stream(redis_client, "feedback_stream", stream_payload)
    await manager.broadcast_json({"event": "new_feedback", "feedback_id": feedback_id, "message_id": message_id, **stream_payload})
    return {"status": "queued", "feedback_id": feedback_id, "message_id": message_id}


@router.get("/feedbacks")
async def list_feedbacks(
    department: str | None = None,
    category: str | None = None,
    year: int | None = None,
    sentiment: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(FeedbackPost, SentimentAnalysis.sentiment_label, SentimentAnalysis.confidence_score, SentimentAnalysis.emotion)
        .join(SentimentAnalysis, SentimentAnalysis.feedback_id == FeedbackPost.feedback_id, isouter=True)
        .order_by(FeedbackPost.created_at.desc())
    )
    conditions = []
    if department:
        conditions.append(FeedbackPost.department == department)
    if category:
        conditions.append(FeedbackPost.category == category)
    if year:
        conditions.append(FeedbackPost.year == year)
    if sentiment:
        conditions.append(SentimentAnalysis.sentiment_label == sentiment)
    if start_date:
        conditions.append(FeedbackPost.created_at >= start_date)
    if end_date:
        conditions.append(FeedbackPost.created_at <= end_date)
    if conditions:
        query = query.where(and_(*conditions))
    query = query.limit(limit).offset(offset)
    rows = await db.execute(query)
    items = []
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
                "ingested_at": feedback.ingested_at.isoformat() if feedback.ingested_at else None,
                "sentiment_label": sentiment_label,
                "confidence_score": confidence_score,
                "emotion": emotion,
            }
        )
    return {"items": items, "limit": limit, "offset": offset}


@router.get("/sentiment/distribution")
async def sentiment_distribution(db: AsyncSession = Depends(get_db)):
    return await get_distribution(db)


@router.get("/sentiment/aggregate")
async def sentiment_aggregate(hours: int = Query(24, ge=1, le=168), db: AsyncSession = Depends(get_db)):
    return {"hours": hours, "series": await get_aggregate(db, hours=hours)}


@router.get("/alerts")
async def alerts(limit: int = Query(25, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    rows = await get_alerts(db, limit=limit)
    return {"items": [
        {
            "id": alert.id,
            "alert_type": alert.alert_type,
            "threshold_value": alert.threshold_value,
            "actual_value": alert.actual_value,
            "window_start": alert.window_start.isoformat(),
            "window_end": alert.window_end.isoformat(),
            "post_count": alert.post_count,
            "triggered_at": alert.triggered_at.isoformat() if alert.triggered_at else None,
            "details": alert.details,
        }
        for alert in rows
    ]}


@router.websocket("/ws/feedmind")
@router.websocket("/ws/sentiment")
async def feedmind_ws(websocket: WebSocket):
    # Log handshake headers to help debug 403/Origin issues
    try:
        origin = websocket.headers.get("origin")
        headers_list = [(k, v) for k, v in websocket.headers.items()]
        print(f"WebSocket handshake attempt - Origin: {origin}, Headers: {headers_list}")
    except Exception as exc:
        print(f"Failed to read websocket headers: {exc}")

    await manager.connect(websocket)
    await websocket.send_json({"event": "connection", "message": "connected", "channel": "feedmind"})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
