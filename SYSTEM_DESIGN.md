# FeedMind - System Architecture & Design

## Executive Summary

FeedMind is a production-grade, real-time AI-powered college feedback intelligence platform that processes student feedback through a distributed microservices architecture. The system uses Redis Streams for asynchronous message processing, PostgreSQL for data persistence, and FastAPI with React for the web interface.

## System Architecture

### Six-Service Microservices Design

```
┌─────────────────────────────────────────────────────────────────┐
│                     FeedMind Platform                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │  React         │  │  FastAPI        │  │  PostgreSQL     │ │
│  │  Frontend      │──│  Backend API    │──│  Database       │ │
│  │  (Port 3000)   │  │  (Port 8000)    │  │  (Port 5432)    │ │
│  │                │  │                  │  │                 │ │
│  │ • Home Page    │  │ • REST APIs      │  │ • feedback_     │ │
│  │ • Feedback     │  │ • WebSockets     │  │   posts table   │ │
│  │   Form         │  │ • Health Check   │  │ • sentiment_    │ │
│  │ • Dashboard    │  │                  │  │   analysis      │ │
│  │ • Alerts       │  │                  │  │   table         │ │
│  └────────┬────────┘  └────────┬─────────┘  │ • feedback_    │ │
│           │                    │            │   alerts table │ │
│           │                    │            └─────────────────┘ │
│           │                    │                                  │
│           │                    ▼                                  │
│           │            ┌──────────────────┐                     │
│           │            │  Redis Streams   │                     │
│           │            │  (Port 6379)     │                     │
│           │            │                  │                     │
│           │            │ • feedback_      │                     │
│           │            │   stream         │                     │
│           │            │ • Consumer Group │                     │
│           │            │ • Message Queue  │                     │
│           │            └────────┬─────────┘                     │
│           │                     │                               │
│           │                     ▼                               │
│           │            ┌──────────────────┐                     │
│           │            │  Worker Service  │                     │
│           │            │  (Background)    │                     │
│           │            │                  │                     │
│           │            │ • Sentiment      │                     │
│           │            │   Analysis       │                     │
│           │            │ • Emotion        │                     │
│           │            │   Detection      │                     │
│           │            │ • Data Storage   │                     │
│           │            └──────────────────┘                     │
│           │                                                      │
│           └──────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Ingester Service (Background)                            │   │
│  │  - Generates college feedback demo data                  │   │
│  │  - Publishes to Redis Streams                           │   │
│  │  - Simulates real student submissions                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Feedback Submission**
   - Student submits feedback via React form
   - Frontend sends POST request to `/api/feedback`

2. **Backend Processing**
   - Backend validates feedback data
   - Creates `FeedbackPost` record in PostgreSQL
   - Publishes message to Redis Streams (`feedback_stream`)
   - Broadcasts update via WebSocket

3. **Worker Processing**
   - Worker consumes message from Redis Streams using consumer group
   - Performs sentiment analysis (positive/negative/neutral)
   - Performs emotion detection (joy/anger/sadness/fear/surprise/neutral)
   - Creates `SentimentAnalysis` record in PostgreSQL
   - Evaluates alert conditions
   - Acknowledges message (XACK)

4. **Alert Triggering**
   - Monitors negative feedback ratio over time window
   - Detects category spikes
   - Identifies critical keywords (unsafe, harassment, broken, issue, emergency)
   - Creates `FeedbackAlert` records when thresholds exceeded

5. **Dashboard Updates**
   - Backend queries aggregated metrics
   - Frontend receives updates via WebSocket
   - Charts and stats refresh in real-time

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Recharts** - Chart visualization
- **WebSocket API** - Real-time communication

### Backend
- **FastAPI** - REST API and WebSocket server
- **SQLAlchemy** - ORM for database operations
- **Asyncpg** - Async PostgreSQL driver
- **Pydantic** - Request/response validation

### AI/ML
- **Hugging Face Transformers** - Model library
- **DistilBERT** - Sentiment analysis model
- **DistilRoBERTa** - Emotion detection model

### Data Storage
- **PostgreSQL 15** - Relational database
- **Redis 7** - Message queue (Streams)

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration

## Database Schema

### feedback_posts Table
```sql
CREATE TABLE feedback_posts (
    id SERIAL PRIMARY KEY,
    feedback_id VARCHAR(255) UNIQUE NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    hall_ticket VARCHAR(100) NOT NULL,
    department VARCHAR(120) NOT NULL,
    year INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL,
    feedback_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEXES:
    - feedback_id (UNIQUE)
    - department
    - category
    - created_at
);
```

### sentiment_analysis Table
```sql
CREATE TABLE sentiment_analysis (
    id SERIAL PRIMARY KEY,
    feedback_id VARCHAR(255) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    sentiment_label VARCHAR(20) NOT NULL,
    confidence_score FLOAT NOT NULL,
    emotion VARCHAR(50),
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY: feedback_id -> feedback_posts.feedback_id
    INDEXES:
    - feedback_id
    - analyzed_at
);
```

### feedback_alerts Table
```sql
CREATE TABLE feedback_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    threshold_value FLOAT NOT NULL,
    actual_value FLOAT NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    post_count INTEGER NOT NULL,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    details JSON NOT NULL,
    
    INDEXES:
    - triggered_at
);
```

## Redis Streams Design

### Stream: `feedback_stream`
```
Message Format:
{
    "feedback_id": "fb_abc123...",
    "student_name": "Ananya",
    "hall_ticket": "HT2023001",
    "department": "CSE",
    "year": "3",
    "category": "Faculty",
    "rating": "5",
    "feedback_message": "Faculty teaching is excellent.",
    "created_at": "2024-05-06T10:30:00Z"
}

Consumer Group: feedmind_workers
Consumer: worker-1
Acknowledgment: XACK after successful processing
Retention: Indefinite (AOF persistence enabled)
```

## API Endpoints

### Health & Status
```
GET /api/health
Response: {"status": "ok", "database": true, "redis": true}
```

### Feedback Operations
```
POST /api/feedback
Request: {feedback submission data}
Response: {"status": "queued", "feedback_id": "...", "message_id": "..."}

GET /api/feedbacks?limit=20&offset=0&department=CSE&sentiment=positive
Response: {"items": [...], "limit": 20, "offset": 0}
```

### Sentiment Analytics
```
GET /api/sentiment/distribution
Response: {"positive": 45, "negative": 12, "neutral": 33}

GET /api/sentiment/aggregate?hours=24
Response: {"hours": 24, "series": [{timestamp: "...", positive: 45, negative: 12, neutral: 33}, ...]}
```

### Alerts
```
GET /api/alerts?limit=25
Response: {"items": [{alert_type: "high_negative_ratio", ...}, ...]}
```

### WebSocket
```
ws://localhost:8000/ws/feedmind

Events:
- connection: {event: "connection", message: "connected", channel: "feedmind"}
- new_feedback: {event: "new_feedback", feedback_id: "...", ...}
- metrics_refresh: {event: "metrics_refresh", ...}
- alert: {event: "alert", details: {...}}
```

## Alert System

### Alert Types

1. **high_negative_ratio**
   - Triggers when: (negative_posts / total_posts) >= threshold
   - Threshold: 0.5 (50%)
   - Window: Last 10 minutes
   - Minimum posts: 10

2. **category_spike**
   - Triggers when: complaints about same category >= min_posts
   - Threshold: >= 5 posts
   - Window: Last 10 minutes

3. **critical_keyword**
   - Triggers when: Keywords detected in feedback
   - Keywords: unsafe, harassment, broken, issue, emergency
   - Immediate trigger (no threshold)

## Performance Metrics

- **Message Processing Rate**: 2-5 feedbacks/second per worker
- **API Response Time**: < 100ms (p95)
- **WebSocket Latency**: < 50ms
- **Dashboard Refresh**: Every 5 seconds (configurable)
- **Sentiment Model Inference**: ~100ms per feedback

## Deployment Model

### Docker Compose
- 6 containerized services
- Automatic service orchestration
- Health checks on critical services
- Volume persistence for data
- Network isolation

### Service Dependencies
```
frontend → backend (HTTP + WebSocket)
backend → postgres (SQL queries)
backend → redis (publish feedback)
worker → redis (consume feedback)
worker → postgres (store results)
ingester → redis (publish demo data)
```

## Security Considerations

- Database passwords managed via environment variables
- No hardcoded credentials
- API input validation via Pydantic
- CORS middleware enabled for frontend
- WebSocket authentication via connection headers
- SQL injection prevention via SQLAlchemy ORM

## Monitoring & Observability

### Logging
- Structured logging on all services
- Log aggregation ready (Docker logs)
- Configurable log levels

### Health Checks
- `/api/health` endpoint
- Database connectivity validation
- Redis connectivity validation
- Service startup verification

### Metrics
- Feedback processing count
- Sentiment distribution tracking
- Alert trigger frequency
- System resource usage (Docker stats)

## Scalability Considerations

### Horizontal Scaling
- Multiple worker instances for parallel processing
- Load-balanced Redis consumers
- Stateless backend for horizontal replication

### Vertical Scaling
- Configurable batch sizes for worker
- PostgreSQL connection pooling
- Redis memory optimization

## Development Workflow

1. **Local Development**: Docker Compose for complete environment
2. **Testing**: Automated unit & integration tests
3. **CI/CD Ready**: Dockerfile support for all services
4. **Production Ready**: Environment variable configuration
5. **Monitoring Ready**: Health checks and logging

## Future Enhancements

1. Multi-tenant support (department isolation)
2. Advanced analytics (sentiment trends, predictions)
3. Export functionality (CSV, PDF reports)
4. Mobile application (React Native)
5. Advanced authentication (OAuth2, LDAP)
6. Caching layer (Redis for frequent queries)
7. Search functionality (Elasticsearch integration)
8. Scheduled reports (email delivery)
