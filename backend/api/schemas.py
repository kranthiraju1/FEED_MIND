from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class FeedbackCreate(BaseModel):
    student_name: str = Field(min_length=2, max_length=255)
    hall_ticket: str = Field(min_length=3, max_length=100)
    department: str = Field(min_length=2, max_length=120)
    year: int = Field(ge=1, le=6)
    category: str = Field(min_length=2, max_length=100)
    rating: int = Field(ge=1, le=5)
    feedback_message: str = Field(min_length=5, max_length=5000)
    created_at: datetime | None = None


class FeedbackRead(BaseModel):
    id: int
    feedback_id: str
    student_name: str
    hall_ticket: str
    department: str
    year: int
    category: str
    rating: int
    feedback_message: str
    created_at: datetime
    ingested_at: datetime | None = None
    sentiment_label: str | None = None
    confidence_score: float | None = None
    emotion: str | None = None

    class Config:
        from_attributes = True


class AlertRead(BaseModel):
    id: int
    alert_type: str
    threshold_value: float
    actual_value: float
    window_start: datetime
    window_end: datetime
    post_count: int
    triggered_at: datetime | None = None
    details: dict[str, Any]

    class Config:
        from_attributes = True
