import Image from "next/image";
import { notFound } from "next/navigation";
// import { getTranslations } from "next-intl/server";
import { formatDate } from "@/lib/utils";
import { EventItem } from "@/types/domain";
import { PublicApiService } from "@/lib/services/public-api";
import { EventRegistration } from "@/components/events/EventRegistration";

async function getEvent(id: string): Promise<EventItem | null> {
  try {
    return await PublicApiService.getEventById(id);
  } catch (error) {
    console.error(`Failed to fetch event ${id}:`, error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `${event.title} - Mountain Lovers Club`,
    description: event.description,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;

  // Validate locale if needed, or use it for translations
  // const t = await getTranslations({ locale, namespace: "UpcomingEvents" });

  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0356c2] pb-20 pt-32">
      <article className="max-w-4xl mx-auto px-6 bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-[#0356c2] text-4xl font-bold mb-6 leading-tight">
              {event.title}
            </h1>

            <div className="space-y-4 text-lg text-black/80">
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[100px] text-[#0356c2]">
                  Date:
                </span>
                <div>
                  {formatDate(event.date, locale)}
                  {event.endDate && ` - ${formatDate(event.endDate, locale)}`}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[100px] text-[#0356c2]">
                  Location:
                </span>
                <span>{event.location}</span>
              </div>

              {event.capacity && (
                <div className="flex items-start gap-3">
                  <span className="font-semibold min-w-[100px] text-[#0356c2]">
                    Capacity:
                  </span>
                  <span>{event.capacity} people</span>
                </div>
              )}
            </div>

            {/* Registration */}
            <div className="mt-8">
              <EventRegistration
                eventId={event.id.toString()}
                eventCapacity={event.capacity}
                eventDate={event.date.toString()}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="prose prose-lg max-w-none text-black/80">
          <h2 className="text-[#0356c2] text-2xl font-bold mb-4">
            About this Event
          </h2>
          <p className="whitespace-pre-wrap">{event.description}</p>
        </div>
      </article>
    </div>
  );
}
