# API Contracts

## Overview

Complete API reference for the Mountain Lovers Association backend. All endpoints return JSON and follow RESTful conventions.

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

## Authentication Endpoints

### POST `/auth/signup`

Create a new user account.

**Auth**: None  
**Rate Limit**: 5/min per IP  
**Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response**: `201 Created`

```json
{
  "message": "User created successfully"
}
```

### POST `/auth/login`

Login and receive session cookie.

**Auth**: None  
**Rate Limit**: 5/min per IP  
**Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response**: `200 OK` + HTTP-only cookie

```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "role": "MEMBER_VERIFIED"
  }
}
```

### POST `/auth/logout`

Clear session cookie.

**Auth**: None  
**Response**: `200 OK`

---

## Admin: News Management

### POST `/admin/news`

Create news article.

**Auth**: ADMIN  
**Body**:

```json
{
  "title": "Summer Season Opens",
  "content": "Full article content...",
  "excerpt": "Brief summary",
  "slug": "summer-season-opens", // optional
  "status": "DRAFT" // DRAFT | PUBLISHED | ARCHIVED
}
```

**Response**: `201 Created`

### GET `/admin/news`

List all news (including drafts).

**Auth**: ADMIN  
**Query**: `?page=1&limit=10`  
**Response**: `200 OK`

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### GET `/admin/news/:id`

Get single news article.

**Auth**: ADMIN  
**Response**: `200 OK`

### PATCH `/admin/news/:id`

Update news article.

**Auth**: ADMIN  
**Body**: Partial update

```json
{
  "status": "PUBLISHED"
}
```

**Response**: `200 OK`

### DELETE `/admin/news/:id`

Soft delete news article.

**Auth**: ADMIN  
**Response**: `200 OK`

---

## Admin: Events Management

### POST `/admin/events`

Create event.

**Auth**: ADMIN  
**Body**:

```json
{
  "title": "Mont Blanc Expedition",
  "description": "3-day guided climb",
  "location": "Chamonix, France",
  "startDate": "2024-07-01T08:00:00Z",
  "endDate": "2024-07-03T18:00:00Z",
  "capacity": 12,
  "status": "PUBLISHED"
}
```

**Response**: `201 Created`

### GET `/admin/events`

List all events (including drafts).

**Auth**: ADMIN  
**Query**: `?page=1&limit=10`  
**Response**: `200 OK`

### GET `/admin/events/:id`

Get single event with registrations.

**Auth**: ADMIN  
**Response**: `200 OK`

### PATCH `/admin/events/:id`

Update event.

**Auth**: ADMIN  
**Response**: `200 OK`

### DELETE `/admin/events/:id`

Soft delete event.

**Auth**: ADMIN  
**Response**: `200 OK`

### GET `/admin/events/:id/registrations`

List all registrations for event.

**Auth**: ADMIN  
**Query**: `?page=1&limit=20`  
**Response**: `200 OK`

---

## Member: Blog Management

### POST `/blogs`

Create blog post.

**Auth**: MEMBER_VERIFIED  
**Body**:

```json
{
  "title": "My First Climb",
  "content": "Today I climbed...",
  "excerpt": "Brief summary",
  "status": "DRAFT"
}
```

**Response**: `201 Created`

### GET `/blogs`

List published blogs + own drafts.

**Auth**: Optional (authenticated users see own drafts)  
**Query**: `?page=1&limit=10`  
**Response**: `200 OK`

### GET `/blogs/:id`

Get single blog.

**Auth**: Optional (author/admin can see drafts)  
**Response**: `200 OK`

### PATCH `/blogs/:id`

Update own blog.

**Auth**: MEMBER_VERIFIED + Ownership  
**Response**: `200 OK`

### DELETE `/blogs/:id`

Soft delete own blog.

**Auth**: MEMBER_VERIFIED + Ownership  
**Response**: `200 OK`

---

## Event Registration

### POST `/events/:id/register`

Register for event.

**Auth**: Authenticated (any role)  
**Rate Limit**: 10/hour per IP  
**Response**: `201 Created` or `200 OK` (if already registered)

### PATCH `/events/:id/registrations/:regId`

Update registration status.

**Auth**:

- Users: Can cancel own
- Admins: Can update any

**Body**:

```json
{
  "status": "CANCELLED" // PENDING | CONFIRMED | CANCELLED
}
```

**Response**: `200 OK`

---

## Admin: Notes

### POST `/admin/notes`

Create internal note.

**Auth**: ADMIN  
**Body**:

```json
{
  "entityType": "User",
  "entityId": "user123",
  "content": "Verified identity documents"
}
```

**Response**: `201 Created`

### GET `/admin/notes`

List notes.

**Auth**: ADMIN  
**Query**: `?entityType=User&entityId=user123&page=1&limit=10`  
**Response**: `200 OK`

### PATCH `/admin/notes/:id`

Update note.

**Auth**: ADMIN  
**Response**: `200 OK`

### DELETE `/admin/notes/:id`

Soft delete note.

**Auth**: ADMIN  
**Response**: `200 OK`

---

## Public: Read-Only Content

### GET `/public/news`

List published news.

**Auth**: None  
**Cache**: 5 minutes  
**Query**: `?page=1&limit=10&orderBy=createdAt&order=desc`  
**Response**: `200 OK`

### GET `/public/events`

List published events.

**Auth**: None  
**Cache**: 5 minutes  
**Query**: `?page=1&limit=10&orderBy=startDate&order=asc`  
**Response**: `200 OK`

### GET `/public/blogs`

List published blogs.

**Auth**: None  
**Cache**: 5 minutes  
**Query**: `?page=1&limit=10&orderBy=createdAt&order=desc`  
**Response**: `200 OK`

---

## Common Response Patterns

### Success Response

```json
{
  "data": {...} | [...],
  "pagination": {...} // if paginated
}
```

### Error Response

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Codes

- `UNAUTHORIZED` (401) - Not authenticated
- `FORBIDDEN` (403) - Not authorized
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid input
- `CONFLICT` (409) - Conflict (e.g., duplicate, capacity)

---

## Pagination

All list endpoints support:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

## Sorting

Most list endpoints support:

- `orderBy`: Field name (e.g., `createdAt`, `title`)
- `order`: `asc` or `desc`

---

## Rate Limits

| Endpoint Pattern              | Limit              |
| ----------------------------- | ------------------ |
| `/auth/login`, `/auth/signup` | 5 req/min per IP   |
| `/events/:id/register`        | 10 req/hour per IP |

**Rate Limit Response**: `429 Too Many Requests`

---

## Next Steps

- See [auth-flow.md](./auth-flow.md) for authentication details
- See [validation.md](./validation.md) for request body schemas
- See [error-handling.md](./error-handling.md) for error details
