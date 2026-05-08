import json
from datetime import datetime, timezone

import pytest

from backend.api.schemas import FeedbackCreate
from backend.services.aggregator import get_alerts, get_distribution


class FakeRow:
    def __init__(self, data):
        self.data = data

    def all(self):
        return self.data


class FakeDb:
    def __init__(self, data):
        self.data = data
        self.executed = []

    async def execute(self, query):
        self.executed.append(query)
        return FakeRow(self.data)


@pytest.mark.asyncio
async def test_get_distribution_empty():
    db = FakeDb([])
    result = await get_distribution(db)
    assert result == {"positive": 0, "negative": 0, "neutral": 0}


@pytest.mark.asyncio
async def test_get_distribution_with_data():
    db = FakeDb([("positive", 5), ("negative", 3), ("neutral", 2)])
    result = await get_distribution(db)
    assert result["positive"] == 5
    assert result["negative"] == 3
    assert result["neutral"] == 2


@pytest.mark.asyncio
async def test_get_alerts_empty():
    db = FakeDb([])
    result = await get_alerts(db, limit=10)
    assert result == []


def test_feedback_create_schema():
    payload = {
        "student_name": "Ananya",
        "hall_ticket": "HT2023001",
        "department": "CSE",
        "year": 3,
        "category": "Faculty",
        "rating": 5,
        "feedback_message": "Excellent teaching quality",
    }
    feedback = FeedbackCreate(**payload)
    assert feedback.student_name == "Ananya"
    assert feedback.year == 3
    assert feedback.rating == 5


def test_feedback_create_validation():
    payload = {
        "student_name": "A",  # Too short
        "hall_ticket": "HT",
        "department": "CSE",
        "year": 5,  # Invalid year
        "category": "Faculty",
        "rating": 6,  # Invalid rating
        "feedback_message": "X",  # Too short
    }
    with pytest.raises(Exception):
        FeedbackCreate(**payload)
