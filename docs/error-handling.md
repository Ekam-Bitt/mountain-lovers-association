# Error Handling Documentation

## Overview
Standardized error handling ensures consistent API responses and better debugging. All errors follow a uniform response structure.

---

## Error Response Format

### Standard Shape
```typescript
{
  error: string;           // Human-readable message
  code?: string;           // Machine-readable error code
  details?: unknown;       // Additional context
  timestamp: string;       // ISO 8601 timestamp
}
```

### Example Response
```json
{
  "error": "Authentication required. Please log in.",
  "code": "UNAUTHORIZED",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Custom Error Classes

All custom errors extend `AppError` base class.

### UnauthorizedError (401)
**Use**: User must log in to access resource

```typescript
throw new UnauthorizedError('Authentication required. Please log in.');
```

**Default**: `"Unauthorized"`

---

### ForbiddenError (403)
**Use**: User is authenticated but lacks permission

```typescript
throw new ForbiddenError('Access denied. Admin role required.');
```

**Default**: `"Forbidden"`

---

### NotFoundError (404)
**Use**: Resource does not exist

```typescript
throw new NotFoundError('Blog post not found.');
```

**Default**: `"Not found"`

---

### ValidationError (400)
**Use**: Input data is invalid

```typescript
throw new ValidationError('Invalid input data', {
  fieldErrors: { email: ['Invalid email format'] }
});
```

**Default**: `"Validation failed"`

---

### ConflictError (409)
**Use**: Resource conflict (e.g., duplicate slug)

```typescript
throw new ConflictError('A blog post with this slug already exists.');
```

**Default**: `"Resource conflict"`

---

## Error Handler Wrapper

### `withErrorHandler`
Automatically catches and formats errors in route handlers.

**Usage**:
```typescript
import { withErrorHandler } from '@/lib/errors';

export const POST = withErrorHandler(async (req) => {
  // Your route logic
  // Any thrown error is automatically caught and formatted
});
```

**Benefits**:
- Consistent error responses
- Automatic Zod error formatting
- Proper HTTP status codes
- Timestamp on all errors

---

## Usage Examples

### Example 1: Admin-Only Route
```typescript
// src/app/api/admin/news/route.ts
import { withErrorHandler, ForbiddenError } from '@/lib/errors';
import { requireAdmin } from '@/lib/auth-guard';

export const POST = withErrorHandler(async (req) => {
  const session = await requireAdmin();
  // requireAdmin throws UnauthorizedError or ForbiddenError if needed
  
  // Create news...
});
```

### Example 2: Resource Not Found
```typescript
import { withErrorHandler, NotFoundError } from '@/lib/errors';
import prisma from '@/lib/db';

export const GET = withErrorHandler(async (req, { params }) => {
  const blog = await prisma.blog.findUnique({
    where: { id: params.id, deletedAt: null }
  });
  
  if (!blog) {
    throw new NotFoundError('Blog post not found');
  }
  
  return NextResponse.json(blog);
});
```

### Example 3: Validation Error
```typescript
import { withErrorHandler } from '@/lib/errors';
import { createBlogSchema } from '@/lib/validation';

export const POST = withErrorHandler(async (req) => {
  const body = await req.json();
  const data = createBlogSchema.parse(body);
  // If validation fails, ZodError is thrown
  // withErrorHandler automatically converts it to a 400 response
  
  // Create blog...
});
```

### Example 4: Ownership Validation
```typescript
import { withErrorHandler, ForbiddenError } from '@/lib/errors';
import { requireVerifiedMember, requireOwnership } from '@/lib/auth-guard';

export const PATCH = withErrorHandler(async (req, { params }) => {
  const session = await requireVerifiedMember();
  const blog = await prisma.blog.findUnique({ where: { id: params.id } });
  
  if (!blog) {
    throw new NotFoundError('Blog not found');
  }
  
  await requireOwnership(blog.authorId, session, 'blog post');
  // Throws ForbiddenError if user doesn't own the blog
  
  // Update blog...
});
```

### Example 5: Duplicate Resource
```typescript
import { withErrorHandler, ConflictError } from '@/lib/errors';

export const POST = withErrorHandler(async (req) => {
  const slug = generateSlug(title);
  
  const existing = await prisma.blog.findUnique({
    where: { slug }
  });
  
  if (existing) {
    throw new ConflictError('A blog post with this slug already exists.');
  }
  
  // Create blog...
});
```

---

## Error Response Examples

### Unauthorized (401)
```json
{
  "error": "Authentication required. Please log in.",
  "code": "UNAUTHORIZED",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Forbidden (403)
```json
{
  "error": "Access denied. Required role: ADMIN",
  "code": "FORBIDDEN",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "formErrors": [],
    "fieldErrors": {
      "title": ["Title is required"],
      "endDate": ["End date must be after start date"]
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Not Found (404)
```json
{
  "error": "Blog post not found",
  "code": "NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Conflict (409)
```json
{
  "error": "A blog post with this slug already exists.",
  "code": "CONFLICT",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Best Practices

1. **Use Specific Errors**: Prefer specific error classes over generic `Error`
2. **Descriptive Messages**: Write clear, actionable error messages
3. **Wrap All Routes**: Always use `withErrorHandler` for consistency
4. **Don't Expose Internals**: Never include stack traces or DB errors in production
5. **Log Errors**: Server-side errors are logged via `console.error` for debugging
