# Database Schema

This document describes the database schema for the Kisan Call Centre Query Assistant.

## Overview

The application uses SQLAlchemy ORM with support for both SQLite (development) and PostgreSQL (production).

## Tables

### Users Table

Stores user account information and farmer details.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    mobile_number VARCHAR NOT NULL,
    password_hash VARCHAR NOT NULL,
    location VARCHAR,
    crop_type VARCHAR,
    category VARCHAR,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Primary key, auto-increment
- `username`: Unique username for login
- `email`: Unique email address
- `mobile_number`: User's mobile number
- `password_hash`: Bcrypt hashed password
- `location`: Optional farmer location
- `crop_type`: Optional primary crop type
- `category`: Farmer category (small_farmer/large_farmer)
- `created_at`: Account creation timestamp

**Indexes:**
- UNIQUE index on `username`
- UNIQUE index on `email`

### Query Logs Table

Stores all user queries and responses for analytics and improvement.

```sql
CREATE TABLE query_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    query TEXT NOT NULL,
    offline_response TEXT,
    ai_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Fields:**
- `id`: Primary key, auto-increment
- `user_id`: Foreign key to users table
- `query`: Original user query text
- `offline_response`: Response from knowledge base search
- `ai_response`: AI-generated response (nullable)
- `created_at`: Query timestamp

**Indexes:**
- Index on `user_id`
- Index on `created_at`

## Relationships

- `QueryLog` belongs to `User` (many-to-one)
- Each user can have multiple query logs

## Database Configuration

### SQLite (Development)
```
DATABASE_URL=sqlite:///./kisan_call_centre.db
```

### PostgreSQL (Production)
```
DATABASE_URL=postgresql://username:password@localhost/kisan_call_centre
```

## Migration Strategy

The application uses SQLAlchemy's `create_all()` for schema creation. For production deployments with schema changes:

1. Use Alembic for database migrations
2. Create migration scripts for schema updates
3. Test migrations on staging environment first

## Sample Data

### Insert Sample User
```sql
INSERT INTO users (username, email, mobile_number, password_hash, location, crop_type, category)
VALUES ('farmer_demo', 'demo@example.com', '9876543210', '$2b$12$...', 'Maharashtra', 'Rice', 'small_farmer');
```

### Insert Sample Query Log
```sql
INSERT INTO query_logs (user_id, query, offline_response, ai_response)
VALUES (1, 'How to control pests?', 'Use neem oil...', 'Comprehensive pest control guide...');
```

## Backup Strategy

### SQLite Backup
```bash
# Copy the .db file
cp kisan_call_centre.db kisan_call_centre_backup.db
```

### PostgreSQL Backup
```bash
# Create backup
pg_dump kisan_call_centre > kisan_call_centre_backup.sql

# Restore backup
psql kisan_call_centre < kisan_call_centre_backup.sql
```

## Performance Considerations

- Index frequently queried fields (`username`, `email`, `user_id`, `created_at`)
- Use connection pooling for PostgreSQL
- Implement query result caching for knowledge base searches
- Archive old query logs periodically

## Security

- Passwords are hashed using bcrypt
- Sensitive data is not stored in plain text
- Database connections use parameterized queries to prevent SQL injection
- Access to database is restricted to application server only
