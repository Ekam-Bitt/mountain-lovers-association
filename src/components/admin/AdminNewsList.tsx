"use client";

import { useState } from "react";
import { NewsForm } from "@/components/forms/NewsForm";
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
import { Pencil, Trash2, Plus } from "lucide-react";

interface News {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  content: string;
  excerpt?: string | null;
  image?: string | null;
  author: {
    email: string;
  };
}

interface AdminNewsListProps {
  initialNews: News[];
}

export function AdminNewsList({ initialNews }: AdminNewsListProps) {
  const [newsList, setNewsList] = useState<News[]>(initialNews);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const refreshNews = async () => {
    try {
      router.refresh();
      const res = await api.get<{ data: News[] }>("/admin/news");
      if (res.data) {
        setNewsList(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    refreshNews();
  };

  const handleEditSuccess = () => {
    setEditingNews(null);
    refreshNews();
  };

  const handleDelete = async (news: News) => {
    if (
      !confirm(
        `Are you sure you want to delete "${news.title}"? This action cannot be undone.`,
      )
    )
      return;
    setLoading(true);
    try {
      await api.delete(`/admin/news/${news.id}`);
      refreshNews();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete news");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#0356c2]">
          News Articles
        </h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#ffe500] text-black hover:bg-[#ffe500]/90 font-semibold border-0">
              <Plus className="mr-2 h-4 w-4" /> Create News
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto bg-white text-black border-0">
            <DialogHeader>
              <DialogTitle className="text-[#0356c2]">
                Create News Article
              </DialogTitle>
            </DialogHeader>
            <NewsForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No news articles found.
                </TableCell>
              </TableRow>
            ) : (
              newsList.map((news) => (
                <TableRow key={news.id}>
                  <TableCell className="font-medium">{news.title}</TableCell>
                  <TableCell>{news.author.email}</TableCell>
                  <TableCell>
                    <StatusBadge status={news.status} />
                  </TableCell>
                  <TableCell>
                    {news.publishedAt
                      ? format(new Date(news.publishedAt), "MMM d, yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingNews(news)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(news)}
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
        open={!!editingNews}
        onOpenChange={(open) => !open && setEditingNews(null)}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit News Article</DialogTitle>
          </DialogHeader>
          {editingNews && (
            <NewsForm
              newsId={editingNews.id}
              initialData={{
                title: editingNews.title,
                content: editingNews.content,
                image: editingNews.image || "",
                status: editingNews.status as
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
