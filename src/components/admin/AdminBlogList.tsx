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
import { MoreHorizontal, Search, Flag, Ban, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ModerationModal } from "@/components/admin/ModerationModal";
import { toast } from "sonner";

interface AdminBlogListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialBlogs: any[];
}

export function AdminBlogList({ initialBlogs }: AdminBlogListProps) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Moderation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [moderationAction, setModerationAction] = useState<
    "FLAG" | "BAN" | "RESTORE" | null
  >(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await api.get<{ data: any[] }>(
        `/admin/blogs?search=${search}`,
      );
      setBlogs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeration = async () => {
    if (!selectedBlog || !moderationAction) return;

    let newStatus = "";
    if (moderationAction === "FLAG") newStatus = "FLAGGED";
    else if (moderationAction === "BAN") newStatus = "BANNED";
    else if (moderationAction === "RESTORE") newStatus = "PUBLISHED"; // Default to published when restoring

    try {
      await api.patch(`/admin/blogs/${selectedBlog.id}`, { status: newStatus });

      // Optimistic update
      setBlogs(
        blogs.map((b) =>
          b.id === selectedBlog.id ? { ...b, status: newStatus } : b,
        ),
      );
      toast.success(`Blog status updated to ${newStatus}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          name="search"
          aria-label="Search blogs"
          placeholder="Search blogs..."
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
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell className="font-medium">{blog.title}</TableCell>
                <TableCell>{blog.author.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      blog.status === "PUBLISHED"
                        ? "default"
                        : blog.status === "BANNED"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {blog.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(blog.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {blog.status !== "FLAGGED" &&
                        blog.status !== "BANNED" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBlog(blog);
                              setModerationAction("FLAG");
                            }}
                            className="text-yellow-600"
                          >
                            <Flag className="mr-2 h-4 w-4" /> Flag Content
                          </DropdownMenuItem>
                        )}
                      {blog.status !== "BANNED" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBlog(blog);
                            setModerationAction("BAN");
                          }}
                          className="text-destructive"
                        >
                          <Ban className="mr-2 h-4 w-4" /> Ban Content
                        </DropdownMenuItem>
                      )}
                      {(blog.status === "FLAGGED" ||
                        blog.status === "BANNED") && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBlog(blog);
                              setModerationAction("RESTORE");
                            }}
                          >
                            <Check className="mr-2 h-4 w-4" /> Restore
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

      {selectedBlog && (
        <ModerationModal
          isOpen={!!moderationAction}
          onClose={() => {
            setModerationAction(null);
            setSelectedBlog(null);
          }}
          title={
            moderationAction === "FLAG"
              ? "Flag Content"
              : moderationAction === "BAN"
                ? "Ban Content"
                : "Restore Content"
          }
          description={
            moderationAction === "FLAG"
              ? "Marking this as flagged will warn users but keep it visible."
              : moderationAction === "BAN"
                ? "Banning this content will remove it from public view entirely."
                : "Restoring this content will make it Published again."
          }
          entityType="Blog"
          entityId={selectedBlog.id}
          actionName={
            moderationAction === "RESTORE"
              ? "Restore"
              : moderationAction === "FLAG"
                ? "Flag"
                : "Ban"
          }
          onConfirm={handleModeration}
        />
      )}
    </div>
  );
}
