import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { withErrorHandler } from "@/lib/api";

export const GET = withErrorHandler(async () => {
  await requireAdmin();

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: subscribers });
});
