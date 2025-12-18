import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler, NotFoundError } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth-guard";
import { updateEventSchema } from "@/lib/validation";
import { ensureSlug } from "@/lib/validation";
import { getRequestMetadata } from "@/lib/utils";
import { AuditService } from "@/services/audit.service";
import { checkSlugUniqueness } from "@/lib/slug";
import prisma from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/events/[id] - Get single event
export const GET = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    const { id } = await context.params;

    const event = await prisma.event.findUnique({
      where: { id, deletedAt: null },
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        registrations: {
          where: { deletedAt: null },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    return NextResponse.json(event);
  },
);

// PATCH /api/admin/events/[id] - Update event
export const PATCH = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const session = await requireAdmin();
    const { id } = await context.params;
    const body = await req.json();
    const data = updateEventSchema.parse(body);

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingEvent) {
      throw new NotFoundError("Event not found");
    }

    // Handle slug update if provided
    let slug = existingEvent.slug;
    if (data.slug !== undefined) {
      slug =
        data.slug || ensureSlug({ title: data.title || existingEvent.title });
      if (slug !== existingEvent.slug) {
        await checkSlugUniqueness("event", slug, id);
      }
    } else if (data.title && data.title !== existingEvent.title) {
      // If title changed but slug not provided, regenerate slug
      slug = ensureSlug({ title: data.title });
      if (slug !== existingEvent.slug) {
        await checkSlugUniqueness("event", slug, id);
      }
    }

    // Determine if we're publishing for the first time
    const isPublishing =
      data.status === "PUBLISHED" && existingEvent.status !== "PUBLISHED";
    const publishedAt = isPublishing
      ? new Date()
      : data.publishedAt
        ? new Date(data.publishedAt)
        : existingEvent.publishedAt;

    // Update event
    const event = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        description: data.description,
        location: data.location,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        capacity: data.capacity !== undefined ? data.capacity : undefined,
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
      entityType: "Event",
      entityId: event.id,
      action,
      userId: session.userId,
      changes: {
        ...data,
        publishedAt: publishedAt?.toISOString(),
      },
      ...metadata,
    });

    return NextResponse.json(event);
  },
);

// DELETE /api/admin/events/[id] - Soft delete event
export const DELETE = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const session = await requireAdmin();
    const { id } = await context.params;

    const event = await prisma.event.findUnique({
      where: { id, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    // Soft delete
    await prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Create audit log
    const metadata = getRequestMetadata(req);
    await AuditService.log({
      entityType: "Event",
      entityId: id,
      action: "DELETE",
      userId: session.userId,
      ...metadata,
    });

    return NextResponse.json({ success: true, message: "Event deleted" });
  },
);
