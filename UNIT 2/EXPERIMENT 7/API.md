# Experiment 7 API

All `/api/tasks` calls require `Authorization: Bearer <access token>`. `DELETE /api/tasks/{id}` is restricted to `ROLE_ADMIN`.

- `POST /api/auth/login` with `{username,password}` returns a 15-minute JWT, an opaque refresh token, the authenticated username and role, and the backend-supplied task `permissions` array.
- `POST /api/auth/refresh` with `{refreshToken}` consumes the old refresh token and returns a rotated pair with the current username, role, and task permissions. Refresh tokens are stored as SHA-256 digests.
- `POST /api/auth/logout` revokes the supplied refresh token.
- `GET /api/tasks?page=0&size=6&sort=id,desc` returns a Spring Data page.
- `GET /api/tasks/with-comments` demonstrates cached fetch-join reads.
- `GET /api/tasks/top` demonstrates the native SQL query.
- `POST /api/tasks`, `PUT /api/tasks/{id}/toggle`, `DELETE /api/tasks/{id}` mutate the task model and evict the read cache.

The login and refresh responses provide permission keys that match the route rules: `tasks:read` for authenticated task reads, `tasks:create` and `tasks:update` for `ROLE_USER` and `ROLE_ADMIN`, and `tasks:delete` for `ROLE_ADMIN`. The frontend access map displays these response values without inferring grants from a role.
