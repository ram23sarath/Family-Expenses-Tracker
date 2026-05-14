"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

const txTypes = ["buy", "sell", "dividend", "interest", "fee", "transfer", "expense", "income", "deposit", "withdrawal"];

export const ManualTransactionDialog = ({
  accounts,
  onCreated
}: {
  accounts: Array<{ id: string; name: string }>;
  onCreated?: () => void;
}) => {
  const router = useRouter();
  const { pushToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialAccount = useMemo(() => accounts[0]?.id ?? "", [accounts]);
  const [form, setForm] = useState({
    account_id: initialAccount,
    transaction_type: "expense",
    amount: "",
    quantity: "",
    price: "",
    transaction_date: new Date().toISOString().slice(0, 10),
    asset_name: "",
    symbol: "",
    currency: "INR"
  });

  const submit = async () => {
    setLoading(true);
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
        quantity: form.quantity ? Number(form.quantity) : undefined,
        price: form.price ? Number(form.price) : undefined
      })
    });
    setLoading(false);
    if (!response.ok) {
      const payload = await response.json();
      pushToast(payload.error ?? "Failed to create transaction", "error");
      return;
    }
    pushToast("Transaction added", "success");
    setOpen(false);
    onCreated?.();
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add transaction</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Manual transaction">
        <div className="space-y-3">
          <Select value={form.account_id} onChange={(e) => setForm((prev) => ({ ...prev, account_id: e.target.value }))}>
            {accounts.map((account) => (
              <option value={account.id} key={account.id}>
                {account.name}
              </option>
            ))}
          </Select>
          <Select value={form.transaction_type} onChange={(e) => setForm((prev) => ({ ...prev, transaction_type: e.target.value }))}>
            {txTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Input placeholder="Asset name" value={form.asset_name} onChange={(e) => setForm((prev) => ({ ...prev, asset_name: e.target.value }))} />
          <Input placeholder="Symbol" value={form.symbol} onChange={(e) => setForm((prev) => ({ ...prev, symbol: e.target.value }))} />
          <Input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))} />
            <Input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} />
          </div>
          <Input type="date" value={form.transaction_date} onChange={(e) => setForm((prev) => ({ ...prev, transaction_date: e.target.value }))} />
          <Button className="w-full" disabled={loading || !form.account_id || !form.amount} onClick={submit}>
            {loading ? "Saving..." : "Save transaction"}
          </Button>
        </div>
      </Modal>
    </>
  );
};
