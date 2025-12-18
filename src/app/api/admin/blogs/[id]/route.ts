import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler, NotFoundError } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth-guard";
import prisma from "@/lib/db";
import { AuditService } from "@/services/audit.service";
import { getRequestMetadata } from "@/lib/utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/blogs/[id] - Update blog status (Flag/Ban)
export const PATCH = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const session = await requireAdmin();
    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    const blog = await prisma.blog.findUnique({
      where: { id, deletedAt: null },
    });

    if (!blog) {
      throw new NotFoundError("Blog not found");
    }

    if (status) {
      await prisma.blog.update({
        where: { id },
        data: { status },
      });

      // Audit log
      let action = "UPDATE";
      if (status === "FLAGGED") action = "FLAG";
      else if (status === "BANNED") action = "BAN";
      else if (status === "PUBLISHED") action = "UNBAN"; // Or Publish

      await AuditService.log({
        entityType: "Blog",
        entityId: id,
        action,
        userId: session.userId,
        changes: { oldStatus: blog.status, newStatus: status },
        ...getRequestMetadata(req),
      });
    }

    const updatedBlog = await prisma.blog.findUnique({
      where: { id },
      include: {
        author: { select: { email: true } },
      },
    });

    return NextResponse.json(updatedBlog);
  },
);
