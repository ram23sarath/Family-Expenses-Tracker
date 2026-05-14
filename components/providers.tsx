"use client";

import { ToastProvider } from "@/components/ui/toast";

export const Providers = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;
