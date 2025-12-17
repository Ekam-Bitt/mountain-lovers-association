import { NextRequest, NextResponse } from 'next/server';
import { BlogService } from '@/services/blog.service';
import { withErrorHandler } from '@/lib/errors';
import { requireVerifiedMember, getSession } from '@/lib/auth-guard';
import { createBlogSchema } from '@/lib/validation';
import { getPaginationParams, createPaginationMeta } from '@/lib/utils';

// POST /api/blogs - Create blog post (verified members only)
export const POST = withErrorHandler(async (req: NextRequest) => {
    const session = await requireVerifiedMember();
    const body = await req.json();
    const data = createBlogSchema.parse(body);

    // Create blog post
    const blog = await BlogService.createBlog(session.userId, data);

    return NextResponse.json(blog, { status: 201 });
});

// GET /api/blogs - List published blogs (public endpoint)
export const GET = withErrorHandler(async (req: NextRequest) => {
    const { page, limit, skip } = getPaginationParams(req);
    const session = await requireVerifiedMember();

    const { blogs, total } = await BlogService.getBlogs({
        skip,
        take: limit,
        where: {
            authorId: session.userId,
            deletedAt: null,
        },
    });

    return NextResponse.json({
        data: blogs,
        pagination: createPaginationMeta(page, limit, total),
    });
});
