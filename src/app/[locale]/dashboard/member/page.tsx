"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, BookOpen } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BlogForm } from "@/components/forms/BlogForm";
import { Button } from "@/components/ui/button";

interface DashboardData {
  myEvents: Array<{
    registrationId: string;
    status: string;
    registeredAt: string;
    event: {
      title: string;
      startDate: string;
      location: string;
      slug: string;
    };
  }>;
  myBlogs: Array<{
    id: string;
    title: string;
    status: string;
    publishedAt: string | null;
    slug: string;
  }>;
}

export default function MemberDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<DashboardData>("/member/dashboard");
        setData(response);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen pt-32 text-center text-white">
        Loading dashboard...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen pt-32 text-center text-red-500">{error}</div>
    );

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#0356c2] text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Member Dashboard
          </h1>
          <p className="text-[#ffe500]">
            Manage your activities and contributions.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-[#0356c2]">
                Events Joined
              </CardTitle>
              <Calendar className="h-4 w-4 text-[#0356c2]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {data?.myEvents.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-[#0356c2]">
                Blogs Published
              </CardTitle>
              <BookOpen className="h-4 w-4 text-[#0356c2]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {data?.myBlogs.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="mb-4 bg-white/30 border-white/30">
            <TabsTrigger
              value="events"
              className="data-[state=active]:bg-black data-[state=active]:text-[#ffe500] data-[state=active]:border-[#ffe500] text-white/70 hover:text-white transition-colors"
            >
              My Events
            </TabsTrigger>
            <TabsTrigger
              value="blogs"
              className="data-[state=active]:bg-black data-[state=active]:text-[#ffe500] data-[state=active]:border-[#ffe500] text-white/70 hover:text-white"
            >
              My Blogs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#0356c2]">
                  Registered Events
                </CardTitle>
                <CardDescription className="text-black/60">
                  Events you have signed up for.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data?.myEvents.length === 0 ? (
                  <div className="text-center py-8 text-black/50">
                    You haven&apos;t joined any events yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-black/5 hover:bg-black/5">
                        <TableHead className="text-[#0356c2]">Event</TableHead>
                        <TableHead className="text-[#0356c2]">Date</TableHead>
                        <TableHead className="text-[#0356c2]">
                          Location
                        </TableHead>
                        <TableHead className="text-[#0356c2]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.myEvents.map((reg) => (
                        <TableRow
                          key={reg.registrationId}
                          className="border-black/5 hover:bg-black/5"
                        >
                          <TableCell className="font-medium text-black">
                            {reg.event.title}
                          </TableCell>
                          <TableCell className="text-black/70">
                            {format(
                              new Date(reg.event.startDate),
                              "MMM d, yyyy",
                            )}
                          </TableCell>
                          <TableCell className="text-black/70">
                            {reg.event.location}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                reg.status === "CONFIRMED"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                reg.status === "CONFIRMED"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-yellow-500 hover:bg-yellow-600"
                              }
                            >
                              {reg.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blogs">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[#0356c2]">My Blogs</CardTitle>
                  <CardDescription className="text-black/60">
                    Stories you have shared with the community.
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-[#ffe500] text-black hover:bg-[#ffe500]/90">
                      Create Blog
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-0 text-black sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-[#0356c2]">
                        Create Blog Post
                      </DialogTitle>
                      <DialogDescription className="text-black/60">
                        Share your experience with the community.
                      </DialogDescription>
                    </DialogHeader>
                    <BlogForm
                      onSuccess={() => {
                        document.getElementById("close-blog-dialog")?.click();
                        window.location.reload();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {data?.myBlogs.length === 0 ? (
                  <div className="text-center py-8 text-black/50">
                    You haven&apos;t written any blogs yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-black/5 hover:bg-black/5">
                        <TableHead className="text-[#0356c2]">Title</TableHead>
                        <TableHead className="text-[#0356c2]">
                          Published Date
                        </TableHead>
                        <TableHead className="text-[#0356c2]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.myBlogs.map((blog) => (
                        <TableRow
                          key={blog.id}
                          className="border-black/5 hover:bg-black/5"
                        >
                          <TableCell className="font-medium text-black">
                            {blog.title}
                          </TableCell>
                          <TableCell className="text-black/70">
                            {blog.publishedAt
                              ? format(
                                  new Date(blog.publishedAt),
                                  "MMM d, yyyy",
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="border-black/20 text-black/60"
                            >
                              {blog.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
