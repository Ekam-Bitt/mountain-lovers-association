import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/services/event.service';
import { withErrorHandler } from '@/lib/errors';
import { getPaginationParams, createPaginationMeta } from '@/lib/utils';
import prisma from '@/lib/db';

// GET /api/public/events - List published events (public, no auth)
export const GET = withErrorHandler(async (req: NextRequest) => {
    const { page, limit, skip } = getPaginationParams(req);

    // Get sorting params (default to upcoming events)
    const searchParams = req.nextUrl.searchParams;
    const orderBy = searchParams.get('orderBy') || 'startDate';
    const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc';

    const { events, total } = await EventService.getEvents({
        skip,
        take: limit,
        where: {
            status: 'PUBLISHED',
            deletedAt: null,
        },
        orderBy: { [orderBy]: order },
    });

    const response = NextResponse.json({
        data: events,
        pagination: createPaginationMeta(page, limit, total),
    });

    // Add caching headers
    response.headers.set(
        'Cache-Control',
        'public, max-age=300, stale-while-revalidate=600'
    );

    return response;
});
