import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/errors';
import { requireAdmin } from '@/lib/auth-guard';
import { createAdminNoteSchema } from '@/lib/validation';
import { getPaginationParams, createPaginationMeta } from '@/lib/utils';
import prisma from '@/lib/db';

// POST /api/admin/notes - Create admin note
export const POST = withErrorHandler(async (req: NextRequest) => {
    const session = await requireAdmin();
    const body = await req.json();
    const data = createAdminNoteSchema.parse(body);

    const note = await prisma.adminNote.create({
        data: {
            entityType: data.entityType,
            entityId: data.entityId,
            content: data.content,
            authorId: session.userId,
        },
    });

    return NextResponse.json(note, { status: 201 });
});

// GET /api/admin/notes - List admin notes
export const GET = withErrorHandler(async (req: NextRequest) => {
    await requireAdmin();

    const { page, limit, skip } = getPaginationParams(req);
    const searchParams = req.nextUrl.searchParams;
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    // Build where clause
    const where: any = { deletedAt: null };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const [notes, total] = await Promise.all([
        prisma.adminNote.findMany({
            where,
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
        prisma.adminNote.count({ where }),
    ]);

    return NextResponse.json({
        data: notes,
        pagination: createPaginationMeta(page, limit, total),
    });
});
