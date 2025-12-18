import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler, NotFoundError } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth-guard";
import prisma from "@/lib/db";
import { AuditService } from "@/services/audit.service";
import { getRequestMetadata } from "@/lib/utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/users/[id] - Update user (e.g. role/suspension)
export const PATCH = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const session = await requireAdmin();
    const { id } = await context.params;
    const body = await req.json();
    const { role } = body;

    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Role update
    if (role) {
      await prisma.user.update({
        where: { id },
        data: { role },
      });

      // Audit log
      await AuditService.log({
        entityType: "User",
        entityId: id,
        action: "UPDATE_ROLE",
        userId: session.userId,
        changes: { oldRole: user.role, newRole: role },
        ...getRequestMetadata(req),
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json(updatedUser);
  },
);
