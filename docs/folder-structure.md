# Backend Folder Structure

## Overview
This document explains the organization of the backend codebase for the Mountain Lovers Association platform.

---

## Directory Structure

```
/Users/ekambitt/Projects/web/mla/
├── prisma/
│   ├── schema.prisma          # Database schema (7 models)
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed data script
├── src/
│   ├── app/
│   │   └── api/               # API route handlers (Next.js App Router)
│   │       ├── auth/          # Authentication endpoints
│   │       ├── admin/         # Admin-only endpoints
│   │       ├── blogs/         # Member blog endpoints
│   │       ├── events/        # Event & registration endpoints
│   │       └── public/        # Public read-only endpoints
│   ├── lib/                   # Shared utilities & business logic
│   │   ├── auth-guard.ts      # Authorization guards
│   │   ├── auth-util.ts       # Password hashing, JWT
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── errors.ts          # Custom error classes
│   │   ├── rate-limit.ts      # Rate limiting & brute-force protection
│   │   ├── types.ts           # TypeScript types
│   │   ├── utils.ts           # Audit logs, pagination, slugs
│   │   └── validation.ts      # Zod schemas
│   └── middleware.ts          # Security headers middleware
├── docs/                      # Documentation
│   ├── api-contracts.md       # API reference
│   ├── auth-flow.md           # Auth & authorization guide
│   ├── error-handling.md      # Error handling guide
│   ├── folder-structure.md    # This file
│   └── validation.md          # Validation schemas
└── README.md                  # Project overview

```

---

## Key Directories Explained

### `/prisma`
**Purpose**: Database schema, migrations, and seed data.

- `schema.prisma` - Defines all models (User, News, Event, Blog, etc.)
- `migrations/` - Auto-generated migration files
- `seed.ts` - Creates initial admin user and sample data

### `/src/app/api`
**Purpose**: API route handlers using Next.js App Router.

**Organization**: Routes are organized by domain and access level:

- **`/auth`** - Public authentication (signup, login, logout)
- **`/admin`** - Admin-only routes (news, events, notes)
- **`/blogs`** - Member-controlled blogs (ownership-based)
- **`/events`** - Event registration (public + authenticated)
- **`/public`** - Public read-only content (news, events, blogs)

**Pattern**: Each route file exports HTTP method handlers (GET, POST, PATCH, DELETE).

### `/src/lib`
**Purpose**: Shared business logic and utilities.

| File | Purpose |
|------|---------|
| `auth-guard.ts` | Authorization guards (`requireAuth`, `requireAdmin`, `requireOwnership`) |
| `auth-util.ts` | Password hashing (Argon2), JWT sign/verify |
| `db.ts` | Prisma client singleton |
| `errors.ts` | Custom error classes, error handler wrapper |
| `rate-limit.ts` | Rate limiting & brute-force protection |
| `types.ts` | Shared TypeScript types (e.g., `Role`) |
| `utils.ts` | Audit logs, pagination, slug generation |
| `validation.ts` | Zod validation schemas for all models |

### `/docs`
**Purpose**: Human-readable documentation.

All documentation is in Markdown format and covers:
- API contracts (this file)
- Auth flow & role transitions
- Error handling patterns
- Validation schemas
- Folder structure (this document)

---

## API Route Patterns

### Next.js App Router
Routes are defined using the file system:
- `/api/auth/login/route.ts` → `POST /api/auth/login`
- `/api/admin/news/[id]/route.ts` → `GET/PATCH/DELETE /api/admin/news/:id`

### Common Patterns

#### 1. Route Handler with Auth Guard
```typescript
export const GET = withErrorHandler(async (req: NextRequest) => {
  await requireAdmin(); // Authorization check
  // ... route logic
});
```

#### 2. Dynamic Route with Context
```typescript
interface RouteContext {
  params: Promise<{ id: string }>;
}

export const PATCH = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const { id } = await context.params;
    // ... route logic
  }
);
```

---

## Import Aliases

Using TypeScript path aliases for clean imports:
- `@/lib/*` → `src/lib/*`
- `@/app/*` → `src/app/*`

Example:
```typescript
import { requireAdmin } from '@/lib/auth-guard';
import prisma from '@/lib/db';
```

---

## Next Steps

- See [auth-flow.md](./auth-flow.md) for authentication details
- See [api-contracts.md](./api-contracts.md) for complete API reference
- See [validation.md](./validation.md) for validation schemas
