# NEXUS PIPELINE — Experiment 09

A DevOps learning control plane for unit and API tests, contract verification, canary traffic routing, Docker packaging, and GitHub Actions CI/CD examples.

## Run
Backend: `cd backend && mvnw.cmd spring-boot:run` (Windows; Java 17+), or `./mvnw spring-boot:run` (Unix). Frontend: `cd frontend && npm install && npm run dev`; open `http://localhost:5173`. Docker compose is included for the containerized path.

## Verify
`cd backend && mvnw.cmd test`. The source includes JUnit, MockMvc, contract, canary and Testcontainers tests. Testcontainers requires Docker; check the test output to distinguish skipped Docker tests from passing tests. GitHub Actions workflows are in `.github/workflows/`. Canary settings and telemetry are in-memory demo state unless the source says otherwise.

No build result is claimed here: this host does not have Java/Maven available on PATH.
