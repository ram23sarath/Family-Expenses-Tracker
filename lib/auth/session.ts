import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SessionContext {
  userId: string;
  householdId: string;
  role: "admin" | "member" | "viewer";
}

type ProfileRow = {
  household_id: string | null;
  role: string | null;
};

const defaultExpenseCategories = ["Groceries", "Rent", "Utilities", "Transport", "Salary", "Investments"];

const normalizeRole = (role: string | null): SessionContext["role"] => {
  if (role === "admin" || role === "member" || role === "viewer") return role;
  return "member";
};

const getMetadataText = (metadata: User["user_metadata"], key: string) => {
  const value = metadata[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

const bootstrapProfile = async (supabase: SupabaseClient, user: User): Promise<ProfileRow | null> => {
  const fullName = getMetadataText(user.user_metadata, "full_name") ?? user.email?.split("@")[0] ?? "User";
  const householdName = getMetadataText(user.user_metadata, "household_name") ?? `${fullName} Household`;

  const { data: household, error: householdError } = await supabase
    .from("households")
    .insert({ name: householdName, created_by: user.id })
    .select("id")
    .single();

  if (householdError || !household?.id) return null;

  const { data: profile, error: profileError } = await supabase
    .from("users_profile")
    .insert({
      id: user.id,
      household_id: household.id,
      full_name: fullName,
      role: "admin",
      preferred_currency: "INR"
    })
    .select("household_id, role")
    .single();

  if (profileError || !profile?.household_id) return null;

  await supabase.from("expense_categories").insert(
    defaultExpenseCategories.map((name) => ({
      household_id: profile.household_id,
      name
    }))
  );

  return profile;
};

const getAdminProfile = async (userId: string): Promise<ProfileRow | null> => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("users_profile")
    .select("household_id, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  return data;
};

export const getSessionContext = async (): Promise<SessionContext> => {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login?reason=no-session");

  const { data: existingProfile, error } = await supabase
    .from("users_profile")
    .select("household_id, role")
    .eq("id", authData.user.id)
    .maybeSingle();

  const adminProfile = error || !existingProfile?.household_id ? await getAdminProfile(authData.user.id) : null;

  const profile = existingProfile?.household_id
    ? existingProfile
    : adminProfile?.household_id
      ? adminProfile
      : await bootstrapProfile(supabase, authData.user);

  if (!profile?.household_id) redirect(`/login?reason=${error ? "profile-error" : "profile-missing"}`);

  return {
    userId: authData.user.id,
    householdId: profile.household_id,
    role: normalizeRole(profile.role)
  };
};

export const assertAdmin = (role: SessionContext["role"]) => {
  if (role !== "admin") {
    throw new Error("Admin role required");
  }
};
