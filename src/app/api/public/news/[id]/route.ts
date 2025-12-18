import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler, NotFoundError } from "@/lib/errors";
import prisma from "@/lib/db";

// GET /api/public/news/[id] - Get single published news
export const GET = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const news = await prisma.news.findFirst({
      where: {
        id,
        status: "PUBLISHED",
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!news) {
      throw new NotFoundError("News item not found");
    }

    const response = NextResponse.json(news);

    // Add caching headers
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=600",
    );

    return response;
  },
);
