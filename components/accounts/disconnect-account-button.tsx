"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export const DisconnectAccountButton = ({ accountId, providerType }: { accountId: string; providerType: "zerodha" | "groww" }) => {
  const router = useRouter();
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(false);

  const disconnect = async () => {
    setLoading(true);
    const response = await fetch("/api/accounts/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, providerType })
    });
    setLoading(false);
    if (!response.ok) {
      const payload = await response.json();
      pushToast(payload.error ?? "Failed to disconnect account", "error");
      return;
    }
    pushToast("Broker disconnected", "success");
    router.refresh();
  };

  return (
    <Button type="button" variant="ghost" onClick={disconnect} disabled={loading}>
      {loading ? "Disconnecting..." : "Disconnect"}
    </Button>
  );
};
