# FeedMind Architecture

## Overview

FeedMind is a six-service, Dockerized real-time analytics platform for college feedback intelligence.

## Services

1. PostgreSQL
2. Redis Streams
3. Ingester
4. Worker
5. Backend API
6. Frontend Dashboard

## Data Flow

1. A student submits feedback from the React form.
2. The backend validates the submission and publishes it to Redis Streams.
3. The worker consumes messages with a Redis consumer group.
4. The worker runs sentiment and emotion analysis.
5. Results are stored in PostgreSQL.
6. The backend broadcasts updates through WebSocket.
7. The frontend updates charts and metrics live.

## Core Design Choices

- FastAPI for async REST and WebSocket support
- PostgreSQL for relational storage and analytics queries
- Redis Streams for at-least-once message delivery
- Hugging Face transformers for local model inference
- External LLM support for fallback or comparison
- React + Vite for an interactive dashboard experience

## Database Model

- `feedback_posts` stores the submitted student feedback
- `sentiment_analysis` stores AI analysis results
- `feedback_alerts` stores triggered alert records

## Real-time behavior

The backend maintains a WebSocket broadcast channel that pushes:

- new feedback events
- sentiment metric refreshes
- alert notifications

## Phase plan

- Phase 1: infrastructure and service scaffolding
- Phase 2: database models and migrations
- Phase 3: REST API and WebSocket routes
- Phase 4: Redis stream producer and worker consumer
- Phase 5: frontend dashboard and live charts
- Phase 6: tests, hardening, and documentation
