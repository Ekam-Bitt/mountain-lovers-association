"use client";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { NewsItem } from "@/types/domain";
import { formatDate } from "@/lib/utils";

interface NewsSectionClientProps {
  newsItems: NewsItem[];
}

export function NewsSectionClient({ newsItems }: NewsSectionClientProps) {
  const t = useTranslations("NewsSection");
  const locale = useLocale();

  if (!newsItems || newsItems.length === 0) {
    return (
      <section id="news" className="relative bg-[#0356c2] py-16">
        <div className="max-w-[1280px] mx-auto px-6 text-center text-white">
          <h2 className="text-[40px] md:text-[60px] mb-8">{t("title")}</h2>
          <p className="text-xl opacity-80">{t("noNews")}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="news" className="relative bg-[rgba(0,84,193,0.78)] py-16">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Title */}
        <h2 className="text-white text-[40px] md:text-[60px] text-center mb-12">
          {t("title")}
        </h2>

        {/* Carousel */}
        <div className="px-4 md:px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 cursor-grab active:cursor-grabbing">
              {newsItems.map((item) => (
                <CarouselItem
                  key={item.id}
                  className="pl-4 basis-[85%] md:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-1 h-full">
                    <Card className="bg-transparent border-none shadow-none text-left h-full group">
                      <Link
                        href={`/news/${item.id}`}
                        className="block h-full relative z-10"
                      >
                        <CardContent className="p-0 flex flex-col h-full cursor-pointer">
                          {/* Image */}
                          <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover md:group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>

                          {/* Content */}
                          <div className="space-y-2 flex-1">
                            <p className="text-[#c5c5c5] text-xs">
                              {formatDate(item.date, locale)}
                            </p>
                            <h3 className="text-white text-sm leading-tight font-bold group-hover:underline decoration-[#9cd4fc] decoration-2 underline-offset-4">
                              {item.title}
                            </h3>
                            <p className="text-[#9cd4fc] text-xs leading-tight line-clamp-3">
                              {item.description}
                            </p>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex text-white border-white bg-transparent hover:bg-white hover:text-[#0054c1] disabled:opacity-50 disabled:pointer-events-none -left-4 md:-left-12" />
            <CarouselNext className="hidden md:flex text-white border-white bg-transparent hover:bg-white hover:text-[#0054c1] disabled:opacity-50 disabled:pointer-events-none -right-4 md:-right-12" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
