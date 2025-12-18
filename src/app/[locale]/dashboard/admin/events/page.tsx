import { AdminEventList } from "@/components/admin/AdminEventList";
import { EventService } from "@/services/event.service";
import { requireAdmin } from "@/lib/auth-guard";

export default async function AdminEventsPage() {
  await requireAdmin();

  const { events } = await EventService.getEvents({
    where: { deletedAt: null },
  });

  // Serialize dates
  const serializedEvents = events.map((event) => ({
    ...event,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
    publishedAt: event.publishedAt ? event.publishedAt.toISOString() : null,
    deletedAt: event.deletedAt ? event.deletedAt.toISOString() : null,
    _count: {
      registrations: event._count?.registrations || 0,
    },
    organizer: {
      email: event.organizer.email,
    },
  }));

  return (
    <div className="container py-8">
      <AdminEventList initialEvents={serializedEvents} />
    </div>
  );
}
