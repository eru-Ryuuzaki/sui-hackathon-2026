# Engram Backend Service

The backend service for Project ENGRAM (The On-Chain Memory Terminal), built with NestJS, PostgreSQL, and Sui SDK.

## Features

*   **Sui Indexer**: Listens to `ShardEngravedEvent`, `SubjectJackedInEvent` and syncs to PostgreSQL.
*   **REST API**: Provides query interfaces for frontend (Constructs, Memories, Search).
*   **Transaction Builder**: Constructs transaction payloads for frontend signing.
*   **Faucet Service**: Distributes initial SUI to new users (validated via Google JWT).
*   **Observability**: Integrated Prometheus metrics and structured logging (Pino).

## Architecture

*   **Framework**: Node.js + NestJS
*   **Database**: PostgreSQL 16 (TypeORM)
*   **Cache**: Redis 7
*   **Blockchain**: Sui (Mysten Labs SDK)
*   **Monitoring**: Prometheus + Grafana

## Prerequisites

*   Docker & Docker Compose
*   Node.js 20+

## Setup & Run

1.  **Configure Environment**:
    Copy `.env.example` to `.env` (create one if not exists)
    ```bash
    POSTGRES_HOST=db
    POSTGRES_USER=engram
    POSTGRES_PASSWORD=engram_password
    POSTGRES_DB=engram_db
    SUI_NETWORK=testnet
    SUI_PACKAGE_ID=0x... # Deploy contract first
    HIVE_OBJECT_ID=0x... # Deploy contract first
    SUI_FAUCET_PRIVATE_KEY=...
    ```

2.  **Start Services**:
    ```bash
    docker-compose up -d
    ```

3.  **Run Application** (Development):
    ```bash
    npm install
    npm run start:dev
    ```

## API Documentation

Swagger UI is available at: `http://localhost:3000/api/docs`

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e
```

## Deployment

The project includes a `Dockerfile` for containerized deployment.
CI/CD workflow is defined in `.github/workflows` (to be added).
