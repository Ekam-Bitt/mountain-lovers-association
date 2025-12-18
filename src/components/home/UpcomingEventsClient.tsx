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
import { EventItem } from "@/types/domain";
import { formatDate } from "@/lib/utils";

interface UpcomingEventsClientProps {
  events: EventItem[];
}

export function UpcomingEventsClient({ events }: UpcomingEventsClientProps) {
  const t = useTranslations("UpcomingEvents");
  const locale = useLocale();

  if (!events || events.length === 0) {
    return (
      <section id="events" className="relative bg-white py-16">
        <div className="max-w-[1280px] mx-auto px-6 text-center text-[#013370]">
          <h2 className="text-[40px] md:text-[60px] mb-8">{t("title")}</h2>
          <p className="text-xl opacity-80">{t("noEvents")}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="relative bg-white py-16">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Title */}
        <h2 className="text-[#013370] text-[40px] md:text-[60px] text-center mb-12">
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
              {events.map((event) => {
                return (
                  <CarouselItem
                    key={event.id}
                    className="pl-4 basis-[85%] md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="p-1">
                      <Card className="bg-transparent border-none shadow-none text-left">
                        <Link
                          href={`/events/${event.id}`}
                          className="block h-full relative z-10"
                        >
                          <CardContent className="p-0 flex flex-col group cursor-pointer">
                            {/* Image */}
                            <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
                              <Image
                                src={event.image}
                                alt={event.title}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                className="object-cover md:group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                              <p className="text-[#7a7979] text-xs">
                                {formatDate(event.date, locale)}
                              </p>
                              <h3 className="text-[#035bc1] text-sm leading-tight">
                                {event.title}
                              </h3>
                              <p className="text-[#1e73d6] text-xs leading-tight line-clamp-3">
                                {event.description}
                              </p>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex text-[#035bc1] border-[#035bc1] bg-transparent hover:bg-[#035bc1] hover:text-white disabled:opacity-50 disabled:pointer-events-none -left-4 md:-left-12" />
            <CarouselNext className="hidden md:flex text-[#035bc1] border-[#035bc1] bg-transparent hover:bg-[#035bc1] hover:text-white disabled:opacity-50 disabled:pointer-events-none -right-4 md:-right-12" />
          </Carousel>
        </div>

        {/* Checkout All Events Link */}
        <div className="text-center mt-12">
          <Link
            href="/events"
            className="inline-flex items-center text-[#013370] font-bold text-lg hover:underline decoration-2 underline-offset-4 transition-all"
          >
            {t("viewAllEvents") || "Checkout all events"} →
          </Link>
        </div>
      </div>
    </section>
  );
}
