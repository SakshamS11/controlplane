"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Bell,
  Boxes,
  Building2,
  CheckCircle2,
  Cloud,
  Database,
  Gauge,
  Home,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lock,
  MonitorDot,
  Play,
  ScrollText,
  Settings,
  ShieldCheck,
  Server,
  Sparkles,
  X
} from "lucide-react";

import { auditLogs, initialPermissions } from "@/lib/mock-data";

type Toast = { id: number; message: string };
type AppState = {
  toasts: Toast[];
  showToast: (message: string) => void;
  auditRows: typeof auditLogs;
  addAudit: (action: string, target: string, type?: string) => void;
  permissions: typeof initialPermissions;
  togglePermission: (department: string, model: string) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [auditRows, setAuditRows] = useState(auditLogs);
  const [permissions, setPermissions] = useState(initialPermissions);

  function showToast(message: string) {
    const id = Date.now();
    setToasts((items) => [...items, { id, message }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3200);
  }

  function addAudit(action: string, target: string, type = "Deployment") {
    const now = new Date();
    setAuditRows((rows) => [
      {
        timestamp: now.toLocaleString(),
        actor: "demo-admin",
        action,
        target,
        severity: "Info",
        status: "Success",
        type
      },
      ...rows
    ]);
  }

  function togglePermission(department: string, model: string) {
    setPermissions((current) => ({
      ...current,
      [department]: {
        ...current[department],
        [model]: !current[department][model]
      }
    }));
    showToast(`${model} access updated for ${department}`);
    addAudit(`${model} access changed`, department, "Permission");
  }

  const value = useMemo(() => ({ toasts, showToast, auditRows, addAudit, permissions, togglePermission }), [toasts, auditRows, permissions]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
      <ToastStack />
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error("useAppState must be used inside AppStateProvider");
  return value;
}

function ToastStack() {
  const { toasts } = useAppState();
  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="flex min-w-72 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-xl">
          <CheckCircle2 className="text-emerald-600" size={18} />
          {toast.message}
        </div>
      ))}
    </div>
  );
}

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/targets", label: "Deployment Targets", icon: Server },
  { href: "/dashboard/models", label: "Models", icon: Sparkles },
  { href: "/dashboard/stacks", label: "Stacks", icon: Layers },
  { href: "/dashboard/departments", label: "Departments", icon: Building2 },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: MonitorDot },
  { href: "/dashboard/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-slate-950 text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-400 text-slate-950">
              <Cloud size={19} />
            </div>
            <div>
              <div className="font-semibold">AI Control Plane</div>
              <div className="text-xs text-slate-400">Enterprise AI ops</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${active ? "bg-white text-slate-950 shadow" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck size={16} /> Governance mode</div>
            <p className="mt-2 text-xs leading-5 text-slate-400">Mock controls simulate policy enforcement across models, APIs, and apps.</p>
          </div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <TopBar />
        {children}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur">
      <div>
        <div className="text-sm font-semibold">One operating layer for enterprise AI infrastructure.</div>
        <div className="text-xs text-slate-500">Deploy AI anywhere. Govern it centrally. Operate it from one place.</div>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <IconPill icon={<Bell size={15} />} label="2 alerts" />
        <IconPill icon={<Lock size={15} />} label="Mock demo" />
      </div>
    </header>
  );
}

function IconPill({ icon, label }: { icon: ReactNode; label: string }) {
  return <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">{icon}{label}</div>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-cyan-700">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Section({ children }: { children: ReactNode }) {
  return <section className="p-6">{children}</section>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">{label}</div>
        <div className="grid h-9 w-9 place-items-center rounded-md bg-slate-100 text-slate-700">{icon}</div>
      </div>
      <div className="mt-4 text-2xl font-semibold">{value}</div>
      {detail ? <div className="mt-1 text-xs text-slate-500">{detail}</div> : null}
    </Card>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const cls = value === "Healthy" || value === "Running" || value === "Connected" || value === "Online" || value === "Success"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : value === "Warning" || value === "Open" || value === "Medium"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : value === "Offline" || value === "Critical" || value === "High"
        ? "bg-red-50 text-red-700 ring-red-200"
        : "bg-slate-100 text-slate-700 ring-slate-200";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cls}`}>{value}</span>;
}

export function ActionButton({ children, onClick, variant = "primary" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "danger" }) {
  const cls = variant === "primary" ? "bg-slate-950 text-white hover:bg-slate-800" : variant === "danger" ? "bg-red-600 text-white hover:bg-red-700" : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50";
  return <button onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium shadow-sm transition ${cls}`}>{children}</button>;
}

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => <tr key={index} className="hover:bg-slate-50">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 align-middle">{cell}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

export function ChartCard({ title, children, detail }: { title: string; children: ReactNode; detail?: string }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
        </div>
        <Gauge size={17} className="text-slate-400" />
      </div>
      <div className="h-72">{children}</div>
    </Card>
  );
}

export function EmptyMock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <Database className="mx-auto text-slate-400" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function MockAction({ label, auditTarget, variant = "secondary" }: { label: string; auditTarget: string; variant?: "primary" | "secondary" | "danger" }) {
  const { showToast, addAudit } = useAppState();
  return (
    <ActionButton
      variant={variant}
      onClick={() => {
        showToast(`${label} simulated`);
        addAudit(label, auditTarget);
      }}
    >
      <Play size={15} />
      {label}
    </ActionButton>
  );
}

export const icons = { Activity, Boxes, Database, KeyRound, Server, Sparkles, ShieldCheck };
