import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

const sendOtpSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number required"),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  try {
    await checkRateLimit(ip); // Global rate limit
  } catch {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const result = sendOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid Input", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { phoneNumber } = result.data;

    // Find user by phone number
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      // Security: Don't reveal user doesn't exist, just pretend to send (or error if strictly signup required)
      // For this app, let's say "User not found" is acceptable for clarity, or auto-signup logic if allowed.
      // Requirement says "Login", so we'll assume existing user.
      return NextResponse.json(
        { error: "Phone number not registered." },
        { status: 404 },
      );
    }

    // Generate Mock OTP
    const otpCode = "123456"; // Fixed for Dev, or: Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt },
    });

    // In production, send via SMS here.
    console.log(`[OTP-DEV] Code for ${phoneNumber}: ${otpCode}`);

    return NextResponse.json({
      success: true,
      message: "OTP Sent",
      devCode: otpCode, // Explicitly returning for Dev UI to show if needed
    });
  } catch (error) {
    console.error("OTP Send Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
