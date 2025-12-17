import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler, NotFoundError } from '@/lib/errors';
import { requireAdmin } from '@/lib/auth-guard';
import { updateAdminNoteSchema } from '@/lib/validation';
import prisma from '@/lib/db';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// PATCH /api/admin/notes/[id] - Update admin note
export const PATCH = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    const { id } = await context.params;
    const body = await req.json();
    const data = updateAdminNoteSchema.parse(body);

    const note = await prisma.adminNote.findUnique({
        where: { id, deletedAt: null },
    });

    if (!note) {
        throw new NotFoundError('Admin note not found');
    }

    const updated = await prisma.adminNote.update({
        where: { id },
        data: { content: data.content },
    });

    return NextResponse.json(updated);
});

// DELETE /api/admin/notes/[id] - Soft delete admin note
export const DELETE = withErrorHandler(async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    const { id } = await context.params;

    const note = await prisma.adminNote.findUnique({
        where: { id, deletedAt: null },
    });

    if (!note) {
        throw new NotFoundError('Admin note not found');
    }

    await prisma.adminNote.update({
        where: { id },
        data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Admin note deleted' });
});
