'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';
import { NewsItem } from "@/types/domain";
import { formatDate } from "@/lib/date";
import imgRectangle11 from "@/assets/01c6bf1ed4c92c0359a313530397ac9d611be8c0.png";
import imgRectangle12 from "@/assets/9c9578812120d8faa91bb08d1e218fe608bc21cf.png";
import imgRectangle13 from "@/assets/79f9b6e98bb18fdd1c3a0f8ec8b7a78e7a1eec16.png";
import imgRectangle14 from "@/assets/0fffa6cd7eb9ef8bfa077257c39163cfd8bb497d.png";
import imgRectangle15 from "@/assets/6f07c4a96e7ad67eff9de67f2ddd6c2d86907e05.png";

export function NewsSection() {
    const t = useTranslations('NewsSection');
    const locale = useLocale();

    const newsItems: NewsItem[] = [
        {
            id: 'item1',
            title: 'News Item 1', // Placeholder, content from t()
            description: 'Desc',    // Placeholder
            image: imgRectangle11,
            date: '2024-12-15',     // ISO format
        },
        {
            id: 'item2',
            title: 'News Item 2',
            description: 'Desc',
            image: imgRectangle12,
            date: '2025-01-10',
        },
        {
            id: 'item3',
            title: 'News Item 3',
            description: 'Desc',
            image: imgRectangle13,
            date: '2025-03-05',
        },
        {
            id: 'item4',
            title: 'News Item 4',
            description: 'Desc',
            image: imgRectangle14,
            date: '2025-04-20',
        },
        {
            id: 'item5',
            title: 'News Item 5',
            description: 'Desc',
            image: imgRectangle15,
            date: '2025-05-12',
        }
    ];

    if (!newsItems || newsItems.length === 0) {
        return (
            <section id="news" className="relative bg-[rgba(0,84,193,0.78)] py-16">
                <div className="max-w-[1280px] mx-auto px-6 text-center text-white">
                    <h2 className="text-[40px] md:text-[60px] mb-8">{t('title')}</h2>
                    <p className="text-xl opacity-80">{t('noNews')}</p>
                </div>
            </section>
        );
    }

    return (
        <section id="news" className="relative bg-[rgba(0,84,193,0.78)] py-16">
            <div className="max-w-[1280px] mx-auto px-6">
                {/* Title */}
                <h2 className="text-white text-[40px] md:text-[60px] text-center mb-12">{t('title')}</h2>

                {/* Carousel */}
                <div className="px-12">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4 cursor-grab active:cursor-grabbing">
                            {newsItems.map((item) => (
                                <CarouselItem key={item.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                                    <div className="p-1 h-full">
                                        <Card className="bg-transparent border-none shadow-none text-left h-full">
                                            <CardContent className="p-0 flex flex-col group cursor-pointer h-full">
                                                {/* Image */}
                                                <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
                                                    <Image
                                                        src={item.image}
                                                        alt={t(`items.${item.id}.title`)}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="space-y-2 flex-1">
                                                    <p className="text-[#c5c5c5] text-[11px]">{formatDate(item.date, locale)}</p>
                                                    <h3 className="text-white text-[13px] leading-tight font-bold">{t(`items.${item.id}.title`)}</h3>
                                                    <p className="text-[#9cd4fc] text-[10px] leading-tight line-clamp-3">{t(`items.${item.id}.description`)}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="text-white border-white bg-transparent hover:bg-white hover:text-[#0054c1] disabled:opacity-50 disabled:pointer-events-none -left-4 md:-left-12" />
                        <CarouselNext className="text-white border-white bg-transparent hover:bg-white hover:text-[#0054c1] disabled:opacity-50 disabled:pointer-events-none -right-4 md:-right-12" />
                    </Carousel>
                </div>
            </div>
        </section>
    );
}
