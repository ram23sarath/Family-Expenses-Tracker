"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

export const ExpenseEntryDialog = ({
  categories,
  members
}: {
  categories: Array<{ id: string; name: string }>;
  members: Array<{ id: string; full_name: string | null }>;
}) => {
  const router = useRouter();
  const { pushToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category_id: categories[0]?.id ?? "",
    paid_by_user_id: members[0]?.id ?? "",
    amount: "",
    currency: "INR",
    entry_type: "expense",
    expense_date: new Date().toISOString().slice(0, 10),
    note: ""
  });

  const save = async () => {
    setLoading(true);
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) })
    });
    setLoading(false);
    if (!response.ok) {
      const payload = await response.json();
      pushToast(payload.error ?? "Failed to save entry", "error");
      return;
    }
    pushToast("Entry saved", "success");
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add expense/income</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add expense or income">
        <div className="space-y-3">
          <Select value={form.entry_type} onChange={(event) => setForm((prev) => ({ ...prev, entry_type: event.target.value }))}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
          <Select value={form.category_id} onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select value={form.paid_by_user_id} onChange={(event) => setForm((prev) => ({ ...prev, paid_by_user_id: event.target.value }))}>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name || "Member"}
              </option>
            ))}
          </Select>
          <Input type="number" placeholder="Amount" value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))} />
          <Input type="date" value={form.expense_date} onChange={(event) => setForm((prev) => ({ ...prev, expense_date: event.target.value }))} />
          <Input placeholder="Note (optional)" value={form.note} onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))} />
          <Button className="w-full" onClick={save} disabled={loading || !form.category_id || !form.paid_by_user_id || !form.amount}>
            {loading ? "Saving..." : "Save entry"}
          </Button>
        </div>
      </Modal>
    </>
  );
};
