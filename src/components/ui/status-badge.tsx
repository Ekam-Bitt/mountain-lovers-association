import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "PUBLISHED":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
      );
    case "DRAFT":
      return <Badge variant="secondary">Draft</Badge>;
    case "ARCHIVED":
      return (
        <Badge variant="outline" className="text-orange-500 border-orange-500">
          Archived
        </Badge>
      );
    case "FLAGGED":
      return <Badge variant="destructive">Flagged</Badge>;
    case "BANNED":
      return <Badge variant="destructive">Banned</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
