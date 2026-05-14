"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export const LoginForm = () => {
  const router = useRouter();
  const { pushToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      pushToast(error.message, "error");
      return;
    }
    pushToast("Signed in successfully", "success");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Card>
      <h1 className="text-xl font-semibold">Log in</h1>
      <p className="mb-4 mt-1 text-sm text-slate-500">Access your household dashboard.</p>
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
