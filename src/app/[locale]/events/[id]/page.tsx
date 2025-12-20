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
      <article className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-[#ffe500] text-4xl md:text-6xl font-bold mb-8 leading-tight">
            {event.title}
          </h1>

          <div className="grid md:grid-cols-2 gap-8 text-white text-lg mb-8">
            <div>
              <span className="font-semibold block mb-2">Date:</span>
              <span className="text-[#9cd4fc]">
                {formatDate(event.date, locale)}
                {event.endDate && ` - ${formatDate(event.endDate, locale)}`}
              </span>
            </div>

            <div>
              <span className="font-semibold block mb-2">Location:</span>
              <span className="text-[#9cd4fc]">{event.location}</span>
            </div>

            {event.capacity && (
              <div>
                <span className="font-semibold block mb-2">Capacity:</span>
                <span className="text-[#9cd4fc]">{event.capacity} people</span>
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
        </header>

        {/* Featured Image */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-12 shadow-2xl">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Description */}
        <div className="space-y-6">
          <h2 className="text-[#ffe500] text-3xl font-bold">
            About this Event
          </h2>
          <p className="text-[#9cd4fc] text-lg leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </div>
      </article>
    </div>
  );
}
