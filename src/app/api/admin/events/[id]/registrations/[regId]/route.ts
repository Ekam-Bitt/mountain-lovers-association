import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler, NotFoundError } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth-guard";
import { EventService } from "@/services/event.service";

interface RouteContext {
  params: Promise<{ id: string; regId: string }>;
}

// PUT /api/admin/events/[id]/registrations/[regId] - Update registration status
export const PUT = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const session = await requireAdmin();
    const { id: eventId, regId } = await context.params;
    const body = await req.json();
    const { status } = body;

    // Validate status
    if (!["CONFIRMED", "CANCELLED", "PENDING"].includes(status)) {
      throw new Error("Invalid status");
    }

    // Verify registration exists and belongs to event
    const registration = await EventService.getRegistration(regId);

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    if (registration.eventId !== eventId) {
      throw new NotFoundError("Registration does not belong to this event");
    }

    // Update status
    const updated = await EventService.updateRegistration(
      regId,
      status,
      session.userId,
    );

    return NextResponse.json(updated);
  },
);
