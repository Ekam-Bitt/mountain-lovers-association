import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/errors';
import { getPaginationParams, createPaginationMeta } from '@/lib/utils';
import prisma from '@/lib/db';

// GET /api/public/news - List published news (public, no auth)
export const GET = withErrorHandler(async (req: NextRequest) => {
    const { page, limit, skip } = getPaginationParams(req);

    // Get sorting params
    const searchParams = req.nextUrl.searchParams;
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    const [news, total] = await Promise.all([
        prisma.news.findMany({
            where: {
                status: 'PUBLISHED',
                deletedAt: null,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: { [orderBy]: order },
            skip,
            take: limit,
        }),
        prisma.news.count({
            where: {
                status: 'PUBLISHED',
                deletedAt: null,
            },
        }),
    ]);

    const response = NextResponse.json({
        data: news,
        pagination: createPaginationMeta(page, limit, total),
    });

    // Add caching headers (5 min cache, 10 min stale-while-revalidate)
    response.headers.set(
        'Cache-Control',
        'public, max-age=300, stale-while-revalidate=600'
    );

    return response;
});
