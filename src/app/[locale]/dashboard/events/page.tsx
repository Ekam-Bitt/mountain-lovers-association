import { EventRegistrationList } from "@/components/dashboard/EventRegistrationList";
import { EventService } from "@/services/event.service";
import { requireVerifiedMember } from "@/lib/auth-guard";

export default async function EventDashboardPage() {
  const session = await requireVerifiedMember();

  const registrations = await EventService.getRegistrationsForUser(
    session.userId,
  );

  // Serialize dates
  const serializedRegistrations = registrations.map((reg) => ({
    ...reg,
    createdAt: reg.createdAt.toISOString(),
    updatedAt: reg.updatedAt.toISOString(),
    cancelledAt: reg.cancelledAt ? reg.cancelledAt.toISOString() : null,
    deletedAt: reg.deletedAt ? reg.deletedAt.toISOString() : null,
    event: {
      ...reg.event,
      startDate: reg.event.startDate.toISOString(),
      endDate: reg.event.endDate.toISOString(),
    },
  }));

  return (
    <div className="container py-8">
      <EventRegistrationList initialRegistrations={serializedRegistrations} />
    </div>
  );
}
