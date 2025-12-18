import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { AuthService } from "@/services/auth.service";
import { config } from "@/lib/config";
import { cookies } from "next/headers";
import {
  checkRateLimit,
  checkBruteForce,
  recordFailedLogin,
  clearFailedLogins,
} from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  try {
    // Rate limiting
    await checkRateLimit(ip);
  } catch {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    // Check brute-force protection
    try {
      checkBruteForce(email);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Account temporarily locked",
        },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    if (!user) {
      recordFailedLogin(email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isValid = await AuthService.verifyPassword(
      user.passwordHash,
      password,
    );

    if (!isValid) {
      recordFailedLogin(email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Clear failed attempts on successful login
    clearFailedLogins(email);

    // Create Session
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
      maxAge: 7 * 24 * 60 * 60, // 7 days (seconds)
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Too Many Requests") {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
