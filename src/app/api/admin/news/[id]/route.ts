import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler, NotFoundError } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth-guard";
import { updateNewsSchema } from "@/lib/validation";
import { ensureSlug } from "@/lib/validation";
import { getRequestMetadata } from "@/lib/utils";
import { AuditService } from "@/services/audit.service";
import { checkSlugUniqueness } from "@/lib/slug";
import prisma from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/news/[id] - Get single news article
export const GET = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    const { id } = await context.params;

    const news = await prisma.news.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!news) {
      throw new NotFoundError("News article not found");
    }

    return NextResponse.json(news);
  },
);

// PATCH /api/admin/news/[id] - Update news article
export const PATCH = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const session = await requireAdmin();
    const { id } = await context.params;
    const body = await req.json();
    const data = updateNewsSchema.parse(body);

    // Check if news exists
    const existingNews = await prisma.news.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingNews) {
      throw new NotFoundError("News article not found");
    }

    // Handle slug update if provided
    let slug = existingNews.slug;
    if (data.slug !== undefined) {
      slug =
        data.slug || ensureSlug({ title: data.title || existingNews.title });
      if (slug !== existingNews.slug) {
        await checkSlugUniqueness("news", slug, id);
      }
    } else if (data.title && data.title !== existingNews.title) {
      // If title changed but slug not provided, regenerate slug
      slug = ensureSlug({ title: data.title });
      if (slug !== existingNews.slug) {
        await checkSlugUniqueness("news", slug, id);
      }
    }

    // Determine if we're publishing for the first time
    const isPublishing =
      data.status === "PUBLISHED" && existingNews.status !== "PUBLISHED";
    const publishedAt = isPublishing
      ? new Date()
      : data.publishedAt
        ? new Date(data.publishedAt)
        : existingNews.publishedAt;

    // Update news article
    const news = await prisma.news.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status,
        publishedAt,
      },
    });

    // Determine action for audit log
    let action = "UPDATE";
    if (isPublishing) action = "PUBLISH";
    else if (data.status === "ARCHIVED") action = "ARCHIVE";

    // Create audit log
    const metadata = getRequestMetadata(req);
    await AuditService.log({
      entityType: "News",
      entityId: news.id,
      action,
      userId: session.userId,
      changes: {
        ...data,
        publishedAt: publishedAt?.toISOString(),
      },
      ...metadata,
    });

    return NextResponse.json(news);
  },
);

// DELETE /api/admin/news/[id] - Soft delete news article
export const DELETE = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const session = await requireAdmin();
    const { id } = await context.params;

    const news = await prisma.news.findUnique({
      where: { id, deletedAt: null },
    });

    if (!news) {
      throw new NotFoundError("News article not found");
    }

    // Soft delete
    await prisma.news.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Create audit log
    const metadata = getRequestMetadata(req);
    await AuditService.log({
      entityType: "News",
      entityId: id,
      action: "DELETE",
      userId: session.userId,
      ...metadata,
    });

    return NextResponse.json({
      success: true,
      message: "News article deleted",
    });
  },
);
