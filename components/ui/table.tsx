import type { HTMLAttributes, TableHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Table = ({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) => (
  <table className={cn("min-w-full text-sm", className)} {...props} />
);

export const THead = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("bg-slate-50 text-slate-600", className)} {...props} />
);

export const TBody = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn("divide-y divide-slate-200", className)} {...props} />
);

export const Tr = ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn(className)} {...props} />
);

export const Th = ({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn("px-3 py-2 text-left font-medium", className)} {...props} />
);

export const Td = ({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-3 py-2", className)} {...props} />
);
