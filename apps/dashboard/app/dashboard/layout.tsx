"use client";

import { AppStateProvider, AuthGate, DashboardShell } from "@/components/ui";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      <AuthGate>
        <DashboardShell>{children}</DashboardShell>
      </AuthGate>
    </AppStateProvider>
  );
}
