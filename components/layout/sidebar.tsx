"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/expenses", label: "Expenses" },
  { href: "/transactions", label: "Transactions" },
  { href: "/accounts", label: "Accounts" },
  { href: "/imports", label: "Imports" },
  { href: "/reports", label: "Reports" },
  { href: "/members", label: "Members" },
  { href: "/audit-log", label: "Audit Log" },
  { href: "/settings", label: "Settings" }
];

export const Sidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="w-full border-b border-slate-200 bg-white p-3 md:h-screen md:w-60 md:border-b-0 md:border-r md:p-4">
      <p className="mb-4 text-lg font-semibold">Family Tracker</p>
      <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm transition",
              pathname.startsWith(item.href) ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
