import { getSessionContext } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ImportWizard } from "@/components/imports/import-wizard";

export default async function NewImportPage() {
  const { householdId } = await getSessionContext();
  const supabase = await createSupabaseServerClient();
  const { data: accounts, error } = await supabase.from("accounts").select("id,name,provider_type").eq("household_id", householdId).order("name");
  if (error) throw error;

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-semibold">New import</h2>
        <p className="mt-1 text-sm text-slate-500">Upload CSV, review mapped rows, then commit into holdings and transactions.</p>
      </div>
      <ImportWizard accounts={accounts ?? []} />
    </div>
  );
}
