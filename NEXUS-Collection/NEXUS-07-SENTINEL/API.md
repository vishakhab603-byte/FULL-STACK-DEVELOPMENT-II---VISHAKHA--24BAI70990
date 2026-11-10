# SENTINEL API

All `/api/tasks` calls require `Authorization: Bearer <access token>`. `DELETE /api/tasks/{id}` is restricted to `ROLE_ADMIN`.

- `POST /api/auth/login` with `{username,password}` returns a 15-minute JWT and an opaque refresh token.
- `POST /api/auth/refresh` with `{refreshToken}` consumes the old refresh token and returns a rotated pair. Refresh tokens are stored as SHA-256 digests.
- `POST /api/auth/logout` revokes the supplied refresh token.
- `GET /api/tasks?page=0&size=6&sort=id,desc` returns a Spring Data page.
- `GET /api/tasks/with-comments` demonstrates cached fetch-join reads.
- `GET /api/tasks/top` demonstrates the native SQL query.
- `POST /api/tasks`, `PUT /api/tasks/{id}/toggle`, `DELETE /api/tasks/{id}` mutate the task model and evict the read cache.
