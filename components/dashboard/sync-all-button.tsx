"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export const SyncAllButton = () => {
  const router = useRouter();
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    setLoading(true);
    const response = await fetch("/api/sync/all", { method: "POST" });
    setLoading(false);
    if (!response.ok) {
      const payload = await response.json();
      pushToast(payload.error ?? "Sync failed", "error");
      return;
    }
    const payload = await response.json();
    const failed = (payload.outcomes ?? []).filter((item: { status: string }) => item.status === "failed").length;
    pushToast(failed ? `Sync completed with ${failed} failures` : "Sync completed", failed ? "info" : "success");
    router.refresh();
  };

  return (
    <Button onClick={sync} disabled={loading}>
      {loading ? "Syncing..." : "Sync all accounts"}
    </Button>
  );
};
