"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export const SignupForm = () => {
  const router = useRouter();
  const { pushToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          household_name: householdName
        }
      }
    });
    setLoading(false);
    if (error) {
      pushToast(error.message, "error");
      return;
    }

    if (data.user) {
      pushToast("Signup successful. Verify email if required.", "success");
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Card>
      <h1 className="text-xl font-semibold">Create account</h1>
      <p className="mb-4 mt-1 text-sm text-slate-500">Create household and invite family members later.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
        <Input required value={householdName} onChange={(e) => setHouseholdName(e.target.value)} placeholder="Household name" />
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        Already have account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
};
