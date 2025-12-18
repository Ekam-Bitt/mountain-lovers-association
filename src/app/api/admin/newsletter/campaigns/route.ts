import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { withErrorHandler } from "@/lib/api";

export const GET = withErrorHandler(async () => {
  await requireAdmin();

  const campaigns = await prisma.newsletterCampaign.findMany({
    orderBy: { sentAt: "desc" },
    include: {
      author: {
        select: { email: true },
      },
    },
  });

  return NextResponse.json({ data: campaigns });
});
