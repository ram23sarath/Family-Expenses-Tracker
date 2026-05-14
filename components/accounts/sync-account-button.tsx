"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export const SyncAccountButton = ({ accountId, providerType }: { accountId: string; providerType: string }) => {
  const router = useRouter();
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    if (providerType !== "zerodha" && providerType !== "groww") {
      pushToast("Sync is available only for broker connections in this draft", "info");
      return;
    }
    setLoading(true);
    const response = await fetch("/api/sync/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, providerType })
    });
    setLoading(false);
    if (!response.ok) {
      const payload = await response.json();
      pushToast(payload.error ?? "Sync failed", "error");
      return;
    }
    pushToast("Sync completed", "success");
    router.refresh();
  };

  return (
    <Button type="button" variant="ghost" onClick={sync} disabled={loading}>
      {loading ? "Syncing..." : "Sync"}
    </Button>
  );
};
