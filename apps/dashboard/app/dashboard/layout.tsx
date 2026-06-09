"use client";

import { AppStateProvider, DashboardShell } from "@/components/ui";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      <DashboardShell>{children}</DashboardShell>
    </AppStateProvider>
  );
}
