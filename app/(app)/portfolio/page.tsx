import { getSessionContext } from "@/lib/auth/session";
import { getHoldingsWithFilters } from "@/lib/services/portfolio-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PortfolioFilters } from "@/components/filters/portfolio-filters";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { TopMovers } from "@/components/portfolio/top-movers";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PortfolioPage({
  searchParams
}: {
  searchParams?: Promise<{
    accountId?: string;
    userId?: string;
    assetType?: string;
    source?: string;
    fromDate?: string;
    toDate?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};
  const { householdId } = await getSessionContext();
  const supabase = await createSupabaseServerClient();
  const [holdings, accountsRes, membersRes] = await Promise.all([
    getHoldingsWithFilters(householdId, {
      accountId: params.accountId,
      userId: params.userId,
      assetType: params.assetType,
      source: params.source,
      fromDate: params.fromDate,
      toDate: params.toDate
    }),
    supabase.from("accounts").select("id,name").eq("household_id", householdId).order("name"),
    supabase.from("users_profile").select("id,full_name").eq("household_id", householdId).order("full_name")
  ]);

  if (!holdings.length) {
    return (
      <div className="space-y-4">
        <PortfolioFilters accounts={accountsRes.data ?? []} members={membersRes.data ?? []} />
        <EmptyState title="No holdings available" description="Connect broker accounts or import CSV to populate holdings." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PortfolioFilters accounts={accountsRes.data ?? []} members={membersRes.data ?? []} />
      <TopMovers holdings={holdings} />
      <HoldingsTable holdings={holdings} />
    </div>
  );
}
