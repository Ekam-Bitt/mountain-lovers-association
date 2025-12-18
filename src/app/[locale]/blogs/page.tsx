import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { formatDate } from "@/lib/utils";
import { BlogItem } from "@/types/domain";
import { PublicApiService } from "@/lib/services/public-api";

async function getBlogs(): Promise<BlogItem[]> {
  try {
    const response = await PublicApiService.getBlogs({ limit: 50 });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch blogs for page:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  return {
    title: "Our Blogs - Mountain Lovers Club",
    description:
      "Read the latest stories and updates from the Mountain Lovers Club.",
  };
}

export default async function BlogsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <BlogsPageContent />;
}

async function BlogsPageContent() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "BlogsPage" });
  const tSection = await getTranslations({ locale, namespace: "BlogsSection" });

  const blogs = await getBlogs();

  if (!blogs || blogs.length === 0) {
    return (
      <main className="min-h-screen bg-[#0356c2] py-20">
        <div className="max-w-[1280px] mx-auto px-6 text-center text-white">
          <h1 className="text-[50px] md:text-[70px] mb-16 font-bold">
            {t("title")}
          </h1>
          <p className="text-xl opacity-80">{tSection("noBlogs")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0356c2] py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <h1 className="text-white text-[50px] md:text-[70px] text-center mb-16 font-bold">
          {t("title")}
        </h1>

        {/* Vertical Scroll Container */}
        <div className="flex justify-center">
          <div className="w-full max-w-5xl h-[800px] overflow-y-auto pr-4 custom-scrollbar">
            <div className="space-y-8">
              {blogs.map((blog) => (
                <div key={blog.id} className="w-full">
                  <Card className="bg-transparent border-none shadow-none text-left">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Image */}
                        <div className="relative w-[180px] h-[180px] flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={blog.image}
                            alt={blog.title}
                            fill
                            className="object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-left">
                          <h3 className="text-white text-[30px] mb-2 font-bold">
                            {blog.title}
                          </h3>
                          <div className="flex items-center gap-4 mb-3">
                            <p className="text-[#ffe500] text-[14px] font-semibold">
                              {blog.author}
                            </p>
                            <p className="text-[#9cd4fc] text-[14px]">
                              {formatDate(blog.date, locale)}
                            </p>
                          </div>
                          <p className="text-[#ededed] text-[15px] leading-relaxed mb-4 line-clamp-3">
                            {blog.excerpt}
                          </p>
                          <Link
                            href={`/blogs/${blog.id}`}
                            className="text-[#ffe500] text-[15px] hover:underline font-medium"
                          >
                            {tSection("readMore")}
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* End of List Indicator */}
            <div className="text-center py-2 mt-4 border-t border-white/10">
              <p className="text-white/50 text-sm">{t("endOfList")}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
