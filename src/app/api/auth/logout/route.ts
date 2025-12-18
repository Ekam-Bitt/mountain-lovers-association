import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/auth/logout - Logout user
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");

  return NextResponse.json({ success: true, message: "Logged out" });
}
