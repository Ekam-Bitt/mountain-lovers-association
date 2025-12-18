import { AdminNewsList } from "@/components/admin/AdminNewsList";
import { requireAdmin } from "@/lib/auth-guard";
import prisma from "@/lib/db";

export default async function AdminNewsPage() {
  await requireAdmin();

  const news = await prisma.news.findMany({
    where: { deletedAt: null },
    include: {
      author: {
        select: {
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedNews = news.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
    deletedAt: item.deletedAt ? item.deletedAt.toISOString() : null,
  }));

  return (
    <div className="container py-8">
      <AdminNewsList initialNews={serializedNews} />
    </div>
  );
}
