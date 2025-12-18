"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/signup", { email, password });
      // On success, redirect to login with a query param or just let them login
      // Ideally auto-login, but for now redirect to login is safer flow
      router.push("/login?signup=success");
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any).response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-20 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">
        Create Account
      </h1>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
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
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-white border-0 text-black focus:ring-2 focus:ring-[#ffe500]"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ffe500] text-black hover:bg-[#ffe500]/90 font-bold"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-white/70">
        Already have an account?{" "}
        <Link href="/login" className="text-[#ffe500] hover:underline">
          Log In
        </Link>
      </div>
    </div>
  );
}
