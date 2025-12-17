'use client';

import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { BlogItem } from "@/types/domain";
import { formatDate } from "@/lib/date";
import imgBlog1 from "@/assets/fb8368d3946e1c662b9b0d3a10662fb7bd1673a3.png";
import imgBlog2 from "@/assets/59338168212132e260612dde60e83f93504cd3ad.png";
import imgBlog3 from "@/assets/fc3c17cc72371f6d536e65dc52e1e813c6c44f13.png";

export function BlogsSection() {
  const t = useTranslations('BlogsSection');
  const locale = useLocale();

  const blogs: (BlogItem & { translationKey?: string })[] = [
    {
      id: 'item1',
      title: 'Blog 1',
      image: imgBlog1,
      author: 'GOUTAM KR. BITT',
      date: '2023-12-25',
      alignment: 'left'
    },
    {
      id: 'item1-copy',
      title: 'Blog 1 Copy',
      image: imgBlog3,
      author: 'GOUTAM KR. BITT',
      date: '2023-12-25',
      alignment: 'right',
      translationKey: 'item1'
    },
    {
      id: 'item1-copy2',
      title: 'Blog 1 Copy 2',
      image: imgBlog2,
      author: 'GOUTAM KR. BITT',
      date: '2023-12-25',
      alignment: 'left',
      translationKey: 'item1'
    }
  ];

  if (!blogs || blogs.length === 0) {
    return (
      <section id="blog" className="relative bg-[#0356c2] py-20">
        <div className="max-w-[1280px] mx-auto px-6 text-center text-white">
          <h2 className="text-[60px] mb-8">{t('title')}</h2>
          <p className="text-xl opacity-80">{t('noBlogs')}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="relative bg-[#0356c2] py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Title */}
        <h2 className="text-white text-[40px] md:text-[60px] text-center mb-16">{t('title')}</h2>

        {/* Blog Posts */}
        <div className="space-y-16">
          {blogs.map((blog) => {
            const key = blog.translationKey || blog.id;
            return (
              <div
                key={blog.id}
                className={`flex flex-col md:flex-row items-center gap-8 ${blog.alignment === 'right' ? 'md:flex-row-reverse' : ''
                  }`}
              >
                {/* Image */}
                <div className="relative w-full max-w-[300px] h-[200px] md:w-[180px] md:h-[180px] flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={blog.image}
                    alt={t(`items.${key}.title`)}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover md:hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className={`flex-1 text-center ${blog.alignment === 'right' ? 'md:text-right' : 'md:text-left'}`}>
                  <h3 className="text-white text-[30px] mb-3">{t(`items.${key}.title`)}</h3>
                  <div className={`flex items-center w-full md:w-auto mb-4 ${blog.alignment === 'right'
                    ? 'justify-between md:justify-start md:flex-row-reverse'
                    : 'justify-between md:justify-start'
                    } gap-0 md:gap-4`}>
                    <p className="text-[#ffe500] text-[15px] max-w-[50%] truncate">{blog.author}</p>
                    <p className="text-[#9cd4fc] text-[15px]">{formatDate(blog.date, locale)}</p>
                  </div>
                  <p className="text-[#ededed] text-[15px] leading-relaxed mb-4 line-clamp-3">
                    {t(`items.${key}.excerpt`)}
                  </p>
                  <button className="text-[#ffe500] text-[15px] hover:underline">
                    {t('readMore')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout More Button */}
        <div className="mt-16 text-center">
          <Link
            href="/blogs"
            className="bg-[#ffe500] text-[#0356c2] text-[20px] px-8 py-3 tracking-wider hover:bg-white transition-colors"
          >
            {t('checkoutMore')}
          </Link>
        </div>
      </div>
    </section>
  );
}