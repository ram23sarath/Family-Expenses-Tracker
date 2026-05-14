import { getSessionContext } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function SettingsPage() {
  const { householdId, userId, role } = await getSessionContext();
  const supabase = await createSupabaseServerClient();
  const [{ data: household }, { data: profile }] = await Promise.all([
    supabase.from("households").select("*").eq("id", householdId).single(),
    supabase.from("users_profile").select("*").eq("id", userId).single()
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h2 className="text-lg font-semibold">Household settings</h2>
        <p className="mt-2 text-sm text-slate-500">Name: {household?.name ?? "-"}</p>
        <p className="text-sm text-slate-500">Created: {household?.created_at ? new Date(household.created_at).toLocaleDateString() : "-"}</p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="mt-2 text-sm text-slate-500">Name: {profile?.full_name ?? "-"}</p>
        <p className="text-sm text-slate-500">Role: {role}</p>
        <p className="text-sm text-slate-500">Preferred currency: {profile?.preferred_currency ?? "INR"}</p>
      </Card>
    </div>
  );
}
