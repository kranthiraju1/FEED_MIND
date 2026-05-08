# FeedMind

FeedMind is a real-time AI-powered college feedback intelligence platform built with FastAPI, React 18 + Vite, PostgreSQL, Redis Streams, and Docker Compose.

## What it does

- Collects student feedback from a React form
- Publishes feedback to Redis Streams
- Processes feedback in a worker service using Hugging Face models
- Stores feedback, sentiment, and alerts in PostgreSQL
- Pushes live updates to the dashboard over WebSocket
- Displays charts, metrics, and alerts in real time

## Services

- PostgreSQL database
- Redis Streams message queue
- FastAPI backend API
- Worker service
- Ingester service
- React frontend

## Quick start

1. Copy `.env.example` to `.env`
2. Start the system:

```bash
docker-compose up -d --build
```

3. Open:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Health check: http://localhost:8000/api/health

## API

- `GET /api/health`
- `POST /api/feedback`
- `GET /api/feedbacks`
- `GET /api/sentiment/distribution`
- `GET /api/sentiment/aggregate`
- `GET /api/alerts`

## WebSocket

- `ws://localhost:8000/ws/feedmind`

## Development notes

This repository is being built in phases so the architecture, queue flow, and dashboard behavior remain stable while the implementation expands.
