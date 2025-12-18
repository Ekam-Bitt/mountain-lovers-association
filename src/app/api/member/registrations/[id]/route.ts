import { NextRequest, NextResponse } from "next/server";
import { EventService } from "@/services/event.service";
import { withErrorHandler, NotFoundError, ForbiddenError } from "@/lib/errors";
import { requireVerifiedMember } from "@/lib/auth-guard";
import * as z from "zod";

const updateSchema = z.object({
  status: z.enum(["CANCELLED"]),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/member/registrations/[id] - Cancel registration
export const PATCH = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const session = await requireVerifiedMember();
    const { id } = await context.params;
    const body = await req.json();
    const { status } = updateSchema.parse(body);

    const registration = await EventService.getRegistration(id);

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    if (registration.userId !== session.userId && session.role !== "ADMIN") {
      throw new ForbiddenError("You can only modify your own registrations");
    }

    // Check if event has started
    const event = await EventService.getEventById(registration.eventId);
    if (event) {
      const now = new Date();
      if (new Date(event.startDate) < now && session.role !== "ADMIN") {
        throw new ForbiddenError(
          "Cannot cancel registration for an event that has already started",
        );
      }
    }

    const updated = await EventService.updateRegistration(
      id,
      status,
      session.userId,
    );

    return NextResponse.json(updated);
  },
);
