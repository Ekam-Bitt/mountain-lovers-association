# Validation Schemas Documentation

## Overview
This document describes all Zod validation schemas used across the platform. All schemas validate input data before database operations.

---

## Common Validations

### Slug Schema
```typescript
slug: string (min: 1, max: 200)
pattern: ^[a-z0-9]+(?:-[a-z0-9]+)*$
```
Lowercase alphanumeric with hyphens only.

### Status Schema
```typescript
status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
```

### Registration Status Schema
```typescript
status: "PENDING" | "CONFIRMED" | "CANCELLED"
```

---

## News Schemas

### Create News
**Schema**: `createNewsSchema`

```typescript
{
  title: string (required, max: 200),
  slug?: string (auto-generated if not provided),
  content: string (required),
  excerpt?: string (max: 500),
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" (default: "DRAFT")
}
```

### Update News
**Schema**: `updateNewsSchema`

```typescript
{
  title?: string (max: 200),
  slug?: string,
  content?: string,
  excerpt?: string (max: 500),
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  publishedAt?: string (ISO 8601 datetime)
}
```

### Publish News
**Schema**: `publishNewsSchema`

```typescript
{
  status: "PUBLISHED"
}
```

---

## Event Schemas

### Create Event
**Schema**: `createEventSchema`

```typescript
{
  title: string (required, max: 200),
  slug?: string (auto-generated if not provided),
  description: string (required),
  location: string (required, max: 200),
  startDate: string (ISO 8601 datetime),
  endDate: string (ISO 8601 datetime),
  capacity?: number (positive integer, nullable),
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" (default: "DRAFT")
}
```

**Validation**: `endDate` must be after `startDate`

### Update Event
**Schema**: `updateEventSchema`

```typescript
{
  title?: string (max: 200),
  slug?: string,
  description?: string,
  location?: string (max: 200),
  startDate?: string (ISO 8601 datetime),
  endDate?: string (ISO 8601 datetime),
  capacity?: number (positive integer, nullable),
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  publishedAt?: string (ISO 8601 datetime)
}
```

**Validation**: If both dates provided, `endDate` must be after `startDate`

### Publish Event
**Schema**: `publishEventSchema`

```typescript
{
  status: "PUBLISHED"
}
```

---

## Blog Schemas

### Create Blog
**Schema**: `createBlogSchema`

```typescript
{
  title: string (required, max: 200),
  slug?: string (auto-generated if not provided),
  content: string (required),
  excerpt?: string (max: 500),
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" (default: "DRAFT")
}
```

### Update Blog
**Schema**: `updateBlogSchema`

```typescript
{
  title?: string (max: 200),
  slug?: string,
  content?: string,
  excerpt?: string (max: 500),
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  publishedAt?: string (ISO 8601 datetime)
}
```

### Publish Blog
**Schema**: `publishBlogSchema`

```typescript
{
  status: "PUBLISHED"
}
```

---

## EventRegistration Schemas

### Register for Event
**Schema**: `registerForEventSchema`

```typescript
{
  eventId: string (CUID format)
}
```

### Update Registration
**Schema**: `updateRegistrationSchema`

```typescript
{
  status: "PENDING" | "CONFIRMED" | "CANCELLED"
}
```

### Cancel Registration
**Schema**: `cancelRegistrationSchema`

```typescript
{
  status: "CANCELLED"
}
```

---

## AdminNote Schemas

### Create AdminNote
**Schema**: `createAdminNoteSchema`

```typescript
{
  entityType: string (required),
  entityId: string (CUID format),
  content: string (required)
}
```

### Update AdminNote
**Schema**: `updateAdminNoteSchema`

```typescript
{
  content: string (required)
}
```

---

## Utility Functions

### generateSlug(title: string): string
Converts a title to a URL-friendly slug.

**Algorithm**:
1. Convert to lowercase
2. Remove special characters
3. Replace spaces with hyphens
4. Remove consecutive hyphens
5. Truncate to 200 characters

**Example**:
```typescript
generateSlug("Hello World! 123") // "hello-world-123"
```

### ensureSlug(data: { title: string; slug?: string }): string
Returns provided slug or generates one from title.

**Usage**:
```typescript
const slug = ensureSlug({ title: "My Post", slug: undefined });
// Result: "my-post"
```

---

## Usage Examples

### Example 1: Validate News Creation
```typescript
import { createNewsSchema } from '@/lib/validation';

const data = await req.json();
const validated = createNewsSchema.parse(data);
// If validation fails, ZodError is thrown
```

### Example 2: Partial Blog Update
```typescript
import { updateBlogSchema } from '@/lib/validation';

const updates = updateBlogSchema.parse({
  title: "New Title",
  // Other fields optional
});
```

### Example 3: Date Range Validation
```typescript
import { createEventSchema } from '@/lib/validation';

const data = createEventSchema.parse({
  title: "Mountain Climb",
  description: "Weekend climb",
  location: "Mont Blanc",
  startDate: "2024-06-01T10:00:00Z",
  endDate: "2024-06-03T18:00:00Z",
});
// Automatically validates endDate > startDate
```

---

## Error Handling

When validation fails, Zod throws `ZodError` with detailed information:

```typescript
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "fieldErrors": {
      "title": ["Title is required"],
      "endDate": ["End date must be after start date"]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Use `withErrorHandler` wrapper to automatically format these errors.
