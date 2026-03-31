# Microservice Deployment Guide

## Overview
This guide covers deploying our Python microservices to production using Docker and Kubernetes.

## Prerequisites
- Python 3.11 or higher
- Docker Desktop 4.x
- kubectl configured with cluster access
- Helm 3.x for chart management

## Project Structure
Each microservice follows this standard layout:
- `app/main.py` — FastAPI application entry point
- `app/config.py` — Environment-based configuration using pydantic-settings
- `app/routers/` — API route handlers organized by domain
- `app/services/` — Business logic layer
- `app/models/` — SQLModel/Pydantic data models
- `tests/` — pytest test suite

## Docker Configuration
Use multi-stage builds to minimize image size. The builder stage installs dependencies, and the runtime stage copies only the necessary files. Base image should be `python:3.11-slim`. Always pin dependency versions in requirements.txt.

## Environment Variables
Never hardcode secrets. Use environment variables for:
- DATABASE_URL — PostgreSQL connection string
- REDIS_URL — Redis cache connection
- API_KEYS — External service credentials
- LOG_LEVEL — Logging verbosity (default: INFO)

## CI/CD Pipeline
We use GitHub Actions for continuous deployment:
1. On push to `main`: run tests, build Docker image, push to ECR
2. On tag creation: deploy to staging via Helm upgrade
3. Manual approval gate for production deployment
4. Rollback procedure: `helm rollback <release> <revision>`

## Health Checks
Every service must expose:
- `GET /health` — Returns 200 if the service is running
- `GET /health/ready` — Returns 200 only if all dependencies (DB, cache, external APIs) are reachable

## Monitoring
Prometheus metrics are exposed at `/metrics`. Key metrics to monitor:
- Request latency (p50, p95, p99)
- Error rate by endpoint
- Database connection pool utilization
- Memory and CPU usage per pod
