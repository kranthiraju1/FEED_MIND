from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.models.base import Base


class FeedbackPost(Base):
    __tablename__ = "feedback_posts"
    __table_args__ = (
        Index("ix_feedback_posts_feedback_id", "feedback_id", unique=True),
        Index("ix_feedback_posts_department", "department"),
        Index("ix_feedback_posts_category", "category"),
        Index("ix_feedback_posts_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    feedback_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    student_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hall_ticket: Mapped[str] = mapped_column(String(100), nullable=False)
    department: Mapped[str] = mapped_column(String(120), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    feedback_message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    analysis: Mapped[list["SentimentAnalysis"]] = relationship(back_populates="feedback", cascade="all, delete-orphan")


class SentimentAnalysis(Base):
    __tablename__ = "sentiment_analysis"
    __table_args__ = (
        Index("ix_sentiment_analysis_feedback_id", "feedback_id"),
        Index("ix_sentiment_analysis_analyzed_at", "analyzed_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    feedback_id: Mapped[str] = mapped_column(String(255), ForeignKey("feedback_posts.feedback_id", ondelete="CASCADE"), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    sentiment_label: Mapped[str] = mapped_column(String(20), nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    emotion: Mapped[str | None] = mapped_column(String(50), nullable=True)
    analyzed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    feedback: Mapped[FeedbackPost] = relationship(back_populates="analysis")


class FeedbackAlert(Base):
    __tablename__ = "feedback_alerts"
    __table_args__ = (Index("ix_feedback_alerts_triggered_at", "triggered_at"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    alert_type: Mapped[str] = mapped_column(String(50), nullable=False)
    threshold_value: Mapped[float] = mapped_column(Float, nullable=False)
    actual_value: Mapped[float] = mapped_column(Float, nullable=False)
    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    window_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    post_count: Mapped[int] = mapped_column(Integer, nullable=False)
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    details: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
