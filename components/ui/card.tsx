import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("card p-5", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-sm font-semibold text-slate-500", className)} {...props} />
);

export const CardValue = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("mt-2 text-2xl font-semibold text-slate-900", className)} {...props} />
);
