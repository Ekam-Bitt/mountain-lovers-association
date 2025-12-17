import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/services/event.service';
import { withErrorHandler, NotFoundError, ConflictError } from '@/lib/errors';
import { requireAuth } from '@/lib/auth-guard';
import { checkRegistrationRateLimit } from '@/lib/rate-limit';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// POST /api/member/events/[id]/register - Register for event
export const POST = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    const session = await requireAuth(); // Any authenticated member can register
    const { id: eventId } = await context.params;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Rate limit: 10 registrations per hour per IP
    try {
        await checkRegistrationRateLimit(ip);
    } catch (error) {
        throw new ConflictError('Too many registration attempts. Please try again later.');
    }

    // Check event exists and is published
    const event = await EventService.getEventById(eventId);

    if (!event || event.status !== 'PUBLISHED') {
        throw new NotFoundError('Event not found');
    }

    // Capacity Check should probably be in Service, but for now we keep it here or move it?
    // Let's rely on Service ideally, but the current Service method `registerForEvent` is simple.
    // I will replicate the check here or assume I should just use `registerForEvent` if I enhance it?
    // I'll keep the logic here for now but use Prisma via Service?
    // Actually, `registerForEvent` in Service was simple. I should probably move the complex logic to Service.
    // But for "Route Audit", I'll just keep the logic and use Service for the final write.

    // Check for existing registration (idempotency)
    const existingRegistration = await EventService.getRegistrationForUser(eventId, session.userId);

    if (existingRegistration) {
        return NextResponse.json(existingRegistration);
    }

    // Check capacity
    if (event.capacity) {
        const confirmedCount = await EventService.countConfirmedRegistrations(eventId);

        if (confirmedCount >= event.capacity) {
            throw new ConflictError('Event is at capacity');
        }
    }

    // Create registration
    const registration = await EventService.registerForEvent(eventId, session.userId);

    return NextResponse.json(registration, { status: 201 });
});
