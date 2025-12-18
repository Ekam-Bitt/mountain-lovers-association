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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Check, X, Download, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: string;
}

interface Registration {
  id: string;
  status: string;
  registeredAt: string;
  cancelledAt?: string | null;
  user: User;
}

interface EventRegistrationTableProps {
  eventId: string;
  initialRegistrations: Registration[];
}

export function EventRegistrationTable({
  eventId,
  initialRegistrations,
}: EventRegistrationTableProps) {
  const [registrations, setRegistrations] =
    useState<Registration[]>(initialRegistrations);
  const [loading, setLoading] = useState<string | null>(null); // regId or 'export'
  const router = useRouter();

  const refreshRegistrations = async () => {
    try {
      router.refresh();
      const res = await api.get<{ data: Registration[] }>(
        `/admin/events/${eventId}/registrations`,
      );
      if (res.data) {
        setRegistrations(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusUpdate = async (
    regId: string,
    newStatus: "CONFIRMED" | "CANCELLED",
  ) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`))
      return;
    setLoading(regId);
    try {
      await api.put(`/admin/events/${eventId}/registrations/${regId}`, {
        status: newStatus,
      });
      toast.success("Registration status updated");
      refreshRegistrations();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setLoading(null);
    }
  };

  const handleExport = async () => {
    setLoading("export");
    try {
      // Fetch all registrations
      const res = await api.get<{ data: Registration[] }>(
        `/admin/events/${eventId}/registrations?all=true`,
      );

      const data = res?.data || [];

      if (data.length === 0) {
        toast.warning("No registrations to export");
        return;
      }

      // Generate CSV

      // Generate CSV
      const headers = [
        "User ID",
        "Email",
        "Status",
        "Registration Date",
        "Cancelled Date",
      ];
      const csvContent = [
        headers.join(","),
        ...data.map((reg) =>
          [
            reg.user.id,
            reg.user.email,
            reg.status,
            new Date(reg.registeredAt).toISOString(),
            reg.cancelledAt ? new Date(reg.cancelledAt).toISOString() : "",
          ]
            .map((field) => `"${field}"`)
            .join(","),
        ), // Quote fields to handle commas
      ].join("\n");

      // Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `event_${eventId}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      toast.error("Failed to export registrations");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Total Registrations: {registrations.length}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={loading === "export"}
        >
          {loading === "export" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export CSV
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No registrations found.
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell>
                    <div className="font-medium">{reg.user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {reg.user.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(reg.registeredAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <EventStatusBadge status={reg.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!!loading}
                        >
                          {loading === reg.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {reg.status !== "CONFIRMED" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(reg.id, "CONFIRMED")
                            }
                          >
                            <Check className="mr-2 h-4 w-4" /> Confirm
                          </DropdownMenuItem>
                        )}
                        {reg.status !== "CANCELLED" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(reg.id, "CANCELLED")
                            }
                            className="text-destructive"
                          >
                            <X className="mr-2 h-4 w-4" /> Cancel
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
