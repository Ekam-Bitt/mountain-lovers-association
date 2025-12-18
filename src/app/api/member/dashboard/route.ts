import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-guard";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [registrations, blogs] = await Promise.all([
      // Fetch events registered by user
      prisma.eventRegistration.findMany({
        where: { userId: session.userId, deletedAt: null },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              startDate: true,
              location: true,
              status: true,
            },
          },
        },
        orderBy: { registeredAt: "desc" },
      }),
      // Fetch blogs authored by user
      prisma.blog.findMany({
        where: { authorId: session.userId, deletedAt: null },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          publishedAt: true,
          excerpt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      myEvents: registrations.map((reg) => ({
        registrationId: reg.id,
        status: reg.status,
        registeredAt: reg.registeredAt,
        event: reg.event,
      })),
      myBlogs: blogs,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
