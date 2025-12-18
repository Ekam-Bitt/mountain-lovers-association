"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { MoreHorizontal, Search, ShieldAlert, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ModerationModal } from "@/components/admin/ModerationModal";
import { toast } from "sonner";

interface AdminUserListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialUsers: any[];
}

export function AdminUserList({ initialUsers }: AdminUserListProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Moderation State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [moderationAction, setModerationAction] = useState<
    "SUSPEND" | "RESTORE" | null
  >(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await api.get<{ data: any[] }>(
        `/admin/users?search=${search}`,
      );
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeration = async () => {
    if (!selectedUser || !moderationAction) return;

    const newRole = moderationAction === "SUSPEND" ? "SUSPENDED" : "MEMBER";

    try {
      await api.patch(`/admin/users/${selectedUser.id}`, { role: newRole });

      // Optimistic update
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, role: newRole } : u,
        ),
      );
      toast.success(`User role updated to ${newRole}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user status");
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" disabled={isLoading}>
          <Search className="h-4 w-4 mr-2" /> Search
        </Button>
      </form>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.email}</div>
                  <div className="text-xs text-muted-foreground">{user.id}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.role === "ADMIN"
                        ? "default"
                        : user.role === "SUSPENDED"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.role !== "SUSPENDED" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setModerationAction("SUSPEND");
                          }}
                          className="text-destructive"
                        >
                          <ShieldAlert className="mr-2 h-4 w-4" /> Suspend User
                        </DropdownMenuItem>
                      )}
                      {user.role === "SUSPENDED" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setModerationAction("RESTORE");
                          }}
                        >
                          <Check className="mr-2 h-4 w-4" /> Restore Access
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <ModerationModal
          isOpen={!!moderationAction}
          onClose={() => {
            setModerationAction(null);
            setSelectedUser(null);
          }}
          title={
            moderationAction === "SUSPEND"
              ? "Suspend User Access"
              : "Restore User Access"
          }
          description={
            moderationAction === "SUSPEND"
              ? `This will prevent ${selectedUser.email} from logging in. They will be logged out immediately.`
              : `This will allow ${selectedUser.email} to log in again.`
          }
          entityType="User"
          entityId={selectedUser.id}
          actionName={moderationAction === "SUSPEND" ? "Suspend" : "Restore"}
          onConfirm={handleModeration}
        />
      )}
    </div>
  );
}
