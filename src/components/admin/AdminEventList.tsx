"use client";

import { useState } from "react";
import { EventForm } from "@/components/forms/EventForm";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Pencil, Trash2, Plus, Calendar } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  status: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  capacity?: number | null;
  image?: string | null;
  publishedAt: string | null;
  _count?: {
    registrations: number;
  };
  // Include minimal organizer info if handy, though admin usually handles all
  organizer: {
    email: string;
  };
}

interface AdminEventListProps {
  initialEvents: Event[];
}

export function AdminEventList({ initialEvents }: AdminEventListProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const refreshEvents = async () => {
    try {
      router.refresh();
      const res = await api.get<{ data: Event[] }>("/admin/events");
      if (res.data) {
        setEvents(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    refreshEvents();
  };

  const handleEditSuccess = () => {
    setEditingEvent(null);
    refreshEvents();
  };

  const handleDelete = async (event: Event) => {
    const regCount = event._count?.registrations || 0;
    const confirmMsg =
      regCount > 0
        ? `WARNING: This event has ${regCount} confirmed registrations.\nDeleting it will remove all registrations.\n\nAre you sure you want to delete "${event.title}"?`
        : `Are you sure you want to delete "${event.title}"?`;

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      await api.delete(`/admin/events/${event.id}`);
      refreshEvents();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#0356c2]">
          Events
        </h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#ffe500] text-black hover:bg-[#ffe500]/90 font-semibold border-0">
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto bg-white text-black border-0">
            <DialogHeader>
              <DialogTitle className="text-[#0356c2]">
                Create New Event
              </DialogTitle>
            </DialogHeader>
            <EventForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Registrations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No events found.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    <div>{event.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {event.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={event.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {format(new Date(event.startDate), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>{event._count?.registrations || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/dashboard/admin/events/${event.id}/registrations`,
                          )
                        }
                      >
                        Registrations
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingEvent(event)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(event)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editingEvent}
        onOpenChange={(open) => !open && setEditingEvent(null)}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <EventForm
              eventId={editingEvent.id}
              registrationCount={editingEvent._count?.registrations || 0}
              initialData={{
                title: editingEvent.title,
                description: editingEvent.description,
                location: editingEvent.location,
                image: editingEvent.image || "",
                startDate: editingEvent.startDate.slice(0, 16), // Format for datetime-local
                endDate: editingEvent.endDate.slice(0, 16),
                capacity: editingEvent.capacity?.toString() || "",
                status: editingEvent.status as
                  | "DRAFT"
                  | "PUBLISHED"
                  | "ARCHIVED",
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
