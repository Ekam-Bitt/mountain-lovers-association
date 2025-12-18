import { AdminBlogList } from "@/components/admin/AdminBlogList";
import { requireAdmin } from "@/lib/auth-guard";
import prisma from "@/lib/db";

export default async function AdminBlogsPage() {
  await requireAdmin();

  const blogs = await prisma.blog.findMany({
    where: { deletedAt: null },
    include: {
      author: {
        select: {
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serializedBlogs = blogs.map((blog) => ({
    ...blog,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    publishedAt: blog.publishedAt ? blog.publishedAt.toISOString() : null,
    deletedAt: blog.deletedAt ? blog.deletedAt.toISOString() : null,
  }));

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Blog Moderation</h1>
        <p className="text-muted-foreground">
          Flag or ban inappropriate content.
        </p>
      </div>
      <AdminBlogList initialBlogs={serializedBlogs} />
    </div>
  );
}
