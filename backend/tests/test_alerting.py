from datetime import datetime, timezone

import pytest

from backend.services.alerting import evaluate_alerts


class FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows


class FakeSession:
    def __init__(self, rows):
        self.rows = rows
        self.added = []
        self.committed = False

    async def execute(self, _query):
        return FakeResult(self.rows)

    def add(self, obj):
        self.added.append(obj)

    async def commit(self):
        self.committed = True

    async def refresh(self, _obj):
        return None


@pytest.mark.asyncio
async def test_evaluate_alerts_detects_negative_ratio():
    rows = [
        ("negative", "WiFi", "WiFi is broken"),
        ("negative", "Hostel", "Hostel issue reported"),
        ("positive", "Faculty", "Faculty is excellent"),
        ("negative", "Transport", "Transport delay"),
        ("negative", "Transport", "Bus service is terrible"),
        ("negative", "Campus", "unsafe pathway"),
        ("negative", "Labs", "lab systems are broken"),
        ("positive", "Library", "library support is great"),
        ("negative", "Canteen", "food quality issue"),
        ("negative", "Placements", "placement guidance issue"),
    ]
    session = FakeSession(rows)
    alerts = await evaluate_alerts(session, feedback_id="fb_test", threshold_ratio=0.5, window_minutes=10, min_posts=5)
    assert alerts
    assert session.committed is True
    assert any(alert.alert_type == "high_negative_ratio" for alert in alerts)
