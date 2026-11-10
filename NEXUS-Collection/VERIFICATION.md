# Verification record

Run on 2026-11-10 with Node 24.22.1, Microsoft OpenJDK 17.0.10, and Maven Wrapper 3.9.16.

## Frontend production builds

| Project | Result |
|---|---|
| NEXUS-06-READOPS | PASS — Vite 8.3.6 |
| NEXUS-07-SENTINEL | PASS — Vite 5.4.21 |
| NEXUS-08-EVENT-PUBLISHER | PASS — Vite 5.4.21 |
| NEXUS-09-PIPELINE | PASS — Vite 5.4.21 |
| NEXUS-10-SOCIAL | PASS — Vite 5.4.21 |

## Backend Maven tests

| Project | Passed | Failed | Skipped | Notes |
|---|---:|---:|---:|---|
| NEXUS-06-READOPS | 2 | 0 | 0 | Task service unit tests |
| NEXUS-07-SENTINEL | 2 | 0 | 0 | Task service unit tests; Java sources compiled |
| NEXUS-08-EVENT-PUBLISHER | 2 | 0 | 0 | Retry/DLQ and duplicate-event tests; Kafka not required for unit suite |
| NEXUS-09-PIPELINE | 17 | 0 | 1 | Unit, MockMvc, contract and canary tests; PostgreSQL Testcontainers test skipped because Docker is unavailable |
| NEXUS-10-SOCIAL | 2 | 0 | 0 | Future schedule validation and due-post publication tests |

Totals: 25 passed, 0 failed, 1 skipped. No performance benchmark or external social-platform integration was run. Experiment 08 was not started against a live Kafka broker.
