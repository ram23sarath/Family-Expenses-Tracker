"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

const providerOptions = ["zerodha", "groww", "indmoney_csv", "manual", "bank", "cash"];
const categoryOptions = ["brokerage", "mutual_fund", "stock", "cash", "bank", "other"];

export const AddAccountDialog = ({ onCreated }: { onCreated?: () => void }) => {
  const router = useRouter();
  const { pushToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    provider_type: "manual",
    account_category: "brokerage",
    base_currency: "INR"
  });

  const createAccount = async () => {
    setLoading(true);
    const response = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setLoading(false);
    if (!response.ok) {
      const payload = await response.json();
      pushToast(payload.error ?? "Failed to create account", "error");
      return;
    }

    pushToast("Account created", "success");
    setOpen(false);
    setForm({
      name: "",
      provider_type: "manual",
      account_category: "brokerage",
      base_currency: "INR"
    });
    onCreated?.();
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add account</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add account">
        <div className="space-y-3">
          <Input placeholder="Account name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          <Select value={form.provider_type} onChange={(e) => setForm((prev) => ({ ...prev, provider_type: e.target.value }))}>
            {providerOptions.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </Select>
          <Select value={form.account_category} onChange={(e) => setForm((prev) => ({ ...prev, account_category: e.target.value }))}>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Input value={form.base_currency} onChange={(e) => setForm((prev) => ({ ...prev, base_currency: e.target.value.toUpperCase() }))} placeholder="Base currency" />
          <Button className="w-full" onClick={createAccount} disabled={loading || !form.name}>
            {loading ? "Saving..." : "Save account"}
          </Button>
        </div>
      </Modal>
    </>
  );
};
