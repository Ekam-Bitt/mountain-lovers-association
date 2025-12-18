import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import * as z from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = subscribeSchema.parse(body);

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      // Idempotent success (don't reveal existence but don't error)
      // Or we can return a specific message if we want to be helpful
      if (!existing.isActive) {
        // Reactivate if previously unsubscribed
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { isActive: true },
        });
      }
      return NextResponse.json({ message: "Subscribed successfully" });
    }

    await prisma.newsletterSubscriber.create({
      data: { email },
    });

    return NextResponse.json(
      { message: "Subscribed successfully" },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
