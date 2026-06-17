"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronRight,
  Database,
  FileCheck2,
  Gauge,
  KeyRound,
  Layers,
  LayoutDashboard,
  Search,
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
  WalletCards,
  X
} from "lucide-react";

import { auditLogs, initialDepartmentTokenBudgets, initialOperationalThresholds, initialPermissions, initialUserTokenBudgets, models as initialModels } from "@/lib/mock-data";

type Toast = { id: number; message: string };
type ModelRecord = (typeof initialModels)[number];
type GlobalCommand = {
  label: string;
  detail: string;
  icon: typeof Server;
  href?: string;
  command?: "route-gpt5";
};
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
  modelCatalog: ModelRecord[];
  addModelToCatalog: (model: ModelRecord) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [auditRows, setAuditRows] = useState(auditLogs);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [departmentTokenBudgets, setDepartmentTokenBudgets] = useState(initialDepartmentTokenBudgets);
  const [userTokenBudgets, setUserTokenBudgets] = useState(initialUserTokenBudgets);
  const [operationalThresholds, setOperationalThresholds] = useState(initialOperationalThresholds);
  const [modelCatalog, setModelCatalog] = useState<ModelRecord[]>(initialModels);

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
    showToast(`${department} team token limit updated`);
    addAudit("Team token limit updated", department, "Permission");
  }

  function toggleDepartmentHardLimit(department: string) {
    setDepartmentTokenBudgets((current) => ({
      ...current,
      [department]: {
        ...current[department],
        hardLimit: !current[department].hardLimit
      }
    }));
    showToast(`${department} team hard limit updated`);
    addAudit("Team hard limit updated", department, "Permission");
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

  function addModelToCatalog(model: ModelRecord) {
    setModelCatalog((current) => [model, ...current.filter((item) => item.name !== model.name)]);
    showToast(`${model.name} added to model catalog`);
    addAudit("Model/provider added", model.name, "Model");
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
      updateOperationalThreshold,
      modelCatalog,
      addModelToCatalog
    }),
    [toasts, auditRows, permissions, departmentTokenBudgets, userTokenBudgets, operationalThresholds, modelCatalog]
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

const navSections = [
  { label: "Command Center", items: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/incidents", label: "Incidents", icon: AlertTriangle }
  ] },
  { label: "Operate", items: [
    { href: "/dashboard/targets", label: "Servers", icon: Server },
    { href: "/dashboard/monitoring", label: "Monitoring", icon: MonitorDot },
    { href: "/dashboard/stacks", label: "Stacks", icon: Layers }
  ] },
  { label: "AI Platform", items: [
    { href: "/dashboard/models", label: "Models & Providers", icon: Sparkles },
    { href: "/dashboard/routing-policies", label: "Routing Policies", icon: Route }
  ] },
  { label: "Workspaces", items: [
    { href: "/dashboard/workspaces", label: "AI Workspaces", icon: Layers },
    { href: "/dashboard/knowledge-bases", label: "Knowledge Bases", icon: Database },
    { href: "/dashboard/agents", label: "Agents", icon: Bot }
  ] },
  { label: "Govern", items: [
    { href: "/dashboard/departments", label: "Teams", icon: Building2 },
    { href: "/dashboard/approval-inbox", label: "Approval Inbox", icon: FileCheck2 },
    { href: "/dashboard/audit-logs", label: "Audit Logs", icon: ScrollText },
    { href: "/dashboard/compliance", label: "Compliance Readiness", icon: FileCheck2 }
  ] },
  { label: "Optimize", items: [
    { href: "/dashboard/resource-planner", label: "Resource Planner", icon: SlidersHorizontal },
    { href: "/dashboard/cost-capacity", label: "Cost & Capacity", icon: WalletCards }
  ] },
  { label: "Settings", items: [{ href: "/dashboard/settings", label: "Settings", icon: Settings }] }
];

const pageActions: Record<string, { href: string; label: string }> = {
  "/dashboard": { href: "/dashboard/workspaces#workspace-form", label: "Create Workspace" },
  "/dashboard/incidents": { href: "/dashboard/incidents", label: "Review Open" },
  "/dashboard/targets": { href: "/dashboard/targets#register-agent", label: "Add Server" },
  "/dashboard/targets/acme": { href: "/dashboard/targets/acme", label: "Deploy Stack" },
  "/dashboard/monitoring": { href: "/dashboard/monitoring", label: "Open Alerts" },
  "/dashboard/stacks": { href: "/dashboard/stacks", label: "Deploy Stack" },
  "/dashboard/models": { href: "/dashboard/models#integrate-model", label: "Add Model" },
  "/dashboard/routing-policies": { href: "/dashboard/routing-policies#routing-form", label: "Create Policy" },
  "/dashboard/workspaces": { href: "/dashboard/workspaces#workspace-form", label: "Create Workspace" },
  "/dashboard/knowledge-bases": { href: "/dashboard/knowledge-bases#kb-form", label: "Add Source" },
  "/dashboard/agents": { href: "/dashboard/agents#agent-form", label: "Create Agent" },
  "/dashboard/departments": { href: "/dashboard/departments#create-team", label: "Create Team" },
  "/dashboard/approval-inbox": { href: "/dashboard/approval-inbox", label: "Review Pending" },
  "/dashboard/audit-logs": { href: "/dashboard/audit-logs", label: "Export Audit" },
  "/dashboard/compliance": { href: "/dashboard/compliance", label: "Export Evidence" },
  "/dashboard/resource-planner": { href: "/dashboard/resource-planner#simulator", label: "Run Simulator" },
  "/dashboard/cost-capacity": { href: "/dashboard/cost-capacity#safeguards", label: "Review Savings" },
  "/dashboard/settings": { href: "/dashboard/settings#thresholds", label: "Configure" }
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("control-plane-sidebar-collapsed") === "true");
  }, []);

  function updateSidebar(nextCollapsed: boolean) {
    setCollapsed(nextCollapsed);
    window.localStorage.setItem("control-plane-sidebar-collapsed", String(nextCollapsed));
  }

  return (
    <div className="min-h-screen bg-[var(--surface-main)] text-[var(--text-primary)]">
      <aside className={`switchboard-sidebar fixed inset-y-0 left-0 z-30 hidden overflow-hidden border-r border-white/10 bg-[var(--surface-dark)] text-white shadow-2xl shadow-black/30 transition-all duration-200 lg:flex lg:flex-col ${collapsed ? "w-[4.5rem]" : "w-[16.25rem]"}`}>
        <div className={`shrink-0 border-b border-white/10 py-5 ${collapsed ? "px-4" : "px-6"}`}>
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Switchboard AI home">
            <div className="switchboard-mark" aria-hidden="true">
              <span className="switchboard-mark__line switchboard-mark__line--one" />
              <span className="switchboard-mark__line switchboard-mark__line--two" />
              <span className="switchboard-mark__node switchboard-mark__node--one" />
              <span className="switchboard-mark__node switchboard-mark__node--two" />
              <span className="switchboard-mark__node switchboard-mark__node--three" />
            </div>
            {!collapsed ? <div className="min-w-0">
              <div className="font-semibold tracking-tight">Switchboard AI</div>
              <div className="text-xs text-slate-400">Enterprise AI routing</div>
            </div> : null}
          </Link>
            {!collapsed ? (
              <button
                type="button"
                onClick={() => updateSidebar(true)}
                className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
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
            onClick={() => updateSidebar(false)}
            className="mx-auto mt-3 rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        ) : null}
        <nav className={`min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain py-4 ${collapsed ? "px-2" : "px-4"}`} aria-label="Dashboard navigation">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed ? <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{section.label}</div> : null}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === "/dashboard" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      className={`relative flex items-center rounded-lg py-2.5 text-sm transition ${collapsed ? "justify-center px-2" : "gap-3 px-3"} ${active ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                    >
                      {active ? <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--brand-primary)]" /> : null}
                      <Icon size={17} />
                      {!collapsed ? item.label : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        {!collapsed ? <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 shadow-xl shadow-black/20">
            <div className="flex min-w-0 items-center gap-2">
              <ShieldCheck size={15} className="shrink-0 text-emerald-300" />
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold">Governance mode</div>
                <div className="truncate text-[10px] text-slate-400">Policies enforced</div>
              </div>
            </div>
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--status-healthy)]" title="Policy engine active" />
          </div>
        </div> : null}
      </aside>
      <div className={`min-w-0 transition-all duration-200 ${collapsed ? "lg:pl-[4.5rem]" : "lg:pl-[16.25rem]"}`}>
        <TopBar />
        {children}
      </div>
    </div>
  );
}

function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast, addAudit } = useAppState();
  const action = pageActions[pathname] ?? { href: pathname, label: "Take Action" };
  const primaryAction = pathname === "/dashboard";
  const commandInputRef = useRef<HTMLInputElement>(null);
  const commandBarRef = useRef<HTMLDivElement>(null);
  const alertMenuRef = useRef<HTMLDivElement>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [alertMenuOpen, setAlertMenuOpen] = useState(false);

  const commands = useMemo<GlobalCommand[]>(() => [
    { label: "Open Claims On-Prem Node", detail: "Server / GPU pressure", href: "/dashboard/targets", icon: Server },
    { label: "Open Incidents", detail: "Command Center / Active response", href: "/dashboard/incidents", icon: AlertTriangle },
    { label: "Open Approval Inbox", detail: "Govern / Pending high-impact changes", href: "/dashboard/approval-inbox", icon: FileCheck2 },
    { label: "Review high-risk approvals", detail: "Approvals / Due soon", href: "/dashboard/approval-inbox", icon: ShieldCheck },
    { label: "Show degraded providers", detail: "Monitoring / Provider health", href: "/dashboard/monitoring", icon: AlertTriangle },
    { label: "Create Legal AI Workspace", detail: "Workspace / Governed interface", href: "/dashboard/workspaces", icon: Layers },
    { label: "Review ISO evidence gaps", detail: "Governance / Readiness support", href: "/dashboard/compliance", icon: FileCheck2 },
    { label: "Open Qwen 32B model", detail: "Model / Local and restricted-safe", href: "/dashboard/models", icon: Sparkles },
    { label: "Route GPT-5 critical work to Claude", detail: "Command / Apply simulated route", command: "route-gpt5", icon: Route },
    { label: "View agent kill switch controls", detail: "Agents / Safety controls", href: "/dashboard/agents", icon: Bot }
  ], []);

  const visibleCommands = useMemo(() => {
    const query = commandQuery.trim().toLowerCase();
    if (!query) return commands;
    return commands.filter((command) => `${command.label} ${command.detail}`.toLowerCase().includes(query));
  }, [commandQuery, commands]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
        window.setTimeout(() => commandInputRef.current?.focus(), 0);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setAlertMenuOpen(false);
        commandInputRef.current?.blur();
      }
    }

    function handlePointerDown(event: MouseEvent) {
      if (commandBarRef.current && !commandBarRef.current.contains(event.target as Node)) {
        setCommandOpen(false);
      }
      if (alertMenuRef.current && !alertMenuRef.current.contains(event.target as Node)) {
        setAlertMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function runCommand(command: (typeof commands)[number]) {
    setCommandOpen(false);
    setCommandQuery("");
    if (command.href) {
      router.push(command.href);
      return;
    }
    if (command.command === "route-gpt5") {
      showToast("Critical GPT-5 work routed to Claude");
      addAudit("Global command applied routing policy", "GPT-5 to Claude", "Model");
    }
  }

  return (
    <header className="sticky top-0 z-20 isolate border-b border-[var(--border-subtle)] bg-white/95 px-4 py-2 shadow-[0_4px_16px_rgba(17,24,39,0.05)] backdrop-blur sm:px-6">
      <div className="grid gap-2 xl:grid-cols-[minmax(300px,1fr)_minmax(240px,360px)_auto] xl:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-[var(--text-primary)]">Acme Corp</span>
          <span className="text-[var(--text-secondary)]">Production</span>
          <span className="hidden text-slate-300 md:inline">/</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(245,158,11,0.12)] px-2.5 py-1 text-xs font-semibold text-[var(--status-warning)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-warning)]" />
            AI Ops Status: Warning
          </span>
          <span aria-label="Demo Mode. Simulated actions only; no infrastructure changes are made." title="Simulated actions only. No infrastructure changes are made." className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">Demo Mode</span>
        </div>
        <div className="mt-1 hidden truncate text-xs text-slate-500 2xl:block">Fleet, models, workspaces, and governance.</div>
      </div>
      <div ref={commandBarRef} className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-[18px] -translate-y-1/2 text-slate-400" size={14} />
          <input
            ref={commandInputRef}
            value={commandQuery}
            onChange={(event) => {
              setCommandQuery(event.target.value);
              setCommandOpen(true);
            }}
            onFocus={() => setCommandOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && visibleCommands[0]) {
                event.preventDefault();
                runCommand(visibleCommands[0]);
              }
            }}
            aria-label="Global Command Bar"
            aria-expanded={commandOpen}
            aria-controls="global-command-suggestions"
            placeholder="Search or run command..."
            className="h-9 w-full rounded-md border border-[var(--border-subtle)] bg-white/70 pl-9 pr-14 text-xs text-[var(--text-primary)] shadow-sm transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          />
          <kbd className="pointer-events-none absolute right-2 top-[18px] -translate-y-1/2 rounded border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">Ctrl K</kbd>
          {commandOpen ? (
            <div id="global-command-suggestions" className="absolute right-0 top-11 z-40 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2">
                <span className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">Global Command Bar</span>
                <span className="text-[10px] text-[var(--text-secondary)]">Enter to run / Esc to close</span>
              </div>
              <div className="max-h-80 overflow-y-auto p-1.5">
                {visibleCommands.map((command) => {
                  const CommandIcon = command.icon;
                  return (
                    <button
                      key={command.label}
                      type="button"
                      onClick={() => runCommand(command)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition hover:bg-[var(--surface-muted)] focus:bg-[var(--surface-muted)] focus:outline-none"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[rgba(91,61,255,0.09)] text-[var(--brand-primary)]">
                        <CommandIcon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[var(--text-primary)]">{command.label}</span>
                        <span className="block truncate text-xs text-[var(--text-secondary)]">{command.detail}</span>
                      </span>
                      <ChevronRight size={14} className="shrink-0 text-slate-400" />
                    </button>
                  );
                })}
                {visibleCommands.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm text-[var(--text-secondary)]">No matching commands</div>
                ) : null}
              </div>
            </div>
          ) : null}
      </div>
      <div className="flex items-center justify-end gap-2">
        <div ref={alertMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setAlertMenuOpen((open) => !open)}
            aria-label="Open active alerts"
            aria-expanded={alertMenuOpen}
            aria-controls="active-alerts-menu"
            className={`relative inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${alertMenuOpen ? "border-[rgba(91,61,255,0.28)] bg-[rgba(91,61,255,0.07)] text-[var(--brand-primary-dark)]" : "border-[var(--border-subtle)] bg-[var(--surface-muted)] text-slate-700 hover:border-slate-300 hover:bg-white"}`}
          >
            <Bell size={15} />
            <span>3 alerts</span>
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--status-critical)] px-1 text-[9px] font-bold text-white">3</span>
          </button>
          {alertMenuOpen ? (
            <div id="active-alerts-menu" className="absolute right-0 top-11 z-40 w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-white shadow-[0_24px_60px_rgba(17,24,39,0.18)]">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Active alerts</p>
                  <p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">Live demo values across fleet and providers.</p>
                </div>
                <StatusBadge value="Warning" />
              </div>
              <div className="divide-y divide-[var(--border-subtle)]">
                <AlertMenuItem
                  severity="Critical"
                  title="Legal Sandbox agent offline"
                  detail="No heartbeat for 42 minutes"
                  value="Workspace unavailable"
                  href="/dashboard/targets"
                  onOpen={() => setAlertMenuOpen(false)}
                />
                <AlertMenuItem
                  severity="Warning"
                  title="Claims GPU pressure"
                  detail="GPU 92% / VRAM 22/24 GB"
                  value="Queue wait +18%"
                  href="/dashboard/cost-capacity"
                  onOpen={() => setAlertMenuOpen(false)}
                />
                <AlertMenuItem
                  severity="Degraded"
                  title="OpenAI GPT-5 latency"
                  detail="p95 latency 1,480 ms"
                  value="Fallback ready"
                  href="/dashboard/routing-policies"
                  onOpen={() => setAlertMenuOpen(false)}
                />
              </div>
              <Link href="/dashboard/monitoring" onClick={() => setAlertMenuOpen(false)} className="flex min-h-10 items-center justify-between px-4 text-xs font-semibold text-[var(--brand-primary)] hover:bg-[var(--surface-muted)]">
                View all monitoring alerts <ChevronRight size={14} />
              </Link>
            </div>
          ) : null}
        </div>
        <Link
          href={action.href}
          onClick={(event) => {
            const [actionPath, actionHash] = action.href.split("#");
            if (actionHash && actionPath === pathname && window.location.hash === `#${actionHash}`) {
              event.preventDefault();
              window.dispatchEvent(new HashChangeEvent("hashchange"));
            }
          }}
          className={`inline-flex min-h-9 items-center justify-center rounded-md px-3.5 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 ${primaryAction ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]" : "border border-[var(--border-subtle)] bg-white text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"}`}
        >
          {action.label}
        </Link>
      </div>
      </div>
    </header>
  );
}

function AlertMenuItem({ severity, title, detail, value, href, onOpen }: {
  severity: string;
  title: string;
  detail: string;
  value: string;
  href: string;
  onOpen: () => void;
}) {
  return (
    <Link href={href} onClick={onOpen} className="group flex items-start gap-3 px-4 py-3 transition hover:bg-[var(--surface-muted)]">
      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${severity === "Critical" ? "bg-[var(--status-critical)]" : "bg-[var(--status-warning)]"}`} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="truncate text-xs font-semibold text-[var(--text-primary)]">{title}</span>
          <StatusBadge value={severity} />
        </span>
        <span className="mt-1 block text-[10px] text-[var(--text-secondary)]">{detail}</span>
        <span className="mt-1 block text-[10px] font-semibold text-[var(--brand-primary-dark)]">{value}</span>
      </span>
      <ChevronRight size={14} className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[var(--brand-primary)]" />
    </Link>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-5 sm:px-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{title}</h1>
          {description ? <p className="mt-1.5 max-w-3xl text-sm leading-5 text-slate-600">{description}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Section({ children }: { children: ReactNode }) {
  return <section className="mx-auto max-w-[1720px] p-4 sm:p-6 xl:p-7">{children}</section>;
}

export function Card({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return <div id={id} className={`scroll-mt-28 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[0_1px_2px_rgba(17,24,39,0.04),0_12px_30px_rgba(17,24,39,0.05)] ${className}`}>{children}</div>;
}

export function SectionCard({ title, children, detail, action, className = "", id }: { title?: string; children: ReactNode; detail?: string; action?: ReactNode; className?: string; id?: string }) {
  return (
    <Card id={id} className={className}>
      {title || detail || action ? (
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-4 md:flex-row md:items-start">
          <div>
            {title ? <h2 className="font-semibold text-[var(--text-primary)]">{title}</h2> : null}
            {detail ? <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{detail}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </Card>
  );
}

export function MetricCard({ label, value, detail, icon, status, trend }: { label: string; value: string; detail?: string; icon: ReactNode; status?: string; trend?: string }) {
  return (
    <Card className="relative overflow-hidden p-4">
      <div className="absolute inset-x-0 top-0 h-1 bg-[var(--brand-primary)]" />
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-[var(--text-secondary)]">{label}</div>
        <div className="grid h-8 w-8 place-items-center rounded-md bg-[rgba(22,199,232,0.12)] text-[var(--brand-accent)]">{icon}</div>
      </div>
      <div className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{value}</div>
      {detail || trend || status ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
          {trend ? <span className="font-medium text-[var(--brand-primary)]">{trend}</span> : null}
          {detail ? <span>{detail}</span> : null}
          {status ? <StatusBadge value={status} /> : null}
        </div>
      ) : null}
    </Card>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const cls = value === "Healthy" || value === "Running" || value === "Connected" || value === "Online" || value === "Success" || value === "Operational" || value === "Active" || value === "Enforced" || value === "Synced" || value === "Indexed" || value === "Published"
    ? "bg-[rgba(16,185,129,0.10)] text-[var(--status-healthy)] ring-[rgba(16,185,129,0.28)]"
    : value === "Warning" || value === "Open" || value === "Medium" || value === "Degraded" || value === "Near limit" || value === "Under-allocated" || value === "Over-allocated" || value === "Cost risk"
      ? "bg-[rgba(245,158,11,0.12)] text-[var(--status-warning)] ring-[rgba(245,158,11,0.30)]"
      : value === "Offline" || value === "Critical" || value === "High" || value === "Down" || value === "Governance risk" || value === "Disabled"
        ? "bg-[rgba(225,29,72,0.10)] text-[var(--status-critical)] ring-[rgba(225,29,72,0.24)]"
        : "bg-slate-100 text-[var(--status-offline)] ring-slate-200";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cls}`}>{value}</span>;
}

export function RiskBadge({ level }: { level: "Low" | "Medium" | "High" | "Critical" | "Governance risk" | "Cost risk" }) {
  const value = level === "Low" ? "Healthy" : level;
  return <StatusBadge value={value} />;
}

export function ActionButton({ children, onClick, variant = "primary" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "danger" }) {
  const cls = variant === "primary" ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]" : variant === "danger" ? "bg-[var(--status-critical)] text-white hover:bg-rose-700" : "border border-[var(--border-subtle)] bg-white text-[var(--text-primary)] hover:bg-[var(--surface-muted)]";
  return <button onClick={onClick} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 ${cls}`}>{children}</button>;
}

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-secondary)]">
          <tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => <tr key={index} className="hover:bg-[var(--surface-muted)]">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3.5 align-middle">{cell}</td>)}</tr>)}
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
        <Gauge size={17} className="text-[var(--brand-primary)]" />
      </div>
      <div className="h-56 sm:h-60">{children}</div>
    </Card>
  );
}

export function RecommendedActionCard({ title, evidence, recommendation, impact, status = "Warning", actionLabel = "Review", onAction }: { title: string; evidence: string; recommendation: string; impact: string; status?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[rgba(91,61,255,0.10)] text-[var(--brand-primary)]">
          <AlertTriangle size={17} />
        </div>
        <StatusBadge value={status} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]"><span className="font-medium text-[var(--text-primary)]">Evidence:</span> {evidence}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]"><span className="font-medium text-[var(--text-primary)]">Recommendation:</span> {recommendation}</p>
      <div className="mt-3 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--brand-primary-dark)]">{impact}</div>
      <div className="mt-4">
        <ActionButton onClick={onAction}>{actionLabel}</ActionButton>
      </div>
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
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="app-modal-title" className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-xl border border-white/70 bg-white shadow-[0_30px_90px_rgba(9,13,26,0.30)]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[var(--surface-muted)] px-5 py-4">
          <h2 id="app-modal-title" className="font-semibold text-[var(--text-primary)]">{title}</h2>
          <button type="button" aria-label="Close dialog" onClick={onClose} className="rounded-md border border-transparent p-1.5 text-[var(--text-secondary)] transition hover:border-[var(--border-subtle)] hover:bg-white hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"><X size={18} /></button>
        </div>
        <div className="max-h-[calc(92vh-57px)] overflow-y-auto p-5">{children}</div>
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
