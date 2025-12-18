# Mountain Lovers Association - Backend

Production-grade backend API for a local mountain climbing club platform built with Next.js App Router, Prisma, and PostgreSQL (currently SQLite for development).

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Create `.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data (creates admin user)
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

API available at: `http://localhost:3000/api`

---

## Default Credentials

After seeding:

- **Admin**: `admin@example.com` / `Admin123!@#`
- **Member**: `member@example.com` / `Member123!@#`

---

## Project Structure

```
/src
├── app/api/          # API route handlers
│   ├── auth/         # Authentication (signup, login, logout)
│   ├── admin/        # Admin-only routes (news, events, notes)
│   ├── member/       # Member routes (blogs, registrations)
│   └── public/       # Public read-only content
├── lib/              # Infrastructure & Validators
│   ├── config.ts     # Env validation
│   ├── db.ts         # Prisma client
│   ├── errors.ts     # Error handling classes
│   └── validation.ts # Zod schemas
├── services/         # Business Logic Layer
│   ├── auth.service.ts
│   ├── blog.service.ts
│   ├── event.service.ts
│   └── audit.service.ts
├── types/            # TypeScript Definitions
│   ├── dto.ts        # API Response Shapes
│   └── domain.ts     # Frontend UI Models
└── proxy.ts          # Security Headers & Intl (formerly middleware)

/prisma
├── schema.prisma     # Database schema (7 models)
└── seed.ts           # Seed data script

/docs                 # Comprehensive documentation
```

---

## Documentation

- **[Folder Structure](docs/folder-structure.md)** - Project organization
- **[Auth Flow](docs/auth-flow.md)** - Authentication & authorization
- **[API Contracts](docs/api-contracts.md)** - Complete API reference
- **[Validation](docs/validation.md)** - Request validation schemas
- **[Error Handling](docs/error-handling.md)** - Error response format

---

## Key Features

### Authentication & Authorization

- JWT-based auth with HTTP-only cookies
- Role-based access control (ADMIN, MEMBER_VERIFIED, MEMBER_UNVERIFIED)
- Progressive brute-force protection (5/10/15 failed attempts)
- Rate limiting on auth endpoints (5 req/min)

### Content Management

- **Admin**: News & Events (full CRUD, publishing workflow)
- **Members**: Blogs (ownership-based access)
- **Public**: Read-only cached endpoints (5-min cache)

### Event Registration

- Capacity enforcement
- Idempotent registration
- Status management (PENDING → CONFIRMED/CANCELLED)
- Rate limited (10 reg/hour per IP)

### Security

- Argon2 password hashing
- Security headers (HSTS, CSP, XSS protection)
- Soft deletes on all models
- Complete audit logging

---

## Database

### Models

- User (with role-based access)
- News, Event, Blog (with publishing workflow)
- EventRegistration (with capacity management)
- AdminNote (internal operational notes)
- AuditLog (immutable audit trail)

### Migrations

```bash
# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy
```

### Prisma Studio

```bash
npx prisma studio
```

---

## Development

### Run Dev Server

```bash
npm run dev
```

### Type Check

```bash
npx tsc --noEmit
```

### Reset Database

```bash
npx prisma migrate reset
npx prisma db seed
```

---

## Environment Variables

| Variable       | Description                | Default         |
| -------------- | -------------------------- | --------------- |
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `JWT_SECRET`   | Secret for JWT signing     | Required        |
| `NODE_ENV`     | Environment                | `development`   |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (SQLite for dev)
- **ORM**: Prisma 5
- **Auth**: JWT (jose), Argon2
- **Validation**: Zod
- **Rate Limiting**: rate-limiter-flexible

---

## License

MIT
