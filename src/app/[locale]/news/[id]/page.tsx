import Image from "next/image";
import { notFound } from "next/navigation";
// import { getTranslations } from "next-intl/server";
import { formatDate } from "@/lib/utils";
import { NewsItem } from "@/types/domain";
import { PublicApiService } from "@/lib/services/public-api";

async function getNews(id: string): Promise<NewsItem | null> {
  try {
    return await PublicApiService.getNewsById(id);
  } catch (error) {
    console.error(`Failed to fetch news ${id}:`, error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await getNews(id);

  if (!news) {
    return {
      title: "News Not Found",
    };
  }

  return {
    title: `${news.title} - Mountain Lovers Club`,
    description: news.description,
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;

  // Validate locale if needed, or use it for translations
  // const t = await getTranslations({ locale, namespace: "NewsSection" });

  const news = await getNews(id);

  if (!news) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0356c2] pb-20 pt-32">
      <article className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-[#ffe500] text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {news.title}
          </h1>

          <div className="text-white text-lg mb-8">
            <time dateTime={news.date}>{formatDate(news.date, locale)}</time>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-12 shadow-2xl">
          <Image
            src={news.image}
            alt={news.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="text-[#9cd4fc] text-lg leading-relaxed space-y-4">
          <div
            dangerouslySetInnerHTML={{
              __html: (news.description || "").replace(/\n/g, "<br/>"),
            }}
          />
        </div>
      </article>
    </div>
  );
}
