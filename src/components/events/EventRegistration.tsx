"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Calendar } from "lucide-react";

interface EventRegistrationProps {
  eventId: string;
  eventCapacity?: number | null;
  eventDate: string; // To check if past? For now just keeping data.
}

type RegistrationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | null;

export function EventRegistration({
  eventId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  eventCapacity,
}: EventRegistrationProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<RegistrationStatus>(null);
  const [loading, setLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const checkRegistrationStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/member/events/${eventId}/register`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status || null);
      }
    } catch (error) {
      console.error("Failed to check registration status", error);
    } finally {
      setInitialCheckDone(true);
    }
  }, [eventId]);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkRegistrationStatus();
    } else {
      setInitialCheckDone(true);
    }
  }, [isAuthenticated, user, eventId, checkRegistrationStatus]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }

    // Strict check for unverified members on client side as well for better UX
    if (user?.role === "MEMBER_UNVERIFIED") {
      toast.error("Verification Required", {
        description:
          "Only verified members can register. Please wait to get verified.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/member/events/${eventId}/register`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }

      setStatus("PENDING"); // Or whatever the API returns, likely PENDING or CONFIRMED
      toast.success("Registration Successful", {
        description: "You have been registered for this event.",
      });

      // Re-check status to get definitive state (e.g. if auto-confirmed)
      checkRegistrationStatus();
    } catch (error: unknown) {
      toast.error("Registration Failed", {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (error as any)?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !initialCheckDone) {
    return (
      <div className="h-16 w-48 bg-white/10 animate-pulse rounded-xl border border-white/20" />
    );
  }

  if (status === "CONFIRMED" || status === "PENDING") {
    return (
      <div className="flex items-center gap-3 bg-green-500 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg border-2 border-green-400">
        <CheckCircle className="w-6 h-6 flex-shrink-0" />
        <span>
          {status === "CONFIRMED" ? "✓ REGISTERED" : "⏳ PENDING APPROVAL"}
        </span>
      </div>
    );
  }

  // Guest State
  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => router.push(`/login?redirect=/events/${eventId}`)}
        className="bg-[#ffe500] hover:bg-[#ffd700] text-black font-bold text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-[#ffd700] min-w-[200px] h-auto"
      >
        <Calendar className="mr-2 h-5 w-5" />
        LOGIN TO REGISTER
      </Button>
    );
  }

  // Authenticated State
  const isUnverified = user?.role === "MEMBER_UNVERIFIED";

  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        onClick={handleRegister}
        disabled={loading || isUnverified}
        className={`font-bold text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 min-w-[200px] h-auto ${
          isUnverified
            ? "bg-gray-600 hover:bg-gray-600 border-gray-500 cursor-not-allowed opacity-60"
            : "bg-[#ffe500] hover:bg-[#ffd700] text-black border-[#ffd700]"
        }`}
      >
        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {!loading && <Calendar className="mr-2 h-5 w-5" />}
        REGISTER NOW
      </Button>
      {isUnverified && (
        <p className="text-amber-400 flex items-center gap-2 font-semibold bg-amber-500/20 px-4 py-2 rounded-lg border border-amber-500/30">
          <AlertCircle className="w-4 h-4" />
          Verification required to register
        </p>
      )}
    </div>
  );
}
