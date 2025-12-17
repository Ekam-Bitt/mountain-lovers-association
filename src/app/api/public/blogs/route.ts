import { NextRequest, NextResponse } from 'next/server';
import { BlogService } from '@/services/blog.service';
import { withErrorHandler } from '@/lib/errors';
import { getPaginationParams, createPaginationMeta } from '@/lib/utils';


// GET /api/public/blogs - List published blogs (public, no auth)
export const GET = withErrorHandler(async (req: NextRequest) => {
    const { page, limit, skip } = getPaginationParams(req);

    // Get sorting params
    const searchParams = req.nextUrl.searchParams;
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    const { blogs, total } = await BlogService.getBlogs({
        skip,
        take: limit,
        where: {
            status: 'PUBLISHED',
            deletedAt: null,
        },
        orderBy: { [orderBy]: order },
    });

    const response = NextResponse.json({
        data: blogs,
        pagination: createPaginationMeta(page, limit, total),
    });

    // Add caching headers
    response.headers.set(
        'Cache-Control',
        'public, max-age=300, stale-while-revalidate=600'
    );

    return response;
});
