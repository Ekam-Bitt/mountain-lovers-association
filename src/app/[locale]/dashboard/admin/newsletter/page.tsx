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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { NewsletterComposer } from "@/components/admin/NewsletterComposer";
import { Users, Mail, History } from "lucide-react";

export default function AdminNewsletterPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subscribers, setSubscribers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [campaigns, setCampaigns] = useState<any[]>([]);
  // const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // setLoading(true);
    try {
      const [subRes, campRes] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        api.get<{ data: any[] }>("/admin/newsletter/subscribers"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        api.get<{ data: any[] }>("/admin/newsletter/campaigns"),
      ]);
      setSubscribers(subRes.data);
      setCampaigns(campRes.data);
    } catch (error) {
      console.error("Failed to fetch newsletter data", error);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshHistory = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campRes = await api.get<{ data: any[] }>(
      "/admin/newsletter/campaigns",
    );
    setCampaigns(campRes.data);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#0356c2] text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Newsletter Management
          </h1>
          <p className="text-[#ffe500]">Manage subscribers and send updates.</p>
        </header>

        <Tabs defaultValue="compose" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger
              value="compose"
              className="flex gap-2 data-[state=active]:bg-[#ffe500] data-[state=active]:text-black text-white"
            >
              <Mail className="h-4 w-4" /> Compose
            </TabsTrigger>
            <TabsTrigger
              value="subscribers"
              className="flex gap-2 data-[state=active]:bg-[#ffe500] data-[state=active]:text-black text-white"
            >
              <Users className="h-4 w-4" /> Subscribers ({subscribers.length})
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex gap-2 data-[state=active]:bg-[#ffe500] data-[state=active]:text-black text-white"
            >
              <History className="h-4 w-4" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#0356c2]">
                  Compose Newsletter
                </CardTitle>
                <CardDescription className="text-black/60">
                  Send an email update to all {subscribers.length} active
                  subscribers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsletterComposer onSuccess={refreshHistory} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#0356c2]">
                  Active Subscribers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-black/5 hover:bg-black/5">
                      <TableHead className="text-[#0356c2]">Email</TableHead>
                      <TableHead className="text-[#0356c2]">Joined</TableHead>
                      <TableHead className="text-[#0356c2]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((sub) => (
                      <TableRow
                        key={sub.id}
                        className="border-black/5 hover:bg-black/5"
                      >
                        <TableCell className="text-black">
                          {sub.email}
                        </TableCell>
                        <TableCell className="text-black/70">
                          {format(new Date(sub.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-green-700 border-green-600 bg-green-50"
                          >
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {subscribers.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-black/50 py-8"
                        >
                          No subscribers yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#0356c2]">
                  Campaign History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-black/5 hover:bg-black/5">
                      <TableHead className="text-[#0356c2]">Subject</TableHead>
                      <TableHead className="text-[#0356c2]">
                        Sent Date
                      </TableHead>
                      <TableHead className="text-[#0356c2]">
                        Recipients
                      </TableHead>
                      <TableHead className="text-[#0356c2]">Author</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((camp) => (
                      <TableRow
                        key={camp.id}
                        className="border-black/5 hover:bg-black/5"
                      >
                        <TableCell className="text-black font-medium">
                          {camp.subject}
                        </TableCell>
                        <TableCell className="text-black/70">
                          {format(new Date(camp.sentAt), "MMM d, p")}
                        </TableCell>
                        <TableCell className="text-black/70">
                          {camp.recipientCount}
                        </TableCell>
                        <TableCell className="text-black/50 text-sm">
                          {camp.author?.email}
                        </TableCell>
                      </TableRow>
                    ))}
                    {campaigns.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-black/50 py-8"
                        >
                          No campaigns sent yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
