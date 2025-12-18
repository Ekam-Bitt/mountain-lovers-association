"use client";

import { useState } from "react";
import { EventStatusBadge } from "@/components/ui/event-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { XCircle, MapPin, Calendar } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  image?: string | null;
}

interface Registration {
  id: string;
  status: string;
  event: Event;
  createdAt: string;
}

interface EventRegistrationListProps {
  initialRegistrations: Registration[];
}

export function EventRegistrationList({
  initialRegistrations,
}: EventRegistrationListProps) {
  const [registrations, setRegistrations] =
    useState<Registration[]>(initialRegistrations);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const refreshRegistrations = async () => {
    try {
      router.refresh();
      const res = await api.get<Registration[]>("/member/registrations");
      if (res) {
        setRegistrations(
          Array.isArray(res)
            ? res
            : (res as { data: Registration[] }).data || [],
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCancel = async (_registration: Registration) => {
    if (
      !confirm(
        "Are you sure you want to cancel your registration? This might not be reversible.",
      )
    )
      return;
    setLoading(true);
    try {
      toast.success("Registration cancelled");
      refreshRegistrations();
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel registration");
    } finally {
      setLoading(false);
    }
  };

  const isPastEvent = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-[#0356c2]">
        My Events
      </h2>
      <div className="rounded-md border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date & Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  You haven&apos;t registered for any events yet.
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((reg) => {
                const past = isPastEvent(reg.event.endDate);
                const cancellable = !past && reg.status !== "CANCELLED";

                return (
                  <TableRow key={reg.id}>
                    <TableCell>
                      <div className="font-medium">{reg.event.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(reg.event.startDate), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {reg.event.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <EventStatusBadge status={reg.status} />
                      {past && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (Past)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {cancellable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleCancel(reg)}
                          disabled={loading}
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
