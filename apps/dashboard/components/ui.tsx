"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Bell,
  Bot,
  Boxes,
  Building2,
  CheckCircle2,
  Cloud,
  Database,
  Gauge,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  MonitorDot,
  Play,
  Route,
  ScrollText,
  Settings,
  ShieldCheck,
  Server,
  SlidersHorizontal,
  Sparkles,
  X
} from "lucide-react";

import { auditLogs, initialDepartmentTokenBudgets, initialOperationalThresholds, initialPermissions, initialUserTokenBudgets } from "@/lib/mock-data";

export const DEMO_AUTH_KEY = "ai-control-plane-demo-authenticated";
export const DEMO_EMAIL_HASH = "d66bee74";
export const DEMO_PASSWORD_HASH = "c1aef9c0";

type Toast = { id: number; message: string };
type AppState = {
  toasts: Toast[];
  showToast: (message: string) => void;
  auditRows: typeof auditLogs;
  addAudit: (action: string, target: string, type?: string) => void;
  permissions: typeof initialPermissions;
  togglePermission: (department: string, model: string) => void;
  departmentTokenBudgets: typeof initialDepartmentTokenBudgets;
  updateDepartmentTokenBudget: (department: string, limit: number) => void;
  toggleDepartmentHardLimit: (department: string) => void;
  userTokenBudgets: typeof initialUserTokenBudgets;
  updateUserTokenBudget: (id: string, limit: number) => void;
  operationalThresholds: typeof initialOperationalThresholds;
  updateOperationalThreshold: (key: keyof typeof initialOperationalThresholds, value: number) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [auditRows, setAuditRows] = useState(auditLogs);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [departmentTokenBudgets, setDepartmentTokenBudgets] = useState(initialDepartmentTokenBudgets);
  const [userTokenBudgets, setUserTokenBudgets] = useState(initialUserTokenBudgets);
  const [operationalThresholds, setOperationalThresholds] = useState(initialOperationalThresholds);

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

  function updateDepartmentTokenBudget(department: string, limit: number) {
    setDepartmentTokenBudgets((current) => ({
      ...current,
      [department]: {
        ...current[department],
        monthlyLimit: limit
      }
    }));
    showToast(`${department} token limit updated`);
    addAudit("Department token limit updated", department, "Permission");
  }

  function toggleDepartmentHardLimit(department: string) {
    setDepartmentTokenBudgets((current) => ({
      ...current,
      [department]: {
        ...current[department],
        hardLimit: !current[department].hardLimit
      }
    }));
    showToast(`${department} hard limit updated`);
    addAudit("Department hard limit updated", department, "Permission");
  }

  function updateUserTokenBudget(id: string, limit: number) {
    const user = userTokenBudgets.find((item) => item.id === id);
    setUserTokenBudgets((current) => current.map((item) => item.id === id ? { ...item, monthlyLimit: limit } : item));
    showToast(`${user?.name || "User"} token limit updated`);
    addAudit("Individual token limit updated", user?.name || id, "Permission");
  }

  function updateOperationalThreshold(key: keyof typeof initialOperationalThresholds, value: number) {
    setOperationalThresholds((current) => ({ ...current, [key]: value }));
    showToast("Operational threshold updated");
    addAudit("Operational threshold updated", key, "Alert");
  }

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      auditRows,
      addAudit,
      permissions,
      togglePermission,
      departmentTokenBudgets,
      updateDepartmentTokenBudget,
      toggleDepartmentHardLimit,
      userTokenBudgets,
      updateUserTokenBudget,
      operationalThresholds,
      updateOperationalThreshold
    }),
    [toasts, auditRows, permissions, departmentTokenBudgets, userTokenBudgets, operationalThresholds]
  );

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

export function AuthGate({ children }: { children: ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthorized(window.localStorage.getItem(DEMO_AUTH_KEY) === "true");
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#080d18] px-6 text-white">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-cyan-300" aria-label="Loading secure demo" />
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#080d18] px-6 text-white">
        <section className="w-full max-w-md rounded-xl border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-300 text-slate-950">
            <Lock size={20} />
          </div>
          <h1 className="mt-5 text-2xl font-semibold">Secure demo access required</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Sign in to continue.</p>
          <Link href="/" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950">
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  return children;
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
  { href: "/dashboard/targets", label: "Servers", icon: Server },
  { href: "/dashboard/models", label: "Models & Providers", icon: Sparkles },
  { href: "/dashboard/stacks", label: "Stacks", icon: Layers },
  { href: "/dashboard/departments", label: "Teams", icon: Building2 },
  { href: "/dashboard/workspaces", label: "AI Workspaces", icon: Layers },
  { href: "/dashboard/knowledge-bases", label: "Knowledge Bases", icon: Database },
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
  { href: "/dashboard/routing-policies", label: "Routing Policies", icon: Route },
  { href: "/dashboard/resource-planner", label: "Resource Planner", icon: SlidersHorizontal },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: MonitorDot },
  { href: "/dashboard/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-white/10 bg-[#080d18] text-white transition-all duration-200 lg:flex lg:flex-col ${collapsed ? "w-20" : "w-72"}`}>
        <div className={`border-b border-white/10 py-5 ${collapsed ? "px-4" : "px-6"}`}>
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="AI Control Plane home">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/30">
              <Cloud size={19} />
            </div>
            {!collapsed ? <div className="min-w-0">
              <div className="font-semibold">AI Control Plane</div>
              <div className="text-xs text-slate-400">Enterprise AI operations</div>
            </div> : null}
          </Link>
            {!collapsed ? (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={17} />
              </button>
            ) : null}
          </div>
        </div>
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-3 rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        ) : null}
        <nav className={`flex-1 space-y-1 py-4 ${collapsed ? "px-2" : "px-3"}`} aria-label="Dashboard navigation">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/dashboard" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={`flex items-center rounded-md py-2.5 text-sm transition ${collapsed ? "justify-center px-2" : "gap-3 px-3"} ${active ? "bg-white text-slate-950 shadow" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon size={17} />
                {!collapsed ? item.label : null}
              </Link>
            );
          })}
        </nav>
        {!collapsed ? <div className="border-t border-white/10 p-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/20">
            <div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck size={16} /> Governance mode</div>
            <p className="mt-2 text-xs leading-5 text-slate-400">Mock controls simulate policy enforcement across models, APIs, and apps.</p>
            <div className="mt-4 flex items-center justify-between rounded-md bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
              <span>Policy engine</span>
              <span>Active</span>
            </div>
          </div>
        </div> : null}
      </aside>
      <div className={`transition-all duration-200 ${collapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <TopBar />
        {children}
      </div>
    </div>
  );
}

function TopBar() {
  function logout() {
    window.localStorage.removeItem(DEMO_AUTH_KEY);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
      <div className="min-w-0">
        <div className="text-sm font-semibold">One operating layer for enterprise AI infrastructure.</div>
        <div className="truncate text-xs text-slate-500">Deploy AI anywhere. Govern it centrally. Operate it from one place.</div>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <IconPill icon={<Bell size={15} />} label="2 alerts" />
        <IconPill icon={<Lock size={15} />} label="Secure demo" />
        <button onClick={logout} className="min-h-9 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">
          Sign out
        </button>
      </div>
    </header>
  );
}

function IconPill({ icon, label }: { icon: ReactNode; label: string }) {
  return <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">{icon}{label}</div>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-7">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-cyan-700">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Section({ children }: { children: ReactNode }) {
  return <section className="p-6 xl:p-8">{children}</section>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.04)] ${className}`}>{children}</div>;
}

export function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon: ReactNode }) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-1 bg-cyan-500" />
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="grid h-9 w-9 place-items-center rounded-md bg-cyan-50 text-cyan-700">{icon}</div>
      </div>
      <div className="mt-4 text-2xl font-semibold">{value}</div>
      {detail ? <div className="mt-1 text-xs text-slate-500">{detail}</div> : null}
    </Card>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const cls = value === "Healthy" || value === "Running" || value === "Connected" || value === "Online" || value === "Success" || value === "Operational" || value === "Active" || value === "Enforced" || value === "Synced" || value === "Indexed"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : value === "Warning" || value === "Open" || value === "Medium" || value === "Degraded" || value === "Near limit" || value === "Under-allocated" || value === "Over-allocated" || value === "Cost risk"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : value === "Offline" || value === "Critical" || value === "High" || value === "Down" || value === "Governance risk"
        ? "bg-red-50 text-red-700 ring-red-200"
        : "bg-slate-100 text-slate-700 ring-slate-200";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cls}`}>{value}</span>;
}

export function ActionButton({ children, onClick, variant = "primary" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "danger" }) {
  const cls = variant === "primary" ? "bg-slate-950 text-white hover:bg-slate-800" : variant === "danger" ? "bg-red-600 text-white hover:bg-red-700" : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50";
  return <button onClick={onClick} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${cls}`}>{children}</button>;
}

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => <tr key={index} className="hover:bg-slate-50">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-4 align-middle">{cell}</td>)}</tr>)}
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
