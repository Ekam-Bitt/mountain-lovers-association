"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LoginPage() {
  // const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkSession } = useAuth();
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");

  const signupSuccess = searchParams.get("signup") === "success";

  // Email State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [devCode, setDevCode] = useState<string | null>(null); // For Dev UI

  // General State
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/login", { email, password });
      await checkSession();
      router.push("/");
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any).response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post<{ success: boolean; devCode?: string }>(
        "/auth/otp/send",
        { phoneNumber },
      );
      if (res.success) {
        setStep("otp");
        if (res.devCode) setDevCode(res.devCode);
      }
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any).response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/otp/login", { phoneNumber, code: otp });
      await checkSession();
      router.push("/");
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any).response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-20 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">
        {activeTab === "email" ? "Welcome Back" : "Mobile Login"}
      </h1>

      {/* Success Message */}
      {signupSuccess && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 text-sm p-3 rounded mb-6 text-center">
          Account created successfully! Please log in.
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-8 border-b border-white/20">
        <button
          className={`flex-1 pb-2 text-center font-medium ${activeTab === "email" ? "text-[#ffe500] border-b-2 border-[#ffe500]" : "text-white/50 hover:text-white"}`}
          onClick={() => {
            setActiveTab("email");
            setError("");
          }}
        >
          Email
        </button>
        <button
          className={`flex-1 pb-2 text-center font-medium ${activeTab === "phone" ? "text-[#ffe500] border-b-2 border-[#ffe500]" : "text-white/50 hover:text-white"}`}
          onClick={() => {
            setActiveTab("phone");
            setError("");
          }}
        >
          Phone
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded mb-6 text-center">
          {error}
        </div>
      )}

      {/* Email Form */}
      {activeTab === "email" && (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-0 text-black focus:ring-2 focus:ring-[#ffe500]"
              placeholder="member@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border-0 text-black focus:ring-2 focus:ring-[#ffe500]"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ffe500] text-black hover:bg-[#ffe500]/90 font-bold"
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>
      )}

      {/* Phone Form */}
      {activeTab === "phone" && (
        <div>
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-white border-0 text-black focus:ring-2 focus:ring-[#ffe500]"
                  placeholder="9999999999"
                  required
                />
                <p className="text-xs text-white/70">
                  Enter phone registered with your account.
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ffe500] text-black hover:bg-[#ffe500]/90 font-bold"
              >
                {loading ? "Sending..." : "Send Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpLogin} className="space-y-4">
              {devCode && (
                <div className="p-3 bg-white/10 mb-4 rounded text-xs text-center font-mono text-[#ffe500]">
                  [DEV MODE] Your code is: {devCode}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-white">
                  Enter Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="bg-white border-0 text-black focus:ring-2 focus:ring-[#ffe500] text-center text-lg tracking-widest"
                  placeholder="123456"
                  required
                />
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-white/70 w-full hover:text-white"
                  onClick={() => setStep("phone")}
                >
                  Change Phone Number
                </Button>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ffe500] text-black hover:bg-[#ffe500]/90 font-bold"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>
            </form>
          )}
        </div>
      )}

      <div className="mt-6 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#ffe500] hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
