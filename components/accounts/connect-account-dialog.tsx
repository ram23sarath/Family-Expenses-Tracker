"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

export const ConnectAccountDialog = ({
  accountId,
  providerType,
  onConnected
}: {
  accountId: string;
  providerType: "zerodha" | "groww";
  onConnected?: () => void;
}) => {
  const router = useRouter();
  const { pushToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [externalAccountId, setExternalAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [provider, setProvider] = useState<"zerodha" | "groww">(providerType);

  const submit = async () => {
    setLoading(true);
    const response = await fetch("/api/accounts/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, providerType: provider, externalAccountId, accessToken })
    });
    setLoading(false);

    if (!response.ok) {
      const payload = await response.json();
      pushToast(payload.error ?? "Failed to connect account", "error");
      return;
    }
    pushToast("Account connected", "success");
    setOpen(false);
    onConnected?.();
    router.refresh();
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Connect
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Connect broker account">
        <div className="space-y-3">
          <Select value={provider} onChange={(e) => setProvider(e.target.value as "zerodha" | "groww")}>
            <option value="zerodha">Zerodha</option>
            <option value="groww">Groww</option>
          </Select>
          <Input placeholder="External account ID" value={externalAccountId} onChange={(e) => setExternalAccountId(e.target.value)} />
          <Input type="password" placeholder="Access token" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} />
          <Button className="w-full" disabled={loading || !externalAccountId || !accessToken} onClick={submit}>
            {loading ? "Connecting..." : "Save secure connection"}
          </Button>
        </div>
      </Modal>
    </>
  );
};
