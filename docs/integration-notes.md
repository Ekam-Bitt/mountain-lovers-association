# Integration Notes for Frontend Engineers

This document outlines key assumptions, constraints, and patterns for integrating with the Mountain Lovers Association backend.

## 1. Authentication & Authorization

- **Auth Cookie**: The backend sets an httpOnly `auth_token` cookie upon login/signup. Frontend logic does NOT need to manage tokens manually.
- **Session Check**: To check if a user is logged in, attempt to fetch user details or a protected resource.
  - `POST /api/auth/login` returns user object.
  - `GET /api/auth/me` (not explicitly implemented yet, rely on login response or protected route failure).
- **Access Levels**:
  - **Public**: Any user (e.g. `GET /api/public/events`).
  - **Member**: Logged in + Verified (e.g. `POST /api/member/events/:id/register`). Returns `401 Unauthorized` or `403 Forbidden`.
  - **Admin**: Logged in + Role='ADMIN'. Returns `403 Forbidden`.

## 2. API Response Formats

All API responses follow strict DTOs. See `src/types/dto.ts` for Typescript definitions.

### Success

Standard JSON bodies directly mapping to DTOs.

### Errors

All errors return the same shape (`ErrorResponse` in `src/lib/errors.ts`).

```json
{
  "error": "Human readable message",
  "code": "ERROR_CODE_STRING", // e.g. VALIDATION_ERROR, CONFLICT
  "details": {}, // Validation field errors if applicable
  "timestamp": "ISO_STRING"
}
```

## 3. Key Constraints

- **Event Registration**:
  - Users can only register ONCE per event. Repeated attempts return the existing registration (Idempotent success) or an error, depending on the logic.
  - Capacity is enforced. `409 Conflict` if event is full.
- **Slug Generation**:
  - Slugs are auto-generated from titles if not provided.
  - Explicitly providing a slug (e.g. during Admin Create/Update) is supported.

## 4. Environment

- **Development**:
  - APIs run at `/api` relative to the Next.js origin.
  - Uses local SQLite (`dev.db`).
- **Production**:
  - Ensure `JWT_SECRET` is set securely.
  - Database will switch to PostgreSQL (schema compatible).
