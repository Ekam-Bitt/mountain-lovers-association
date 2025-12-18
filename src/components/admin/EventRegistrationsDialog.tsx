"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface EventRegistrationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  eventTitle?: string;
}

interface Registration {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  registeredAt: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export function EventRegistrationsDialog({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}: EventRegistrationsDialogProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await api.get<{ data: Registration[] }>(
        `/admin/events/${eventId}/registrations`,
      );
      setRegistrations(res.data);
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchRegistrations();
    }
  }, [isOpen, eventId, fetchRegistrations]);

  const handleUpdateStatus = async (
    regId: string,
    newStatus: "CONFIRMED" | "CANCELLED",
  ) => {
    if (!eventId) return;
    setProcessingId(regId);
    try {
      await api.put(`/admin/events/${eventId}/registrations/${regId}`, {
        status: newStatus,
      });

      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === regId ? { ...reg, status: newStatus } : reg,
        ),
      );

      toast.success(`Registration ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error("Failed to update registration:", error);
      toast.error("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-0 text-black sm:max-w-3xl max-h-[80vh] overflow-y-auto shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#0356c2]">
            Manage Registrations
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {eventTitle
              ? `Registrations for: ${eventTitle}`
              : "Manage event attendees"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0356c2]" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No registrations found for this event.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="text-gray-500">User</TableHead>
                <TableHead className="text-gray-500">Date</TableHead>
                <TableHead className="text-gray-500">Status</TableHead>
                <TableHead className="text-gray-500 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => (
                <TableRow
                  key={reg.id}
                  className="border-gray-100 hover:bg-gray-50"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-black font-medium">
                        {reg.user.email}
                      </span>
                      <span className="text-xs text-gray-500">
                        {reg.user.role}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {format(new Date(reg.registeredAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        reg.status === "CONFIRMED"
                          ? "border-gray-200 text-gray-700 bg-gray-50"
                          : reg.status === "PENDING"
                            ? "border-gray-200 text-gray-700 bg-gray-50"
                            : "border-gray-200 text-gray-700 bg-gray-50"
                      }`}
                    >
                      {reg.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {reg.status === "PENDING" && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() =>
                              handleUpdateStatus(reg.id, "CONFIRMED")
                            }
                            disabled={processingId === reg.id}
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleUpdateStatus(reg.id, "CANCELLED")
                            }
                            disabled={processingId === reg.id}
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {reg.status === "CONFIRMED" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            handleUpdateStatus(reg.id, "CANCELLED")
                          }
                          disabled={processingId === reg.id}
                          title="Cancel Registration"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {/* Reprocess logic if needed */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
