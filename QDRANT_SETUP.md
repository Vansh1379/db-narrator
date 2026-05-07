# Qdrant Setup Guide

## What is Qdrant?
Qdrant is a vector database used by DB Narrator for semantic search and RAG (Retrieval Augmented Generation) functionality. It enables the AI to find relevant database schema information when answering your questions.

## Installation Options

### Option 1: Docker (Recommended)
The easiest way to run Qdrant is using Docker:

```bash
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

To run it in the background:
```bash
docker run -d -p 6333:6333 -p 6334:6334 --name qdrant qdrant/qdrant
```

To stop it:
```bash
docker stop qdrant
```

To start it again:
```bash
docker start qdrant
```

### Option 2: Docker Compose
Create a `docker-compose.yml` file in the backend directory:

```yaml
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant_storage:/qdrant/storage
```

Then run:
```bash
docker-compose up -d
```

### Option 3: Local Installation
For macOS:
```bash
brew install qdrant
qdrant
```

For Linux/Windows, see: https://qdrant.tech/documentation/guides/installation/

## Verifying Installation

Once Qdrant is running, you can verify it's working by visiting:
- Web UI: http://localhost:6333/dashboard
- API: http://localhost:6333

## What Happens Without Qdrant?

The application has been updated to work without Qdrant, but with limited functionality:
- ✅ Database uploads will still work
- ✅ Schema extraction will work
- ✅ Direct SQL queries will work
- ❌ AI-powered semantic search will be disabled
- ❌ RAG-based query generation will be limited

## Recommended Setup

For the best experience, we recommend running Qdrant using Docker. It's lightweight and easy to manage.

```bash
# Start Qdrant
docker run -d -p 6333:6333 -p 6334:6334 --name qdrant qdrant/qdrant

# Verify it's running
curl http://localhost:6333/
```

You should see a JSON response indicating Qdrant is running.
