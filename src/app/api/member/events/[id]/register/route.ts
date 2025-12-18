import { NextRequest, NextResponse } from "next/server";
import { EventService } from "@/services/event.service";
import { withErrorHandler, NotFoundError, ConflictError } from "@/lib/errors";
import { requireAuth, requireVerifiedMember } from "@/lib/auth-guard";
import { checkRegistrationRateLimit } from "@/lib/rate-limit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/member/events/[id]/register - Check registration status
export const GET = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const session = await requireAuth();
    const { id: eventId } = await context.params;

    const registration = await EventService.getRegistrationForUser(
      eventId,
      session.userId,
    );

    if (!registration) {
      return NextResponse.json({ status: null });
    }

    return NextResponse.json(registration);
  },
);

// POST /api/member/events/[id]/register - Register for event
export const POST = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    // Strictly enforce verified member status
    const session = await requireVerifiedMember();
    const { id: eventId } = await context.params;
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Rate limit: 10 registrations per hour per IP
    try {
      await checkRegistrationRateLimit(ip);
    } catch {
      throw new ConflictError(
        "Too many registration attempts. Please try again later.",
      );
    }

    // Check event exists and is published
    const event = await EventService.getEventById(eventId);

    if (!event || event.status !== "PUBLISHED") {
      throw new NotFoundError("Event not found");
    }

    // Check for existing registration (idempotency)
    const existingRegistration = await EventService.getRegistrationForUser(
      eventId,
      session.userId,
    );

    if (existingRegistration) {
      return NextResponse.json(existingRegistration);
    }

    // Check capacity
    if (event.capacity) {
      const confirmedCount =
        await EventService.countConfirmedRegistrations(eventId);

      if (confirmedCount >= event.capacity) {
        throw new ConflictError("Event is at capacity");
      }
    }

    // Create registration
    const registration = await EventService.registerForEvent(
      eventId,
      session.userId,
    );

    return NextResponse.json(registration, { status: 201 });
  },
);
