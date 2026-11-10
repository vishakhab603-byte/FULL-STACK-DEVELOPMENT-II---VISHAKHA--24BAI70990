# Experiment 6 — Read API

A task-read API with Spring Data pagination/sorting, H2 file persistence, a JPQL fetch join for comments, Spring Cache, and a native top-five query.

## Run
Backend: `cd backend && mvnw.cmd spring-boot:run` (Java 17+). Frontend: `cd frontend && npm install && npm run dev` (Node 18+). Open `http://localhost:5173`; API is on port 8080.

## API
`GET /api/tasks?page=0&size=5&sort=id,desc`, `GET /api/tasks/with-comments`, `GET /api/tasks/top`, `POST /api/tasks`, `PUT /api/tasks/{id}/toggle`, `DELETE /api/tasks/{id}`. Database is file-backed under `backend/data/`.

## Included optimization concepts
Pagination and sorting; cached read endpoint with mutation eviction; `LEFT JOIN FETCH` for task comments; a native SQL top-five query. See `INSTRUCTIONS.md` and `explanation.md`.

## Verification status
Verified with Node 24.22.1 and Maven Wrapper 3.9.16: frontend production build and Oxlint pass; backend tests pass (2 tests). The application includes no claim of measured performance.
