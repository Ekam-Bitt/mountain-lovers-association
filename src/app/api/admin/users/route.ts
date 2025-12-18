import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth-guard";
import { getPaginationParams, createPaginationMeta } from "@/lib/utils";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

// GET /api/admin/users - List users
export const GET = withErrorHandler(async (req: NextRequest) => {
  await requireAdmin();

  const { page, limit, skip } = getPaginationParams(req);
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search");
  const role = searchParams.get("role");

  const where: Prisma.UserWhereInput = { deletedAt: null };

  if (search) {
    where.OR = [
      { email: { contains: search } }, // Case insensitive usually depends on DB collation
      { id: { contains: search } },
    ];
  }

  if (role) {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        verifiedAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    data: users,
    pagination: createPaginationMeta(page, limit, total),
  });
});
