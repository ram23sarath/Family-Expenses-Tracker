"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const PortfolioFilters = ({
  accounts,
  members
}: {
  accounts: Array<{ id: string; name: string }>;
  members: Array<{ id: string; full_name: string | null }>;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const apply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    ["accountId", "userId", "assetType", "source", "fromDate", "toDate"].forEach((key) => {
      const value = String(form.get(key) ?? "");
      if (value) params.set(key, value);
    });
    router.push(`/portfolio?${params.toString()}`);
  };

  return (
    <form onSubmit={apply} className="card grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      <Select name="accountId" defaultValue={searchParams.get("accountId") ?? ""}>
        <option value="">All accounts</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </Select>
      <Select name="userId" defaultValue={searchParams.get("userId") ?? ""}>
        <option value="">All members</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.full_name ?? member.id}
          </option>
        ))}
      </Select>
      <Select name="assetType" defaultValue={searchParams.get("assetType") ?? ""}>
        <option value="">All asset types</option>
        <option value="equity">Equity</option>
        <option value="mutual_fund">Mutual fund</option>
        <option value="etf">ETF</option>
        <option value="cash">Cash</option>
        <option value="bond">Bond</option>
        <option value="other">Other</option>
      </Select>
      <Select name="source" defaultValue={searchParams.get("source") ?? ""}>
        <option value="">All sources</option>
        <option value="zerodha">Zerodha</option>
        <option value="groww">Groww</option>
        <option value="indmoney_csv">INDmoney CSV</option>
        <option value="manual">Manual</option>
      </Select>
      <Input name="fromDate" type="date" defaultValue={searchParams.get("fromDate") ?? ""} />
      <div className="flex gap-2">
        <Input name="toDate" type="date" defaultValue={searchParams.get("toDate") ?? ""} />
        <Button type="submit">Apply</Button>
      </div>
    </form>
  );
};
