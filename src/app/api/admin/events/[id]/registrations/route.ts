import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler, NotFoundError } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth-guard";
import { getPaginationParams, createPaginationMeta } from "@/lib/utils";
import prisma from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/events/[id]/registrations - List all registrations (admin only)
export const GET = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    const { id: eventId } = await context.params;

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    const { searchParams } = new URL(req.url);
    const fetchAll = searchParams.get("all") === "true";

    // If fetching all, ignore pagination limits
    const { page, limit, skip } = getPaginationParams(req);
    const take = fetchAll ? undefined : limit;
    const skipVal = fetchAll ? undefined : skip;

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where: {
          eventId,
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { registeredAt: "desc" },
        skip: skipVal,
        take,
      }),
      prisma.eventRegistration.count({
        where: {
          eventId,
          deletedAt: null,
        },
      }),
    ]);

    return NextResponse.json({
      data: registrations,
      pagination: createPaginationMeta(page, limit, total),
    });
  },
);
