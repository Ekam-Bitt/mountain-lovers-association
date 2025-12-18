import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/services/blog.service";
import { withErrorHandler, NotFoundError, ForbiddenError } from "@/lib/errors";
import { requireVerifiedMember } from "@/lib/auth-guard";
import { updateBlogSchema } from "@/lib/validation";
import { ensureSlug } from "@/lib/validation";
import { checkSlugUniqueness } from "@/lib/slug";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/member/blogs/[id] - Get single blog (owner only)
export const GET = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const session = await requireVerifiedMember();
    const { id } = await context.params;

    const blog = await BlogService.getBlogById(id);

    if (!blog) {
      throw new NotFoundError("Blog post not found");
    }

    if (blog.authorId !== session.userId && session.role !== "ADMIN") {
      throw new NotFoundError("Blog post not found");
    }

    return NextResponse.json(blog);
  },
);

// PATCH /api/member/blogs/[id] - Update blog (owner only)
export const PATCH = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const session = await requireVerifiedMember();
    const { id } = await context.params;
    const body = await req.json();
    const data = updateBlogSchema.parse(body);

    const blog = await BlogService.getBlogById(id);

    if (!blog) {
      throw new NotFoundError("Blog post not found");
    }

    if (blog.authorId !== session.userId && session.role !== "ADMIN") {
      throw new ForbiddenError("You can only modify your own blog posts");
    }

    // [EDGE CASE] Banned blogs cannot be edited
    if (blog.status === "BANNED" && session.role !== "ADMIN") {
      throw new ForbiddenError(
        "This blog post has been banned and cannot be edited.",
      );
    }

    // [EDGE CASE] Flagged blogs key reset to DRAFT on any edit
    if (blog.status === "FLAGGED" && session.role !== "ADMIN") {
      data.status = "DRAFT";
    }

    // Handle slug update if provided
    let slug = blog.slug;
    if (data.slug !== undefined) {
      slug = data.slug || ensureSlug({ title: data.title || blog.title });
      if (slug !== blog.slug) {
        await checkSlugUniqueness("blog", slug, id);
      }
    } else if (data.title && data.title !== blog.title) {
      slug = ensureSlug({ title: data.title });
      if (slug !== blog.slug) {
        await checkSlugUniqueness("blog", slug, id);
      }
    }

    const updatedBlog = await BlogService.updateBlog(
      id,
      { ...data, slug },
      session.userId,
    );

    return NextResponse.json(updatedBlog);
  },
);

// DELETE /api/member/blogs/[id] - Soft delete blog (owner only)
export const DELETE = withErrorHandler(
  async (req: NextRequest, context: RouteContext) => {
    const session = await requireVerifiedMember();
    const { id } = await context.params;

    const blog = await BlogService.getBlogById(id);

    if (!blog) {
      throw new NotFoundError("Blog post not found");
    }

    if (blog.authorId !== session.userId && session.role !== "ADMIN") {
      throw new ForbiddenError("You can only delete your own blog posts");
    }

    await BlogService.deleteBlog(id, session.userId);

    return NextResponse.json({ success: true, message: "Blog post deleted" });
  },
);
