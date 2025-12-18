import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth-guard";
import { getPaginationParams, createPaginationMeta } from "@/lib/utils";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

// GET /api/admin/blogs - List all blogs (admin view)
export const GET = withErrorHandler(async (req: NextRequest) => {
  await requireAdmin();

  const { page, limit, skip } = getPaginationParams(req);
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  const where: Prisma.BlogWhereInput = { deletedAt: null };

  if (search) {
    where.title = { contains: search };
  }

  if (status) {
    where.status = status;
  }

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
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
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.blog.count({ where }),
  ]);

  return NextResponse.json({
    data: blogs,
    pagination: createPaginationMeta(page, limit, total),
  });
});
