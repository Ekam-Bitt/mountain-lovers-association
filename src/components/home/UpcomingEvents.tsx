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
import { EventItem } from "@/types/domain";
import { formatDate } from "@/lib/date";
import imgRectangle11 from "@/assets/01c6bf1ed4c92c0359a313530397ac9d611be8c0.png";

export function UpcomingEvents() {
  const t = useTranslations('UpcomingEvents');
  const locale = useLocale();

  const events: (EventItem & { translationKey?: string })[] = [
    {
      id: 'item1',
      title: 'Event 1',
      description: 'Desc',
      image: imgRectangle11,
      date: '2024-01-28',
    },
    {
      id: 'item1-copy',
      title: 'Event 1 Copy',
      description: 'Desc',
      image: imgRectangle11,
      date: '2024-01-28',
      translationKey: 'item1'
    },
    {
      id: 'item3',
      title: 'Event 3',
      description: 'Desc',
      image: imgRectangle11,
      date: '2024-02-15',
    },
    {
      id: 'item4',
      title: 'Event 4',
      description: 'Desc',
      image: imgRectangle11,
      date: '2024-03-05',
    }
  ];

  if (!events || events.length === 0) {
    return (
      <section id="events" className="relative bg-white py-16">
        <div className="max-w-[1280px] mx-auto px-6 text-center text-[#013370]">
          <h2 className="text-[40px] md:text-[60px] mb-8">{t('title')}</h2>
          <p className="text-xl opacity-80">{t('noEvents')}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="relative bg-white py-16">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Title */}
        <h2 className="text-[#013370] text-[40px] md:text-[60px] text-center mb-12">{t('title')}</h2>

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
              {events.map((event) => {
                const key = event.translationKey || event.id;
                return (
                  <CarouselItem key={event.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="p-1">
                      <Card className="bg-transparent border-none shadow-none text-left">
                        <CardContent className="p-0 flex flex-col group cursor-pointer">
                          {/* Image */}
                          <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
                            <Image
                              src={event.image}
                              alt={t(`items.${key}.title`)}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                          {/* Content */}
                          <div className="space-y-2">
                            <p className="text-[#7a7979] text-[11px]">{formatDate(event.date, locale)}</p>
                            <h3 className="text-[#035bc1] text-[13px] leading-tight">{t(`items.${key}.title`)}</h3>
                            <p className="text-[#1e73d6] text-[10px] leading-tight">{t(`items.${key}.description`)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="text-[#035bc1] border-[#035bc1] bg-transparent hover:bg-[#035bc1] hover:text-white disabled:opacity-50 disabled:pointer-events-none -left-4 md:-left-12" />
            <CarouselNext className="text-[#035bc1] border-[#035bc1] bg-transparent hover:bg-[#035bc1] hover:text-white disabled:opacity-50 disabled:pointer-events-none -right-4 md:-right-12" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}