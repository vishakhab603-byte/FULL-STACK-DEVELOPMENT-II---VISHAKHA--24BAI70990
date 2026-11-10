# Experiment 7 — Secure Read APIs

This project deliberately combines both Experiment 7 topics requested by the user: the JWT/RBAC/encryption security path with a 15-minute access token and a one-time rotated, hashed refresh token, plus the scalable read API concepts (pagination, caching, fetch joins and native query). All task API routes require a bearer token; task deletion is admin-only.

## Run
Set the backend signing/encryption keys and demo account passwords in your local shell before starting the backend. On Windows PowerShell, generate keys for this session and enter private demo passwords:

```powershell
$generator = [Security.Cryptography.RandomNumberGenerator]::Create()
$jwtBytes = New-Object byte[] 32
$aesBytes = New-Object byte[] 32
$generator.GetBytes($jwtBytes)
$generator.GetBytes($aesBytes)
$env:JWT_SECRET = [Convert]::ToBase64String($jwtBytes)
$env:AES_SECRET = [Convert]::ToBase64String($aesBytes)
# Replace these placeholders locally; never store the passwords in source control.
$env:DEMO_ADMIN_PASSWORD = "<set a private local value>"
$env:DEMO_USER_PASSWORD = "<set a private local value>"
cd backend
.\mvnw.cmd spring-boot:run
```

In another terminal, run `cd frontend; npm install; npm run dev` (Node 18+) and open `http://localhost:5173`. The initializer creates the local `admin` and `user` demo accounts from the configured passwords. Do not commit or share the values; use deployment-managed secrets outside local development.

The H2 database is file-backed. Override `DB_URL`, `JWT_SECRET`, `AES_SECRET`, and the demo passwords through the environment. The backend fails to start if required key material is missing; keys and passwords are not stored in the repository.

## Verification status
Verified with Node 24.22.1 and Maven Wrapper 3.9.16: frontend production build passes; backend compiles and its tests pass (5 tests). Credential encryption uses configured AES-GCM key material; it is an educational example, not a general compliance claim. The AES utility is currently not called by the task API.
