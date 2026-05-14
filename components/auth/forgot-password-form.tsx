"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export const ForgotPasswordForm = () => {
  const { pushToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    });
    setLoading(false);
    if (error) {
      pushToast(error.message, "error");
      return;
    }
    pushToast("Password reset email sent", "success");
  };

  return (
    <Card>
      <h1 className="text-xl font-semibold">Forgot password</h1>
      <p className="mb-4 mt-1 text-sm text-slate-500">We will send a reset link.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </Card>
  );
};
