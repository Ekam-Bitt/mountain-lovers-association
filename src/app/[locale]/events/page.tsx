import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
// import { getLocale } from "next-intl/server";
import { formatDate } from "@/lib/utils";
import { EventItem } from "@/types/domain";
import { PublicApiService } from "@/lib/services/public-api";
import { Calendar, Users } from "lucide-react";

// Revalidate every 60 seconds to show new events
export const revalidate = 60;

async function getAllEvents(): Promise<EventItem[]> {
  try {
    // Fetch a large number of events to handle sorting server-side for now
    // Ideally API would support 'upcoming' and 'past' filters
    const response = await PublicApiService.getEvents({ limit: 100 });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch events for page:", error);
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
    title: "Events - Mountain Lovers Club",
    description:
      "Join us for upcoming treks, workshops, and community gatherings.",
  };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Fetch data
  const allEvents = await getAllEvents();

  // Split into Upcoming and Past
  const now = new Date();
  const upcomingEvents = allEvents
    .filter((e) => new Date(e.endDate || e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = allEvents
    .filter((e) => new Date(e.endDate || e.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest past first

  return (
    <main className="min-h-screen bg-[#0356c2] py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <h1 className="text-white text-[50px] md:text-[70px] text-center mb-16 font-bold">
          Events
        </h1>

        <div className="space-y-20">
          {/* UPCOMING SECTION */}
          <section>
            <h2 className="text-[#ffe500] text-3xl md:text-4xl font-bold mb-8 border-b border-white/10 pb-4 inline-block">
              Upcoming Adventures
            </h2>

            {upcomingEvents.length === 0 ? (
              <p className="text-white/70 text-lg">
                No upcoming events scheduled at the moment. Check back soon!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} locale={locale} />
                ))}
              </div>
            )}
          </section>

          {/* PAST SECTION */}
          <section>
            <h2 className="text-white/80 text-3xl md:text-4xl font-bold mb-8 border-b border-white/10 pb-4 inline-block">
              Past Memories
            </h2>

            {pastEvents.length === 0 ? (
              <p className="text-white/50">No past events found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-90">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} locale={locale} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function EventCard({ event, locale }: { event: EventItem; locale: string }) {
  return (
    <Link href={`/events/${event.id}`} className="group h-full">
      <Card className="bg-white border-none shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-4 right-4 bg-[#ffe500] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {event.location}
          </div>
        </div>

        <CardContent className="p-6 flex-1 flex flex-col">
          {/* Date */}
          <div className="flex items-center gap-2 text-[#0356c2] text-sm font-semibold mb-3">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.date, locale)}</span>
          </div>

          {/* Title */}
          <h3 className="text-black text-xl font-bold mb-3 line-clamp-2 bg-left-bottom bg-gradient-to-r from-[#0356c2] to-[#0356c2] bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-300">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 line-clamp-3 mb-4 flex-1">
            {event.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
            {event.capacity && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <Users className="h-4 w-4" />
                <span>{event.capacity} Spots</span>
              </div>
            )}
            <span className="text-[#0356c2] font-semibold group-hover:translate-x-1 transition-transform">
              View Details →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
