import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-200 transition focus:ring-2",
      className
    )}
    {...props}
  />
);
