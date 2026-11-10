# Experiment 10 — Social Publishing (provisional spec mapping)

A local-first social publishing desk: draft channel-specific posts, schedule them, review the queue, and see simple counts by state/channel. Its interactive calendar timeline uses each API record's actual scheduled or returned publication timestamp and links to the matching post. Spring Boot persists posts to a local H2 file database; a scheduled backend job marks due posts as published. The “publish” step is a local simulation; this project does not connect to Instagram, LinkedIn, X, or Facebook.

## Run

1. Java 17+ and Maven: `cd backend && mvnw.cmd spring-boot:run`
2. Node.js 18+ and npm: `cd frontend && npm install && npm run dev`
3. Visit `http://localhost:5173`. Backend API: `http://localhost:8080/api`.

## API

- `GET /api/posts` — calendar ordered newest first
- `POST /api/posts` — JSON `{ "platform": "LinkedIn", "body": "...", "scheduledAt": "2030-01-01T10:00:00Z" }`
- `DELETE /api/posts/{id}` — remove a draft/scheduled/published local record
- `GET /api/analytics` — totals and channel counts

## Spec note

The attachment was a seven-page scanned PDF with no extractable text; the previous conversation describes it as Social Media Management and reports an Experiment 9 page heading. Product scope and this mapping are provisional pending visual review of the authoritative pages.

## Tests and limits

`cd backend && mvnw.cmd test`. Backend test results are recorded in the root [`VERIFICATION.md`](../../VERIFICATION.md). Scheduled publishing changes only local state and does not call external platforms.
