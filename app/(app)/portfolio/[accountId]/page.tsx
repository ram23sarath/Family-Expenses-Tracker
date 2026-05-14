import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import { getHoldingsWithFilters } from "@/lib/services/portfolio-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HoldingsTable } from "@/components/portfolio/holdings-table";

export default async function PortfolioAccountPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  const { householdId } = await getSessionContext();
  const supabase = await createSupabaseServerClient();
  const { data: account } = await supabase.from("accounts").select("*").eq("id", accountId).eq("household_id", householdId).single();
  if (!account) notFound();
  const holdings = await getHoldingsWithFilters(householdId, { accountId });

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-semibold">{account.name}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {account.provider_type} · {account.account_category}
        </p>
      </div>
      <HoldingsTable holdings={holdings} />
    </div>
  );
}
