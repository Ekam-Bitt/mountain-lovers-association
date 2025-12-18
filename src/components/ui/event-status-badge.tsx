import { Badge } from "@/components/ui/badge";

interface EventStatusBadgeProps {
  status: string;
}

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  switch (status) {
    case "CONFIRMED":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">
          Pending
        </Badge>
      );
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "WAITLISTED":
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-500">
          Waitlist
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
