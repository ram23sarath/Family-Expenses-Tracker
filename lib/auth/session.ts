import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SessionContext {
  userId: string;
  householdId: string;
  role: "admin" | "member" | "viewer";
}

export const getSessionContext = async (): Promise<SessionContext> => {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("users_profile")
    .select("household_id, role")
    .eq("id", authData.user.id)
    .single();

  if (error || !profile?.household_id) redirect("/login");

  return {
    userId: authData.user.id,
    householdId: profile.household_id,
    role: profile.role
  };
};

export const assertAdmin = (role: SessionContext["role"]) => {
  if (role !== "admin") {
    throw new Error("Admin role required");
  }
};
