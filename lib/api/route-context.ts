import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getApiSessionContext = async () => {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error } = await supabase
    .from("users_profile")
    .select("household_id, role")
    .eq("id", authData.user.id)
    .single();
  if (error || !profile?.household_id) {
    throw new Error("Profile not found");
  }

  return {
    supabase,
    userId: authData.user.id,
    householdId: profile.household_id,
    role: profile.role as "admin" | "member" | "viewer"
  };
};

export const routeError = (error: unknown, status = 500) =>
  NextResponse.json(
    {
      error: error instanceof Error ? error.message : "Unexpected server error"
    },
    { status }
  );
