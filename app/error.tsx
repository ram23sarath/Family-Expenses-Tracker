"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="max-w-xl text-center text-sm text-slate-500">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
