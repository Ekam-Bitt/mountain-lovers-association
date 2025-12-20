# Mountain Lover's Association

A digital sanctuary for the mountaineering community. The Mountain Lover's Association platform connects outdoor enthusiasts through organized expeditions, community blogs, and exclusive events. It features a robust membership system, live news feeds for climbing updates, and a comprehensive event management system for upcoming treks and workshops.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Prisma
- **Authentication**: Custom JWT (JOSE + Argon2)
- **Styling**: Tailwind CSS v4
- **Storage**: Vercel Blob (Images/Media)
- **Deployment**: Vercel

## 🚀 Getting Started

1.  **Clone & Install**

    ```bash
    git clone https://github.com/Ekam-Bitt/mountain-lovers-association.git
    cd mountain-lovers-association
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file locally:

    ```bash
    # Database (dev or prod url)
    DATABASE_URL="postgresql://..."

    # Auth
    JWT_SECRET="your-secret-key"

    # API
    NEXT_PUBLIC_API_URL="/api"
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📂 Architecture & Deployment

### Database (Neon Postgres)

We use **Neon** as our serverless PostgreSQL provider to handle scaling and branching.

- **Connection**: Managed via `DATABASE_URL` in Vercel.
- **Management**: Admin tasks can be done via Vercel Storage console or local `npx prisma studio`.

### File Storage (Vercel Blob)

We currently use **Vercel Blob** for storing user avatars and blog images.

- **Endpoint**: `/api/upload` uses `@vercel/blob` SDK.
- **Why?** Seamless integration with Vercel serverless functions (which have read-only filesystems).

> **Future Optimization Note**: As storage needs grow, migrate to **Cloudflare R2** to eliminate egress fees for high-volume media serving.
