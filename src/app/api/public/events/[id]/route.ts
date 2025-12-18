import { NextRequest, NextResponse } from "next/server";
import { EventService } from "@/services/event.service";
import { withErrorHandler, NotFoundError } from "@/lib/errors";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/public/events/[id] - Get single published event
export const GET = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const { id } = await context.params;

    const event = await EventService.getEventById(id);

    if (!event || event.status !== "PUBLISHED") {
      throw new NotFoundError("Event not found");
    }

    return NextResponse.json(event);
  },
);
