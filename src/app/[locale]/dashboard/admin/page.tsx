"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Users, Calendar, BookOpen, Activity, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewsForm } from "@/components/forms/NewsForm";
import { EventForm } from "@/components/forms/EventForm";
import { EventRegistrationsDialog } from "@/components/admin/EventRegistrationsDialog";

interface AdminStats {
  counts: {
    users: number;
    events: number;
    blogs: number;
  };
  recentActivity: {
    registrations: Array<{
      user: string;
      event: string;
      date: string;
    }>;
    newUsers: Array<{
      id: string;
      email: string;
      role: string;
      createdAt: string;
    }>;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [news, setNews] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState<string | null>(null);

  // Dialog states
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    const response = await api.get<AdminStats>("/admin/stats");
    setStats(response);
  }, []);

  const fetchNews = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<{ data: any[] }>("/admin/news?limit=5");
    setNews(response.data);
  }, []);

  const fetchEvents = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<{ data: any[] }>("/admin/events?limit=5");
    setEvents(response.data);
  }, []);

  const fetchAllData = useCallback(async () => {
    // Only set loading on initial fetch
    if (!stats) setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchNews(), fetchEvents()]);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchNews, fetchEvents, stats]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleVerify = async (userId: string) => {
    setVerifying(userId);
    try {
      await api.put(`/admin/users/${userId}/verify`, {});
      // Optimistic update
      if (stats) {
        setStats({
          ...stats,
          recentActivity: {
            ...stats.recentActivity,
            newUsers: stats.recentActivity.newUsers.map((u) =>
              u.id === userId ? { ...u, role: "MEMBER_VERIFIED" } : u,
            ),
          },
        });
      }
    } catch (error) {
      console.error("Verify failed", error);
      toast.error("Failed to verify user");
    } finally {
      setVerifying(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen pt-32 text-center text-white">
        Loading admin dashboard...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen pt-32 text-center text-red-500">{error}</div>
    );

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#0356c2] text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-[#ffe500]">Platform overview and management.</p>
          </div>
        </header>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/20 border border-white/30">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-transparent data-[state=active]:text-[#ffe500] data-[state=active]:border-[#ffe500] text-white/70 hover:text-white transition-colors"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-transparent data-[state=active]:text-[#ffe500] data-[state=active]:border-[#ffe500] text-white/70 hover:text-white transition-colors"
            >
              Content Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-[#0356c2]">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-[#0356c2]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-black">
                    {stats?.counts.users}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-[#0356c2]">
                    Total Events
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-[#0356c2]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-black">
                    {stats?.counts.events}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-[#0356c2]">
                    Total Blogs
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-[#0356c2]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-black">
                    {stats?.counts.blogs}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#0356c2] flex items-center gap-2">
                    <Activity className="h-5 w-5" /> Recent Registrations
                  </CardTitle>
                  <CardDescription className="text-black/60">
                    Latest event signups.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.recentActivity.registrations.length === 0 ? (
                    <div className="text-black/50 py-4">
                      No recent activity.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-black/5 hover:bg-black/5">
                          <TableHead className="text-[#0356c2]">User</TableHead>
                          <TableHead className="text-[#0356c2]">
                            Event
                          </TableHead>
                          <TableHead className="text-[#0356c2]">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats?.recentActivity.registrations.map((reg, i) => (
                          <TableRow
                            key={i}
                            className="border-black/5 hover:bg-black/5"
                          >
                            <TableCell className="font-medium text-black">
                              {reg.user}
                            </TableCell>
                            <TableCell className="text-black/70">
                              {reg.event}
                            </TableCell>
                            <TableCell className="text-black/50 text-xs">
                              {format(new Date(reg.date), "MMM d, p")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#0356c2] flex items-center gap-2">
                    <Users className="h-5 w-5" /> New Members
                  </CardTitle>
                  <CardDescription className="text-black/60">
                    Recently joined users.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.recentActivity.newUsers.length === 0 ? (
                    <div className="text-black/50 py-4">No new users.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-black/5 hover:bg-black/5">
                          <TableHead className="text-[#0356c2]">
                            Email
                          </TableHead>
                          <TableHead className="text-[#0356c2]">Role</TableHead>
                          <TableHead className="text-[#0356c2] text-right">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats?.recentActivity.newUsers.map((u) => (
                          <TableRow
                            key={u.id}
                            className="border-black/5 hover:bg-black/5"
                          >
                            <TableCell className="font-medium text-black">
                              <div className="flex flex-col">
                                <span>{u.email}</span>
                                <span className="text-[10px] text-black/50">
                                  {format(new Date(u.createdAt), "MMM d")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${u.role === "MEMBER_VERIFIED" ? "border-green-600 text-green-700 bg-green-50" : "border-black/20 text-black/60"}`}
                              >
                                {u.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {u.role === "MEMBER_UNVERIFIED" && (
                                <Button
                                  size="sm"
                                  className="h-7 bg-[#ffe500] text-black hover:bg-[#ffe500]/90 text-xs font-bold"
                                  onClick={() => handleVerify(u.id)}
                                  disabled={verifying === u.id}
                                >
                                  {verifying === u.id ? "..." : "Verify"}
                                </Button>
                              )}
                              {u.role === "MEMBER_VERIFIED" && (
                                <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* News Management */}
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-[#0356c2]">
                        News Articles
                      </CardTitle>
                      <CardDescription className="text-black/60">
                        Manage platform news.
                      </CardDescription>
                    </div>
                    <Dialog open={isNewsOpen} onOpenChange={setIsNewsOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-[#ffe500] text-black hover:bg-[#ffe500]/90 font-bold">
                          Create News
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white border-0 text-black sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create News Article</DialogTitle>
                          <DialogDescription>
                            Add a new announcement to the platform.
                          </DialogDescription>
                        </DialogHeader>
                        <NewsForm
                          onSuccess={() => {
                            setIsNewsOpen(false);
                            fetchNews();
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {news.length === 0 ? (
                    <p className="text-black/50 text-sm">
                      No news articles found.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-black/5 hover:bg-black/5">
                          <TableHead className="text-[#0356c2]">
                            Title
                          </TableHead>
                          <TableHead className="text-[#0356c2]">
                            Status
                          </TableHead>
                          <TableHead className="text-[#0356c2] text-right">
                            Date
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {news.map((item) => (
                          <TableRow
                            key={item.id}
                            className="border-black/5 hover:bg-black/5"
                          >
                            <TableCell
                              className="font-medium text-black max-w-[150px] truncate"
                              title={item.title}
                            >
                              {item.title}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${item.status === "PUBLISHED" ? "border-green-600 text-green-700 bg-green-50" : "border-black/20 text-black/60"}`}
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-xs text-black/50">
                              {format(new Date(item.createdAt), "MMM d")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Events Management */}
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-[#0356c2]">Events</CardTitle>
                      <CardDescription className="text-black/60">
                        Manage upcoming events.
                      </CardDescription>
                    </div>
                    <Dialog open={isEventOpen} onOpenChange={setIsEventOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-[#ffe500] text-black hover:bg-[#ffe500]/90 font-bold">
                          Create Event
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white border-0 text-black sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create Event</DialogTitle>
                          <DialogDescription>
                            Schedule a new event.
                          </DialogDescription>
                        </DialogHeader>
                        <EventForm
                          onSuccess={() => {
                            setIsEventOpen(false);
                            fetchEvents();
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <p className="text-black/50 text-sm">No events found.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-black/5 hover:bg-black/5">
                          <TableHead className="text-[#0356c2]">
                            Title
                          </TableHead>
                          <TableHead className="text-[#0356c2]">
                            Status
                          </TableHead>
                          <TableHead className="text-[#0356c2] text-right">
                            Start Date
                          </TableHead>
                          <TableHead className="text-[#0356c2] text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((item) => (
                          <TableRow
                            key={item.id}
                            className="border-black/5 hover:bg-black/5"
                          >
                            <TableCell
                              className="font-medium text-black max-w-[150px] truncate"
                              title={item.title}
                            >
                              {item.title}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${item.status === "PUBLISHED" ? "border-green-600 text-green-700 bg-green-50" : "border-black/20 text-black/60"}`}
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-xs text-black/50">
                              {format(new Date(item.startDate), "MMM d")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-black/20 text-black/70 hover:bg-black/5"
                                onClick={() => {
                                  setSelectedEvent(item);
                                  setIsRegOpen(true);
                                }}
                              >
                                Registrations
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <EventRegistrationsDialog
          isOpen={isRegOpen}
          onClose={() => setIsRegOpen(false)}
          eventId={selectedEvent?.id}
          eventTitle={selectedEvent?.title}
        />
      </div>
    </div>
  );
}
