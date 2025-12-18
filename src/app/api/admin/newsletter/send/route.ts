import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { withErrorHandler } from "@/lib/api";
import * as z from "zod";
import { getSession } from "@/lib/auth-guard";

const sendSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  await requireAdmin();
  const session = await getSession(); // requireAdmin ensures session exists but doesn't return it
  if (!session) throw new Error("Unauthorized");

  const body = await req.json();
  const { subject, content } = sendSchema.parse(body);

  // 1. Get active subscribers
  const recipients = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
  });

  if (recipients.length === 0) {
    return NextResponse.json({ message: "No active subscribers found." });
  }

  // 2. Simulate sending
  console.log(
    `[NEWSLETTER SIMULATION] Sending "${subject}" to ${recipients.length} recipients.`,
  );
  console.log(`[CONTENT PREVIEW]: ${content.slice(0, 100)}...`);

  // In a real app, we would loop through recipients or batch send via provider here.
  // await emailProvider.sendBatch(...)

  // 3. Log campaign to DB
  await prisma.newsletterCampaign.create({
    data: {
      subject,
      content,
      recipientCount: recipients.length,
      authorId: session.userId,
      sentAt: new Date(),
    },
  });

  return NextResponse.json({
    message: `Newsletter sent successfully to ${recipients.length} subscribers (Simulated).`,
    count: recipients.length,
  });
});
