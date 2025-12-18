"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BlogItem } from "@/types/domain";
import { formatDate } from "@/lib/utils";

interface BlogsSectionClientProps {
  blogs: BlogItem[];
}

export function BlogsSectionClient({ blogs }: BlogsSectionClientProps) {
  const t = useTranslations("BlogsSection");
  const locale = useLocale();

  if (!blogs || blogs.length === 0) {
    return (
      <section id="blog" className="relative bg-[#0356c2] py-20">
        <div className="max-w-[1280px] mx-auto px-6 text-center text-white">
          <h2 className="text-[60px] mb-8">{t("title")}</h2>
          <p className="text-xl opacity-80">{t("noBlogs")}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="relative bg-[#0356c2] py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Title */}
        <h2 className="text-white text-[40px] md:text-[60px] text-center mb-16">
          {t("title")}
        </h2>

        {/* Blog Posts */}
        <div className="space-y-16">
          {blogs.map((blog) => {
            return (
              <div
                key={blog.id}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  blog.alignment === "right" ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Image */}
                <div className="relative w-full max-w-[300px] h-[200px] md:w-[180px] md:h-[180px] flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover md:hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div
                  className={`flex-1 text-center ${blog.alignment === "right" ? "md:text-right" : "md:text-left"}`}
                >
                  <h3 className="text-white text-[30px] mb-3">{blog.title}</h3>
                  <div
                    className={`flex items-center w-full md:w-auto mb-4 ${
                      blog.alignment === "right"
                        ? "justify-between md:justify-start md:flex-row-reverse"
                        : "justify-between md:justify-start"
                    } gap-0 md:gap-4`}
                  >
                    <p className="text-[#ffe500] text-[15px] max-w-[50%] truncate">
                      {blog.author}
                    </p>
                    <p className="text-[#9cd4fc] text-[15px]">
                      {formatDate(blog.date, locale)}
                    </p>
                  </div>
                  <p className="text-[#ededed] text-[15px] leading-relaxed mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <Link
                    href={`/blogs/${blog.id}`}
                    className="text-[#ffe500] text-[15px] hover:underline"
                  >
                    {t("readMore")}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout More Button */}
        {/* Checkout More Button */}
        <div className="text-center mt-12">
          <Link
            href="/blogs"
            className="inline-flex items-center text-[#ffe500] font-bold text-lg hover:underline decoration-2 underline-offset-4 transition-all"
          >
            {t("checkoutMore")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
