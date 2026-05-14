import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Holding } from "@/lib/types";
import { HoldingsTable } from "@/components/portfolio/holdings-table";

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { householdId } = await getSessionContext();
  const supabase = await createSupabaseServerClient();
  const { data: account } = await supabase.from("accounts").select("*").eq("id", id).eq("household_id", householdId).single();
  if (!account) notFound();

  const { data: holdings } = await supabase.from("holdings").select("*").eq("household_id", householdId).eq("account_id", id);

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-xs text-slate-500">
          <Link href="/accounts" className="text-blue-600">
            Accounts
          </Link>{" "}
          / {account.name}
        </p>
        <h2 className="mt-2 text-lg font-semibold">{account.name}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Provider: {account.provider_type} · Category: {account.account_category}
        </p>
      </div>
      <HoldingsTable holdings={(holdings as Holding[]) ?? []} />
    </div>
  );
}
