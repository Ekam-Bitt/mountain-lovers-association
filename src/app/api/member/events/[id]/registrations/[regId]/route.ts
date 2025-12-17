import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/services/event.service';
import { withErrorHandler, NotFoundError, ForbiddenError } from '@/lib/errors';
import { requireAuth } from '@/lib/auth-guard';
import { updateRegistrationSchema } from '@/lib/validation';

interface RouteContext {
    params: Promise<{ id: string; regId: string }>;
}

// PATCH /api/events/[id]/registrations/[regId] - Update registration status
export const PATCH = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    const session = await requireAuth();
    const { id: eventId, regId } = await context.params;
    const body = await req.json();
    const data = updateRegistrationSchema.parse(body);

    // Find registration
    const registration = await EventService.getRegistration(regId);

    if (!registration || registration.eventId !== eventId) {
        throw new NotFoundError('Registration not found');
    }

    // Check permissions
    // Users can only cancel their own registrations
    // Admins can update any registration
    const isOwner = registration.userId === session.userId;
    const isAdmin = session.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
        throw new ForbiddenError('You can only modify your own registrations');
    }

    // Users can only cancel (set to CANCELLED)
    if (!isAdmin && data.status !== 'CANCELLED') {
        throw new ForbiddenError('Only admins can confirm registrations');
    }

    // Update registration
    const updated = await EventService.updateRegistration(regId, data.status, session.userId);

    return NextResponse.json(updated);

    return NextResponse.json(updated);
});
