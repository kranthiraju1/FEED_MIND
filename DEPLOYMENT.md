# FeedMind - Startup & Deployment Guide

## Prerequisites

- Docker Desktop (version 20.10+)
- Docker Compose (version 1.29+)
- 4GB RAM minimum for all services
- Internet connection (for HuggingFace model downloads on first run)

## Quick Start

### 1. Clone or navigate to the project directory

```bash
cd "FeedMind – AI Powered Real-Time College Feedback Intelligence Platform/feedmind"
```

### 2. Create environment file

```bash
cp .env.example .env
```

### 3. Review environment variables (optional)

Edit `.env` if you need to change ports, database credentials, or alert thresholds:

```bash
# For Windows:
notepad .env

# For macOS/Linux:
nano .env
```

### 4. Build and start all services

```bash
docker-compose up -d --build
```

### 5. Verify all services are running

```bash
docker-compose ps
```

All 6 services should show as "Up":
- `feedmind-postgres` - PostgreSQL database
- `feedmind-redis` - Redis Streams message queue
- `feedmind-backend` - FastAPI backend API
- `feedmind-worker` - Worker service (sentiment analysis)
- `feedmind-ingester` - Ingester service (demo data generation)
- `feedmind-frontend` - React dashboard

### 6. Check service health

```bash
# Check backend health
curl http://localhost:8000/api/health

# Expected response:
# {"status":"ok","database":true,"redis":true}
```

### 7. Access the application

- **Frontend Dashboard:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Swagger API Docs:** http://localhost:8000/docs

## Service Details

### PostgreSQL (feedmind-postgres)
- Port: 5432 (internal only)
- Database: `feedmind_db`
- User: `feedmind`
- Auto-creates tables on startup

### Redis (feedmind-redis)
- Port: 6379 (internal only)
- Streams: `feedback_stream`
- Consumer Group: `feedmind_workers`
- Auto-creates consumer group on startup

### Backend (feedmind-backend)
- Port: 8000 (exposed)
- Fastapi service with REST API and WebSocket
- Auto-initializes database on startup

### Worker (feedmind-worker)
- Internal only
- Processes feedback using HuggingFace models
- Sentiment analysis & emotion detection
- Starts automatically

### Ingester (feedmind-ingester)
- Internal only
- Generates demo college feedback
- Publishes to Redis Streams
- Runs continuously to simulate live data

### Frontend (feedmind-frontend)
- Port: 3000 (exposed)
- React 18 + Vite app
- Auto-connects to WebSocket on startup

## Troubleshooting

### Services not starting?

```bash
# Check service logs
docker-compose logs -f feedmind-backend

# Restart all services
docker-compose restart

# Full cleanup and rebuild
docker-compose down
docker-compose up -d --build
```

### Database connection error?

```bash
# Check if PostgreSQL is healthy
docker-compose exec feedmind-postgres pg_isready -U feedmind

# View database logs
docker-compose logs feedmind-postgres
```

### Redis connection error?

```bash
# Check if Redis is healthy
docker-compose exec feedmind-redis redis-cli ping

# View Redis logs
docker-compose logs feedmind-redis
```

### Frontend not connecting to backend?

```bash
# Verify backend is running
docker-compose ps feedmind-backend

# Check backend logs
docker-compose logs feedmind-backend

# Verify WebSocket is accessible
curl http://localhost:8000/api/health
```

### Worker not processing messages?

```bash
# Check worker logs
docker-compose logs feedmind-worker

# Verify Redis Stream has messages
docker-compose exec feedmind-redis redis-cli xlen feedback_stream

# Check consumer group status
docker-compose exec feedmind-redis redis-cli xinfo stream feedback_stream
```

## Stopping the Application

```bash
# Stop all services (keep data)
docker-compose down

# Remove all containers and volumes (delete data)
docker-compose down -v
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | feedmind | PostgreSQL username |
| `POSTGRES_PASSWORD` | feedmind_password | PostgreSQL password |
| `POSTGRES_DB` | feedmind_db | PostgreSQL database name |
| `REDIS_STREAM_NAME` | feedback_stream | Redis stream name |
| `REDIS_CONSUMER_GROUP` | feedmind_workers | Redis consumer group |
| `ALERT_NEGATIVE_RATIO_THRESHOLD` | 0.5 | Alert trigger threshold (50% negative) |
| `ALERT_WINDOW_MINUTES` | 10 | Alert evaluation window |
| `ALERT_MIN_POSTS` | 10 | Minimum posts to evaluate for alert |
| `VITE_API_BASE_URL` | http://localhost:8000 | Frontend API endpoint |
| `VITE_WS_URL` | ws://localhost:8000/ws/feedmind | Frontend WebSocket endpoint |

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Submit Feedback
```bash
POST /api/feedback
Content-Type: application/json

{
  "student_name": "Ananya",
  "hall_ticket": "HT2023001",
  "department": "CSE",
  "year": 3,
  "category": "Faculty",
  "rating": 5,
  "feedback_message": "Faculty teaching is excellent."
}
```

### Get Recent Feedbacks
```bash
GET /api/feedbacks?limit=20&offset=0
GET /api/feedbacks?department=CSE&category=Faculty
GET /api/feedbacks?sentiment=positive
```

### Get Sentiment Distribution
```bash
GET /api/sentiment/distribution
```

### Get Sentiment Trends
```bash
GET /api/sentiment/aggregate?hours=24
```

### Get Alerts
```bash
GET /api/alerts?limit=25
```

### WebSocket
```
ws://localhost:8000/ws/feedmind
```

## Testing

### Run backend tests
```bash
docker-compose exec feedmind-backend pytest backend/tests -q
```

### Run with coverage report
```bash
docker-compose exec feedmind-backend pytest backend/tests --cov=backend --cov-report=term-missing
```

## Performance Notes

- First startup may take 2-3 minutes for HuggingFace models to download
- Worker processes ~2-5 feedbacks per second
- Dashboard updates via WebSocket every 5 seconds (or on new feedback)
- All services auto-recover on failure

## Next Steps

1. Open http://localhost:3000 in your browser
2. Navigate to "Student Feedback" page
3. Submit some college feedback
4. Watch the dashboard update in real-time
5. Check the "Alerts" page for triggered alerts

Enjoy using FeedMind! 🎓✨
