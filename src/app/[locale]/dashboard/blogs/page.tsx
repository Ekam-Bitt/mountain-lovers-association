import { BlogList } from "@/components/dashboard/BlogList";
import { BlogService } from "@/services/blog.service";
import { requireVerifiedMember } from "@/lib/auth-guard";

export default async function BlogDashboardPage() {
  const session = await requireVerifiedMember();

  const { blogs } = await BlogService.getBlogs({
    where: {
      authorId: session.userId,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for client component
  const serializedBlogs = blogs.map((blog) => ({
    ...blog,
    createdAt: blog.createdAt.toISOString(),
    publishedAt: blog.publishedAt ? blog.publishedAt.toISOString() : null,
    updatedAt: blog.updatedAt.toISOString(),
    deletedAt: blog.deletedAt ? blog.deletedAt.toISOString() : null,
  }));

  return (
    <div className="container py-8">
      <BlogList initialBlogs={serializedBlogs} />
    </div>
  );
}
