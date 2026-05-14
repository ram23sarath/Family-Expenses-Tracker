"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const authRedirectMessages: Record<string, string> = {
  "no-session": "Your login session was not available to the server. Please sign in again.",
  "profile-error": "Your account is signed in, but the household profile could not be loaded.",
  "profile-missing": "Your account is signed in, but the household profile is not ready yet."
};

export const LoginForm = ({ redirectReason }: { redirectReason?: string }) => {
  const { pushToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const redirectMessage = redirectReason ? authRedirectMessages[redirectReason] : null;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    setLoading(false);
    if (!response.ok) {
      pushToast(result?.error ?? "Unable to sign in", "error");
      return;
    }
    pushToast("Signed in successfully", "success");
    window.location.assign("/dashboard");
  };

  return (
    <Card>
      <h1 className="text-xl font-semibold">Log in</h1>
      <p className="mb-4 mt-1 text-sm text-slate-500">Access your household dashboard.</p>
      {redirectMessage ? (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {redirectMessage}
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-3">
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="mt-4 flex justify-between text-sm">
        <Link href="/signup" className="text-blue-600 hover:underline">
          Create account
        </Link>
        <Link href="/forgot-password" className="text-blue-600 hover:underline">
          Forgot password
        </Link>
      </div>
    </Card>
  );
};
