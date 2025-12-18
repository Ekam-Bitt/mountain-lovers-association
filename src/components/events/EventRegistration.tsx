"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

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
    return <div className="h-12 w-32 bg-gray-100 animate-pulse rounded-lg" />;
  }

  if (status === "CONFIRMED" || status === "PENDING") {
    return (
      <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-4 py-2 rounded-lg border border-green-100">
        <CheckCircle className="w-5 h-5" />
        <span>
          {status === "CONFIRMED" ? "Registered" : "Registration Pending"}
        </span>
      </div>
    );
  }

  // Guest State
  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => router.push(`/login?redirect=/events/${eventId}`)}
        className="bg-[#0356c2] hover:bg-[#02449a] text-white"
      >
        Login to Register
      </Button>
    );
  }

  // Authenticated State
  const isUnverified = user?.role === "MEMBER_UNVERIFIED";

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        onClick={handleRegister}
        disabled={loading}
        className={`min-w-[140px] ${
          isUnverified
            ? "bg-gray-500 hover:bg-gray-600" // Visual cue or just normal button?
            : "bg-[#0356c2] hover:bg-[#02449a]"
        } text-white`}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Register
      </Button>
      {isUnverified && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Verification required
        </p>
      )}
    </div>
  );
}
