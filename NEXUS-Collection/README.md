# NEXUS Engineering Collection

Five independent full-stack learning projects, Experiments 06–10. Each project has its own run guide. Visual system: graphite and monochrome surfaces, restrained violet accents, compact technical labels, responsive layouts.

| Experiment | Product | Focus | Evidence status |
|---|---|---|---|
| 06 | NEXUS READOPS | Pagination, fetch joins, cache, native SQL | ZIP instructions |
| 07 | NEXUS SENTINEL | JWT/RBAC/AES plus secure, optimized read APIs | User approved both numbered sources |
| 08 | NEXUS EVENT DESK | Kafka scheduled publishing, retries, DLQ, idempotency | ZIP instructions |
| 09 | NEXUS PIPELINE | CI/CD, automated tests, containers, canary | ZIP instructions |
| 10 | NEXUS SOCIAL | Social publishing calendar, scheduling, analytics | Provisional prior-thread description; PDF scan has no text layer and no ZIP |

Start with [`SOURCE-INVENTORY.md`](SOURCE-INVENTORY.md) for attachment-level evidence and known limits. See [`VERIFICATION.md`](VERIFICATION.md) for build/test results. Social publishing in Experiment 10 is a local simulation, not a real external-platform integration.

## Collection verification

Build frontend: `cd <project>/frontend && npm install && npm run build`. Build/test backend: `cd <project>/backend && mvnw.cmd test` (Windows) or `./mvnw test` (Unix). Experiment 8 also needs Kafka (`docker compose up -d`). Run these on Java 17+ and Node 18+.
