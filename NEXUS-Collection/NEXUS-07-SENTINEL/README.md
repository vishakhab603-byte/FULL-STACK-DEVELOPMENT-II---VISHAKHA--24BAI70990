# NEXUS SENTINEL — Experiment 07 (combined scope)

This project deliberately combines both Experiment 7 topics requested by the user: the JWT/RBAC/AES security path with a 15-minute access token and a one-time rotated, hashed refresh token in `EXP-7.zip`, plus the scalable read API concepts described for the duplicate Experiment 7 PDF (pagination, caching, fetch joins and native query). All task API routes require a bearer token; task deletion is admin-only.

## Run
Backend: `cd backend && mvnw.cmd spring-boot:run` (Java 17+). Frontend: `cd frontend && npm install && npm run dev` (Node 18+). Open `http://localhost:5173`. Seed demo credentials are documented in `INSTRUCTIONS.md`; change them before any shared deployment.

The H2 database is file-backed. Override `DB_URL` and `JWT_SECRET` via environment for local customization. The included fallback signing secret is for local classroom use only.

## Verification status
The archive source was extended to combine the two user-approved tracks and has not yet been compiled: Java/Maven are unavailable on this host. The `AES` sample applies to the demo credential path; it is not a general compliance claim.
