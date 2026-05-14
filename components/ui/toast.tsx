"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{ pushToast: (message: string, type?: ToastType) => void }>({
  pushToast: () => undefined
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-lg border px-4 py-3 text-sm shadow-soft",
              item.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
              item.type === "error" && "border-red-200 bg-red-50 text-red-900",
              item.type === "info" && "border-slate-200 bg-white text-slate-800"
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
