"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
// import { format } from "date-fns";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen pt-24 text-center">Loading profile...</div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#0356c2]">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="bg-white border-0 shadow-sm text-black">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="w-24 h-24 text-4xl border-2 border-[#ffe500]">
                <AvatarFallback className="bg-[#0356c2] text-white">
                  {user.email?.substring(0, 2).toUpperCase() || "ME"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl text-[#0356c2]">
              My Profile
            </CardTitle>
            <CardDescription className="text-black/60">
              Member since {new Date().getFullYear()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#0356c2]">
                  Email Address
                </label>
                <div className="text-lg font-semibold">{user.email}</div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-[#0356c2]">
                  Membership Tier
                </label>
                <div>
                  <Badge
                    variant="outline"
                    className="border-[#0356c2] text-[#0356c2] bg-blue-50"
                  >
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-[#0356c2]">
                  Phone Number
                </label>
                <div className="text-lg font-semibold">
                  {/* This would come from DB in a real fetch, for now showing placeholder if unavailable in session */}
                  {user.phoneNumber || "Not linked"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-[#0356c2]">
                  User ID
                </label>
                <div
                  className="text-xs font-mono text-black/50 truncate"
                  title={user.userId}
                >
                  {user.userId}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
