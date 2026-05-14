import { NextResponse } from "next/server";
import { getApiSessionContext, routeError } from "@/lib/api/route-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { householdId } = await getApiSessionContext();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*, actor:users_profile!audit_logs_actor_user_id_fkey(full_name)")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return NextResponse.json({ logs: data ?? [] });
  } catch (error) {
    return routeError(error, 400);
  }
}
