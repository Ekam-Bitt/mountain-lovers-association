import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/errors';
import { requireAdmin } from '@/lib/auth-guard';
import { createNewsSchema } from '@/lib/validation';
import { ensureSlug } from '@/lib/validation';
import { getPaginationParams, createPaginationMeta, getRequestMetadata } from '@/lib/utils';
import { AuditService } from '@/services/audit.service';
import { checkSlugUniqueness } from '@/lib/slug';
import prisma from '@/lib/db';

// POST /api/admin/news - Create news article
export const POST = withErrorHandler(async (req: NextRequest) => {
    const session = await requireAdmin();
    const body = await req.json();
    const data = createNewsSchema.parse(body);

    // Generate slug if not provided
    const slug = ensureSlug({ title: data.title, slug: data.slug });

    // Check slug uniqueness
    await checkSlugUniqueness('news', slug);

    // Create news article
    const news = await prisma.news.create({
        data: {
            title: data.title,
            slug,
            content: data.content,
            excerpt: data.excerpt,
            status: data.status || 'DRAFT',
            publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
            authorId: session.userId,
        },
    });

    // Create audit log
    const metadata = getRequestMetadata(req);
    await AuditService.log({
        entityType: 'News',
        entityId: news.id,
        action: 'CREATE',
        userId: session.userId,
        changes: { status: news.status },
        ...metadata,
    });

    return NextResponse.json(news, { status: 201 });
});

// GET /api/admin/news - List all news articles (admin view)
export const GET = withErrorHandler(async (req: NextRequest) => {
    await requireAdmin();

    const { page, limit, skip } = getPaginationParams(req);

    const [news, total] = await Promise.all([
        prisma.news.findMany({
            where: { deletedAt: null },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.news.count({ where: { deletedAt: null } }),
    ]);

    return NextResponse.json({
        data: news,
        pagination: createPaginationMeta(page, limit, total),
    });
});
