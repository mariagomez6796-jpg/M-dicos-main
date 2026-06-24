# Chat API - Healthcare Platform

Production-ready microservice for real-time doctor-patient communication using WebSockets and FastAPI.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Service](#running-the-service)
- [API Documentation](#api-documentation)
- [WebSocket Protocol](#websocket-protocol)
- [Testing](#testing)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Chat API is a microservice that enables secure, real-time communication between doctors and patients within a healthcare platform. It implements WebSocket-based messaging with comprehensive business rules for appointment-based conversations.

### Key Capabilities

- **Real-time messaging** via WebSockets
- **Appointment-based access control**
- **Time-bound conversations** (active during appointment + 14 days)
- **Message status tracking** (sent, delivered, read)
- **Doctor rating system**
- **Administrative reporting**
- **Audit logging** for compliance
- **Horizontal scalability** with Redis Pub/Sub

## ✨ Features

### Core Messaging
- ✅ Real-time bidirectional communication
- ✅ Message persistence in MySQL
- ✅ Read receipts and delivery confirmations
- ✅ Typing indicators
- ✅ Online/offline presence tracking
- ✅ Conversation history with pagination
- ✅ Unread message counters

### Business Rules
- ✅ Appointment-based conversation creation
- ✅ Automatic conversation expiration (14 days post-appointment)
- ✅ Read-only mode after expiration
- ✅ Dependent support
- ✅ Strict authorization checks

### Doctor Ratings
- ✅ Post-appointment rating system (1-5 stars)
- ✅ Optional textual reviews
- ✅ Automatic metrics aggregation
- ✅ Duplicate rating prevention

### Administrative Features
- ✅ Comprehensive reporting APIs
- ✅ Conversation analytics
- ✅ User activity metrics
- ✅ Performance tracking
- ✅ Audit trail

## 🏗️ Architecture

### High-Level Design

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP/WSS
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────►│  chat-api   │────►│   MySQL     │
│ Load Balancer│    │  Instance   │     │  Database   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Redis    │
                    │   Pub/Sub   │
                    └─────────────┘
```

### Component Architecture

```
chat-api/
├── app/
│   ├── core/           # Configuration, security, logging
│   ├── models/         # SQLAlchemy ORM models
│   ├── schemas/        # Pydantic validation schemas
│   ├── repositories/   # Data access layer
│   ├── services/       # Business logic layer
│   ├── routers/        # API endpoints
│   ├── websocket/      # WebSocket handlers
│   ├── middleware/     # HTTP middleware
│   ├── integrations/   # External service clients
│   └── utils/          # Utility functions
├── tests/              # Test suite
├── alembic/            # Database migrations
└── docs/               # Documentation
```

## 🛠️ Technology Stack

### Backend
- **Python 3.12+**
- **FastAPI** - Modern web framework
- **SQLAlchemy 2.x** - ORM
- **Pydantic v2** - Data validation
- **Alembic** - Database migrations
- **WebSockets** - Real-time communication

### Database
- **MySQL 8.0** - Primary database (shared with other services)
- **Redis 7** - Pub/Sub and caching

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Local orchestration
- **Uvicorn** - ASGI server

## 📦 Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Python 3.12+ (for local development)
- MySQL 8.0+ (provided via Docker)
- Redis 7+ (provided via Docker)

## 🚀 Installation

### 1. Clone the Repository

```bash
cd chat-api
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database (shared with other services)
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=CRUDG

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT (must match other services)
JWT_SECRET_KEY=MiSuperClaveDeSeguridadParaVitalApp1234567890
JWT_ALGORITHM=HS256

# Application
APP_ENV=development
DEBUG=true
LOG_LEVEL=INFO
```

### 3. Install Dependencies (Local Development)

```bash
pip install -r requirements.txt
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `mysql` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `CRUDG` |
| `DB_USER` | Database user | `root` |
| `DB_PASS` | Database password | `root` |
| `REDIS_HOST` | Redis host | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET_KEY` | JWT secret (min 32 chars) | Required |
| `WEBSOCKET_PING_INTERVAL` | WebSocket ping interval (seconds) | `30` |
| `CONVERSATION_EXPIRY_DAYS` | Days after appointment to expire | `14` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

See `.env.example` for complete list.

## 🗄️ Database Setup

### Option 1: Using Docker Compose (Recommended)

The database will be automatically initialized when you run:

```bash
docker-compose up -d
```

### Option 2: Manual Setup

1. **Create tables:**

```bash
mysql -h localhost -P 4306 -u root -proot CRUDG < schema.sql
```

2. **Run migrations:**

```bash
alembic upgrade head
```

### Database Schema

The service creates the following tables:

- `tbl_chat_conversation` - Conversation metadata
- `tbl_chat_participant` - Conversation participants
- `tbl_chat_message` - Message storage
- `tbl_message_status` - Delivery/read status
- `tbl_appointment_rating` - Doctor ratings
- `tbl_doctor_metrics` - Aggregated metrics
- `tbl_websocket_session` - Active connections
- `tbl_chat_audit` - Audit log

## 🏃 Running the Service

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f chat-api

# Stop services
docker-compose down
```

The API will be available at: `http://localhost:8004`

### Local Development

```bash
# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python -m app.main
```

### Verify Installation

```bash
# Health check
curl http://localhost:8004/health

# Readiness check
curl http://localhost:8004/health/ready

# API documentation
open http://localhost:8004/docs
```

## 📚 API Documentation

### REST Endpoints

#### Health Checks
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check (DB + Redis)
- `GET /health/live` - Liveness check

#### Conversations (Coming Soon)
- `GET /api/v1/conversations` - List user conversations
- `GET /api/v1/conversations/{id}` - Get conversation details
- `POST /api/v1/conversations` - Create conversation
- `GET /api/v1/conversations/{id}/messages` - Get messages

#### Ratings (Coming Soon)
- `POST /api/v1/ratings` - Submit doctor rating
- `GET /api/v1/ratings/doctor/{id}` - Get doctor ratings

#### Reports (Coming Soon)
- `GET /api/v1/reports/conversations` - Conversation analytics
- `GET /api/v1/reports/messages` - Message analytics
- `GET /api/v1/reports/doctors` - Doctor performance

### Interactive Documentation

When running in development mode:
- **Swagger UI**: http://localhost:8004/docs
- **ReDoc**: http://localhost:8004/redoc

## 🔌 WebSocket Protocol

### Connection

```javascript
const ws = new WebSocket('ws://localhost:8004/ws');
const token = 'your_jwt_token';

// Authenticate
ws.send(JSON.stringify({
  type: 'authenticate',
  token: token
}));
```

### Client Events

```javascript
// Join conversation
ws.send(JSON.stringify({
  type: 'join_conversation',
  conversation_id: 'uuid'
}));

// Send message
ws.send(JSON.stringify({
  type: 'send_message',
  conversation_id: 'uuid',
  content: 'Hello, doctor!'
}));

// Mark as read
ws.send(JSON.stringify({
  type: 'mark_read',
  message_id: 'uuid'
}));

// Typing indicator
ws.send(JSON.stringify({
  type: 'typing_start',
  conversation_id: 'uuid'
}));
```

### Server Events

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'message_received':
      // New message
      console.log(data.message);
      break;
    case 'message_delivered':
      // Delivery confirmation
      break;
    case 'message_read':
      // Read receipt
      break;
    case 'user_typing':
      // Typing indicator
      break;
    case 'conversation_expired':
      // Conversation expired
      break;
  }
};
```

## 🧪 Testing

### Run Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test file
pytest tests/unit/test_services.py

# Integration tests
pytest tests/integration/
```

### Test Structure

```
tests/
├── unit/               # Unit tests
│   ├── test_services.py
│   ├── test_repositories.py
│   └── test_utils.py
├── integration/        # Integration tests
│   ├── test_api.py
│   ├── test_websocket.py
│   └── test_database.py
└── fixtures/           # Test data
    └── data.py
```

## 🚢 Deployment

### Production Checklist

- [ ] Set `DEBUG=false`
- [ ] Use strong `JWT_SECRET_KEY` (min 32 chars)
- [ ] Configure proper `CORS_ORIGINS`
- [ ] Enable HTTPS/WSS
- [ ] Set up database backups
- [ ] Configure monitoring
- [ ] Set up log aggregation
- [ ] Enable rate limiting
- [ ] Review security settings

### Docker Production Build

```bash
# Build image
docker build -t chat-api:latest .

# Run container
docker run -d \
  --name chat-api \
  -p 8004:8000 \
  --env-file .env.production \
  chat-api:latest
```

### Scaling

For horizontal scaling:

1. **Deploy multiple instances**
2. **Use Redis Pub/Sub** for message broadcasting
3. **Configure load balancer** with sticky sessions for WebSockets
4. **Use shared Redis** for session management

```yaml
# docker-compose.scale.yml
services:
  chat-api:
    deploy:
      replicas: 3
```

## 📊 Monitoring

### Health Endpoints

```bash
# Kubernetes liveness probe
livenessProbe:
  httpGet:
    path: /health/live
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10

# Kubernetes readiness probe
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 5
```

### Metrics

- Active WebSocket connections
- Messages per second
- Database query performance
- Redis latency
- API response times

### Logging

Structured JSON logging to stdout:

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "INFO",
  "service": "chat-api",
  "message": "Message sent",
  "user_id": 123,
  "conversation_id": "uuid"
}
```

## 🔒 Security

### Authentication

- JWT-based authentication
- Token validation on every request
- Shared secret with other services

### Authorization

- Role-based access control (RBAC)
- Conversation ownership validation
- Appointment-based permissions

### Data Protection

- Input sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- Audit logging

### Compliance

- HIPAA-ready audit trails
- Data retention policies
- Secure communication (TLS/WSS)

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check MySQL is running
docker-compose ps mysql

# Check connection
mysql -h localhost -P 4306 -u root -proot CRUDG -e "SELECT 1"
```

#### Redis Connection Failed

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli -h localhost -p 6379 ping
```

#### WebSocket Connection Refused

- Verify CORS settings
- Check JWT token validity
- Ensure WebSocket endpoint is `/ws`
- Verify load balancer supports WebSockets

#### Migrations Failed

```bash
# Reset migrations
alembic downgrade base
alembic upgrade head

# Or manually apply schema
mysql -h localhost -P 4306 -u root -proot CRUDG < schema.sql
```

### Debug Mode

Enable detailed logging:

```env
DEBUG=true
LOG_LEVEL=DEBUG
DB_ECHO=true
```

### Logs

```bash
# Docker logs
docker-compose logs -f chat-api

# Application logs
tail -f logs/chat-api.log
```

## 📞 Support

For issues and questions:

1. Check this README
2. Review API documentation at `/docs`
3. Check application logs
4. Review database schema in `schema.sql`

## 📄 License

Proprietary - Healthcare Platform

## 🤝 Contributing

This is a production service. All changes must:

1. Pass all tests
2. Include documentation
3. Follow code style guidelines
4. Be reviewed before merging

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-01  
**Maintainer**: Backend Team