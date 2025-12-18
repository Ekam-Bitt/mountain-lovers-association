import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { AuthService } from "@/services/auth.service";
import { config } from "@/lib/config";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

const loginOtpSchema = z.object({
  phoneNumber: z.string().min(10),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  try {
    await checkRateLimit(ip);
  } catch {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const result = loginOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid Input" }, { status: 400 });
    }

    const { phoneNumber, code } = result.data;

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    // Check expiry
    if (new Date() > user.otpExpiresAt) {
      return NextResponse.json({ error: "OTP Expired" }, { status: 400 });
    }

    // Check match
    if (user.otpCode !== code) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // --- Success ---

    // Clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiresAt: null },
    });

    // Create Session (Same as Email Login)
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
    };

    const token = await AuthService.signJWT(payload, "7d");

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("OTP Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
