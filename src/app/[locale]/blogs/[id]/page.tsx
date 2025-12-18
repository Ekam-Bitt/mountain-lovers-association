import Image from "next/image";
import { notFound } from "next/navigation";
// import { getTranslations } from "next-intl/server";
import { formatDate } from "@/lib/utils";
import { BlogItem } from "@/types/domain";
import { PublicApiService } from "@/lib/services/public-api";

async function getBlog(id: string): Promise<BlogItem | null> {
  try {
    return await PublicApiService.getBlogById(id);
  } catch (error) {
    console.error(`Failed to fetch blog ${id}:`, error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blog = await getBlog(id);

  if (!blog) {
    return {
      title: "Blog Not Found",
    };
  }

  return {
    title: `${blog.title} - Mountain Lovers Club`,
    description: blog.excerpt,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  // const t = await getTranslations({ locale, namespace: "BlogsSection" });

  const blog = await getBlog(id);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0356c2] pb-20 pt-32">
      <article className="max-w-4xl mx-auto px-6 bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-[#0356c2] text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-black/60">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#0356c2]">
                {blog.author}
              </span>
            </div>
            <span>•</span>
            <time dateTime={blog.date}>{formatDate(blog.date, locale)}</time>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-12 shadow-lg">
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none prose-headings:text-[#0356c2] prose-p:text-black/80 prose-strong:text-black">
          <div
            dangerouslySetInnerHTML={{
              __html: (blog.content || "").replace(/\n/g, "<br/>"),
            }}
          />
        </div>
      </article>
    </div>
  );
}
