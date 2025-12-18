import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-guard";
import prisma from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "MEMBER_UNVERIFIED") {
      return NextResponse.json(
        { error: "User is already verified or is an admin" },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: "MEMBER_VERIFIED",
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        verifiedAt: updatedUser.verifiedAt,
      },
    });
  } catch (error) {
    console.error("Verify User Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
