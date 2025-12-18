"use client";

import { useState } from "react";
import { BlogForm } from "@/components/forms/BlogForm";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Pencil, Archive, Plus } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  content: string;
  excerpt?: string | null;
  image?: string | null;
}

interface BlogListProps {
  initialBlogs: Blog[];
}

export function BlogList({ initialBlogs }: BlogListProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const refreshBlogs = async () => {
    try {
      // In a real app we might re-fetch from API or just reload the page to get fresh server data
      // For now, let's just reload the page data via router.refresh()
      // but also we might want to fetch the latest list to avoid full page reload flicker
      // if we were fully client-side.
      // Since this is a hybrid, router.refresh() is easiest to sync server data.
      router.refresh();
      // We can also optimistically update or fetch manual JSON if needed.
      const res = await api.get<{ data: Blog[] }>("/member/blogs");
      if (res.data) {
        setBlogs(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    refreshBlogs();
  };

  const handleEditSuccess = () => {
    setEditingBlog(null);
    refreshBlogs();
  };

  const handleArchive = async (blog: Blog) => {
    if (!confirm("Are you sure you want to archive this blog post?")) return;
    setLoading(true);
    try {
      await api.patch(`/member/blogs/${blog.id}`, { status: "ARCHIVED" });
      refreshBlogs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to archive blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">My Blogs</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#ffe500] text-black hover:bg-[#ffe500]/90">
              <Plus className="mr-2 h-4 w-4" /> Create Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog</DialogTitle>
              <DialogDescription>
                Share your mountain adventures with the community.
              </DialogDescription>
            </DialogHeader>
            <BlogForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No blogs found. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell>
                    <StatusBadge status={blog.status} />
                  </TableCell>
                  <TableCell>
                    {blog.publishedAt
                      ? format(new Date(blog.publishedAt), "PP")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingBlog(blog)}
                        disabled={blog.status === "BANNED"}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleArchive(blog)}
                        disabled={
                          loading ||
                          blog.status === "ARCHIVED" ||
                          blog.status === "BANNED"
                        }
                      >
                        <Archive className="h-4 w-4" />
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
        open={!!editingBlog}
        onOpenChange={(open) => !open && setEditingBlog(null)}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog</DialogTitle>
          </DialogHeader>
          {editingBlog && (
            <BlogForm
              blogId={editingBlog.id}
              initialData={{
                title: editingBlog.title,
                content: editingBlog.content,
                image: editingBlog.image || "",
                status:
                  editingBlog.status === "FLAGGED" ||
                  editingBlog.status === "BANNED"
                    ? "DRAFT"
                    : (editingBlog.status as
                        | "DRAFT"
                        | "PUBLISHED"
                        | "ARCHIVED"),
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
