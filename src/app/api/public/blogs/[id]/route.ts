
import { NextRequest, NextResponse } from 'next/server';
import { BlogService } from '@/services/blog.service';
import { withErrorHandler, NotFoundError } from '@/lib/errors';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/public/blogs/[id] - Get single published blog
export const GET = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    const { id } = await context.params;

    const blog = await BlogService.getBlogById(id);

    if (!blog || blog.status !== 'PUBLISHED') {
        throw new NotFoundError('Blog post not found');
    }

    return NextResponse.json(blog);
});
