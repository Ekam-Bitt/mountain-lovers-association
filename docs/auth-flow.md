# Authentication & Authorization Flow

## Overview

This document explains how authentication and authorization work in the Mountain Lovers Association backend.

---

## Authentication Flow

### 1. User Signup

```
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

↓

1. Validate input (Zod schema)
2. Check rate limit (5/min per IP)
3. Hash password (Argon2)
4. Create user with role: MEMBER_UNVERIFIED
5. Return success

Response: 201 Created
```

**Key Points**:

- All new users start as `MEMBER_UNVERIFIED`
- Password must be at least 8 characters
- Rate limited to prevent spam accounts

### 2. User Login

```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

↓

1. Check IP rate limit (5/min)
2. Check brute-force protection (progressive lockouts)
3. Find user by email
4. Verify password (Argon2)
5. Clear failed login attempts
6. Create JWT with payload:
   {
     userId: user.id,
     email: user.email,
     role: user.role
   }
7. Set HTTP-only cookie (7 days expiry)
8. Return user data

Response: 200 OK + Cookie
```

**Brute-Force Protection**:

- 5 failed attempts → 1-minute lockout
- 10 failed attempts → 10-minute lockout
- 15+ failed attempts → 1-hour lockout

### 3. Session Validation

Every protected route:

```typescript
const session = await requireAuth();
// session = { userId, email, role }
```

**Process**:

1. Read `token` cookie
2. Verify JWT signature
3. Extract payload
4. Return session data

---

## Role System

### Role Hierarchy

```
ADMIN (highest privilege)
  ↓
MEMBER_VERIFIED
  ↓
MEMBER_UNVERIFIED (lowest privilege)
```

### Role Capabilities

| Capability            | MEMBER_UNVERIFIED | MEMBER_VERIFIED | ADMIN |
| --------------------- | ----------------- | --------------- | ----- |
| Register for events   | ✅                | ✅              | ✅    |
| Cancel registration   | ✅                | ✅              | ✅    |
| Create blogs          | ❌                | ✅              | ✅    |
| Edit own blogs        | ❌                | ✅              | ✅    |
| Manage news/events    | ❌                | ❌              | ✅    |
| Confirm registrations | ❌                | ❌              | ✅    |
| Add admin notes       | ❌                | ❌              | ✅    |

### Role Transitions

**MEMBER_UNVERIFIED → MEMBER_VERIFIED**:

- Manual upgrade by admin (not yet implemented in API)
- Admin reviews identity documents
- Admin adds note documenting verification
- Admin updates user role to `MEMBER_VERIFIED`

**MEMBER_VERIFIED → ADMIN**:

- Manual promotion by existing admin
- Typically reserved for trusted community members

---

## Authorization Guards

### 1. `requireAuth()`

**Purpose**: Ensure user is logged in.

```typescript
const session = await requireAuth();
// Throws UnauthorizedError if no session
```

**Used by**: All protected endpoints

### 2. `requireVerifiedMember()`

**Purpose**: Ensure user is verified member or admin.

```typescript
const session = await requireVerifiedMember();
// Throws ForbiddenError if MEMBER_UNVERIFIED
```

**Used by**: Blog creation, blog editing

### 3. `requireAdmin()`

**Purpose**: Ensure user is admin.

```typescript
await requireAdmin();
// Throws ForbiddenError if not ADMIN
```

**Used by**: News/events management, admin notes, registration confirmation

### 4. `requireOwnership()`

**Purpose**: Ensure user owns resource or is admin.

```typescript
await requireOwnership(resource.authorId, session, "blog post");
// Throws ForbiddenError if not owner and not admin
```

**Used by**: Blog updates, blog deletion

---

## Session Structure

JWT Payload:

```typescript
{
  userId: string; // User's database ID
  email: string; // User's email
  role: Role; // ADMIN | MEMBER_VERIFIED | MEMBER_UNVERIFIED
}
```

Cookie Settings:

```typescript
{
  httpOnly: true,    // Not accessible via JavaScript
  secure: true,      // HTTPS only (production)
  sameSite: 'lax',   // CSRF protection
  maxAge: 7 days     // Session duration
}
```

---

## Example Flows

### Protected Resource Access

```
Client Request: GET /api/admin/news
  ↓
1. Middleware extracts cookie
2. requireAdmin() validates:
   - Cookie exists?
   - JWT valid?
   - Role = ADMIN?
3. If all pass → proceed
4. If any fail → 401/403 error
```

### Ownership Validation

```
Client Request: PATCH /api/blogs/:id
  ↓
1. requireVerifiedMember() checks role
2. Fetch blog from database
3. requireOwnership() checks:
   - blog.authorId === session.userId?
   - OR session.role === 'ADMIN'?
4. If yes → allow update
5. If no → 403 Forbidden
```

---

## Security Features

### Password Security

- **Hashing**: Argon2id (memory-hard, GPU-resistant)
- **Minimum Length**: 8 characters
- **Storage**: Only hash stored, never plaintext

### JWT Security

- **Algorithm**: HS256 (HMAC-SHA256)
- **Secret**: Strong random string (env variable)
- **Expiry**: 7 days
- **Delivery**: HTTP-only cookie (XSS protection)

### Rate Limiting

- **Auth endpoints**: 5 req/min per IP
- **Prevents**: Brute-force attacks, spam

### Progressive Lockouts

- Protects against credential stuffing
- Automatic cleanup after 1 hour

---

## Next Steps

- See [api-contracts.md](./api-contracts.md) for endpoint details
- See [error-handling.md](./error-handling.md) for error responses
