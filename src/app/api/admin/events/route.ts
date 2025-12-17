import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/services/event.service';
import { withErrorHandler } from '@/lib/errors';
import { requireAdmin } from '@/lib/auth-guard';
import { createEventSchema } from '@/lib/validation';
import { getPaginationParams, createPaginationMeta } from '@/lib/utils';

// POST /api/admin/events - Create event
export const POST = withErrorHandler(async (req: NextRequest) => {
    const session = await requireAdmin();
    const body = await req.json();
    const data = createEventSchema.parse(body);

    // Create event
    const event = await EventService.createEvent(session.userId, data);

    return NextResponse.json(event, { status: 201 });
});

// GET /api/admin/events - List all events (admin view)
export const GET = withErrorHandler(async (req: NextRequest) => {
    await requireAdmin();

    const { page, limit, skip } = getPaginationParams(req);

    const { events, total } = await EventService.getEvents({
        skip,
        take: limit,
        where: { deletedAt: null },
    });

    return NextResponse.json({
        data: events,
        pagination: createPaginationMeta(page, limit, total),
    });
});
