# NEXUS EVENT DESK — Experiment 08

An event-driven scheduled publishing pipeline built on Spring Boot, H2 and Kafka in KRaft mode. The scheduler emits due posts; a consumer processes events idempotently and retries failures with exponential delays before routing exhausted events to the dead-letter topic.

## Run locally
1. Start Kafka: `docker compose up -d` (from this folder).
2. Backend: `cd backend && mvnw.cmd spring-boot:run` (Java 17+).
3. Frontend: `cd frontend && npm install && npm run dev` (Node 18+), then open `http://localhost:5173`.
4. Stop Kafka: `docker compose down`.

Posts containing `[[SIMULATE_FAILURE]]` deterministically exercise the bounded three-attempt retry/DLQ path. Ordinary posts use a local publication adapter; no third-party publishing credentials or network call are configured. H2 data persists in `backend/data/`.

Backend source includes an application context test. Java/Maven are absent on the current host, so backend build/test results are pending.
