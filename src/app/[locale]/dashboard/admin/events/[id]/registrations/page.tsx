import { EventRegistrationTable } from "@/components/admin/EventRegistrationTable";
import { requireAdmin } from "@/lib/auth-guard";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEventRegistrationsPage(props: PageProps) {
  await requireAdmin();
  const params = await props.params;
  const { id } = params;

  const [event, registrations] = await Promise.all([
    prisma.event.findUnique({
      where: { id, deletedAt: null },
      select: { title: true, slug: true },
    }),
    prisma.eventRegistration.findMany({
      where: { eventId: id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { registeredAt: "desc" },
      // Initial fetch limit can be standard pagination, but for simplicity fetching all or first page
      take: 50,
    }),
  ]);

  if (!event) {
    notFound();
  }

  const serializedRegistrations = registrations.map((reg) => ({
    ...reg,
    registeredAt: reg.registeredAt.toISOString(),
    cancelledAt: reg.cancelledAt ? reg.cancelledAt.toISOString() : null,
    deletedAt: reg.deletedAt ? reg.deletedAt.toISOString() : null,
  }));

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registrations</h1>
          <p className="text-muted-foreground">
            Managing attendees for &quot;{event.title}&quot;
          </p>
        </div>
      </div>

      <EventRegistrationTable
        eventId={id}
        initialRegistrations={serializedRegistrations}
      />
    </div>
  );
}
