import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-guard";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [userCount, eventCount, blogCount, recentRegistrations, recentUsers] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.event.count({ where: { deletedAt: null } }),
        prisma.blog.count({ where: { deletedAt: null } }),

        // Recent Event Registrations
        prisma.eventRegistration.findMany({
          take: 5,
          orderBy: { registeredAt: "desc" },
          include: {
            user: { select: { email: true } },
            event: { select: { title: true } },
          },
        }),

        // Recent Users Joined
        prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, email: true, role: true, createdAt: true },
        }),
      ]);

    return NextResponse.json({
      counts: {
        users: userCount,
        events: eventCount,
        blogs: blogCount,
      },
      recentActivity: {
        registrations: recentRegistrations.map((r) => ({
          user: r.user.email,
          event: r.event.title,
          date: r.registeredAt,
        })),
        newUsers: recentUsers,
      },
    });
  } catch (error) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
