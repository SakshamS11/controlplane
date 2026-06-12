"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  Cpu,
  FileCheck2,
  RefreshCw,
  Server,
  Timer
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { DonutChart, TrafficCostChart } from "@/components/charts";
import { ActionButton, Card, DataTable, Modal, Section, StatusBadge, useAppState } from "@/components/ui";
import { auditLogs, workspaces } from "@/lib/mock-data";

type DetailTab = "workspaces" | "trend" | "audit";
type ConfirmationAction = {
  title: string;
  message: string;
  impact: string;
  target: string;
  auditType: string;
};

const issues = [
  {
    title: "Legal Sandbox Offline",
    severity: "Critical",
    area: "Legal Sandbox",
    problem: "Agent offline for 42 minutes.",
    recommendation: "Restart the agent.",
    action: "View Logs"
  },
  {
    title: "Claims GPU Pressure",
    severity: "Warning",
    area: "Claims",
    problem: "GPU 92%; VRAM 22/24 GB.",
    recommendation: "Rebalance local capacity.",
    action: "Review Capacity"
  },
  {
    title: "OpenAI Provider Degraded",
    severity: "Warning",
    area: "GPT-5",
    problem: "p95 latency is 1,480 ms.",
    recommendation: "Use approved fallback routing.",
    action: "Apply Routing Policy"
  },
  {
    title: "Marketing Overspend Risk",
    severity: "Warning",
    area: "Marketing",
    problem: "Forecast is above team budget.",
    recommendation: "Simulate a cheaper model mix.",
    action: "Simulate Savings"
  },
  {
    title: "Finance Agent Approval Gap",
    severity: "Medium",
    area: "Finance",
    problem: "Human approval rule is missing.",
    recommendation: "Review evidence controls.",
    action: "Review Evidence"
  }
];

const infrastructure = [
  {
    name: "Acme Azure GPU Server",
    status: "Healthy",
    metric: "GPU 71%",
    detail: "6/6 services",
    href: "/dashboard/targets/acme"
  },
  {
    name: "Claims On-Prem Node",
    status: "Warning",
    metric: "GPU 92%",
    detail: "VRAM 22/24 GB",
    href: "/dashboard/cost-capacity"
  },
  {
    name: "AWS Private AI Node",
    status: "Healthy",
    metric: "GPU 54%",
    detail: "RAG running",
    href: "/dashboard/targets"
  },
  {
    name: "Legal Sandbox",
    status: "Offline",
    metric: "Agent offline",
    detail: "42 min ago",
    href: "/dashboard/targets"
  }
];

const recommendedActions = [
  {
    title: "Restart Legal Sandbox agent",
    impact: "Restore Legal workspace availability.",
    action: "Restart Agent",
    tone: "Critical"
  },
  {
    title: "Add Qwen replica or reclaim Finance GPU",
    impact: "Reduce queue wait and SLA risk.",
    action: "Simulate Fix",
    tone: "Warning"
  },
  {
    title: "Route GPT-5 critical work to Claude/Qwen",
    impact: "Lower latency and provider risk.",
    action: "Apply Routing Policy",
    tone: "Warning"
  },
  {
    title: "Enable Marketing cost ladder",
    impact: "Save an estimated AED 18k/month.",
    action: "Apply Cost Ladder",
    tone: "Warning"
  },
  {
    title: "Enable Finance human approval",
    impact: "Improve ISO evidence readiness.",
    action: "Enable Approval",
    tone: "Medium"
  }
];

const kpis = [
  { label: "Monthly Requests", value: "128,420", status: "Healthy", detail: "+18% this month", icon: Activity },
  { label: "Avg Latency", value: "812 ms", status: "Healthy", detail: "Limit 1,200 ms", icon: Timer },
  { label: "GPU Peak", value: "92%", status: "Warning", detail: "Claims node", icon: Cpu },
  { label: "Savings Opportunity", value: "AED 42k", status: "Healthy", detail: "Per month", icon: CircleDollarSign },
  { label: "Compliance Gaps", value: "5", status: "Warning", detail: "Evidence tasks", icon: FileCheck2 },
  { label: "Workspaces Active", value: "5", status: "Healthy", detail: "4 published", icon: Boxes }
];

const modelCosts = [
  { name: "GPT-5", value: 73600, share: "40%" },
  { name: "Claude", value: 44160, share: "24%" },
  { name: "Qwen Local", value: 29440, share: "16%" },
  { name: "Gemini", value: 18400, share: "10%" },
  { name: "Others", value: 18400, share: "10%" }
];

const chartColors = ["#5B3DFF", "#16C7E8", "#10B981", "#F59E0B", "#64748B"];

const trafficCostTrend = [
  { name: "Jan", requests: 148000, cost: 14200 },
  { name: "Feb", requests: 172000, cost: 15800 },
  { name: "Mar", requests: 189000, cost: 17400 },
  { name: "Apr", requests: 216000, cost: 20100 },
  { name: "May", requests: 238000, cost: 22600 },
  { name: "Jun", requests: 251000, cost: 23500 },
  { name: "Jul", requests: 206000, cost: 24000 }
];

const detailTabs: Array<{ id: DetailTab; label: string }> = [
  { id: "workspaces", label: "Published Workspaces" },
  { id: "trend", label: "Usage Trend" },
  { id: "audit", label: "Recent Audit" }
];

export default function DashboardOverviewPage() {
  const { showToast, addAudit } = useAppState();
  const [detailTab, setDetailTab] = useState<DetailTab>("workspaces");
  const [confirmation, setConfirmation] = useState<ConfirmationAction | null>(null);

  function refreshOverview() {
    showToast("Overview telemetry refreshed");
    addAudit("Overview telemetry refreshed", "Command Center", "Alert");
  }

  function simulateAction(label: string, target: string, auditType = "Alert") {
    showToast(`${label} simulated`);
    addAudit(`${label} simulated`, target, auditType);
  }

  function requestConfirmation(action: ConfirmationAction) {
    setConfirmation(action);
  }

  function confirmAction() {
    if (!confirmation) return;
    showToast(`${confirmation.title} applied`);
    addAudit(confirmation.title, confirmation.target, confirmation.auditType);
    setConfirmation(null);
  }

  function renderAction(label: string, target: string) {
    const common = "inline-flex min-h-7 items-center justify-center rounded-md px-2 text-[10px] font-semibold shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1";

    if (label === "Open Server") {
      return <Link href="/dashboard/targets" className={`${common} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</Link>;
    }
    if (label === "View Logs") {
      return <button type="button" onClick={() => simulateAction(label, target, "Agent")} className={`${common} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</button>;
    }
    if (label === "Review Capacity") {
      return <Link href="/dashboard/cost-capacity" className={`${common} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</Link>;
    }
    if (label === "Review Evidence") {
      return <Link href="/dashboard/compliance" className={`${common} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</Link>;
    }
    if (label === "Simulate Fix" || label === "Simulate Savings") {
      return <button type="button" onClick={() => simulateAction(label, target)} className={`${common} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</button>;
    }
    if (label === "Restart Agent") {
      return <button type="button" onClick={() => requestConfirmation({ title: "Restart Legal Sandbox agent", message: "Queue an allowlisted restart command for Legal Sandbox?", impact: "Legal workspace availability should return after the agent reconnects.", target: "Legal Sandbox", auditType: "Agent" })} className={`${common} bg-[var(--status-critical)] text-white hover:bg-rose-700`}>{label}</button>;
    }
    if (label === "Apply Routing Policy") {
      return <button type="button" onClick={() => requestConfirmation({ title: "Apply approved fallback routing", message: "Route critical GPT-5 work to Claude or Qwen Local?", impact: "Expected latency and provider concentration risk will decrease.", target: "GPT-5", auditType: "Routing" })} className={`${common} bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]`}>{label}</button>;
    }
    if (label === "Apply Cost Ladder") {
      return <button type="button" onClick={() => requestConfirmation({ title: "Apply Marketing cost ladder", message: "Route drafting and summarization to the approved lower-cost model first?", impact: "Projected savings are AED 18,000 per month.", target: "Marketing", auditType: "Routing" })} className={`${common} bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]`}>{label}</button>;
    }
    return <button type="button" onClick={() => requestConfirmation({ title: "Enable Finance human approval", message: "Require approval before Finance Analysis Agent performs external actions?", impact: "Evidence readiness improves and unapproved external actions are blocked.", target: "Finance Analysis Agent", auditType: "Permission" })} className={`${common} bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]`}>{label}</button>;
  }

  return (
    <Section>
      <Card className="overflow-hidden border-white/10 bg-[var(--surface-dark)] text-white shadow-[0_18px_45px_rgba(9,13,26,0.18)]">
        <div className="grid gap-px bg-white/10 md:grid-cols-4 xl:grid-cols-[230px_repeat(6,minmax(0,1fr))]">
          <div className="flex items-center justify-between gap-3 bg-[var(--surface-dark)] px-4 py-3 md:col-span-2 xl:col-span-1">
            <div>
              <p className="text-[10px] font-semibold uppercase text-cyan-200">AI Ops Status</p>
              <div className="mt-1 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--status-warning)]" /><h1 className="text-base font-semibold">Warning</h1></div>
            </div>
            <button type="button" onClick={refreshOverview} className="rounded-md p-2 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Refresh overview"><RefreshCw size={14} /></button>
          </div>
          <CommandMetric label="Infrastructure" value="3/4 online" tone="warning" />
          <CommandMetric label="Services" value="18/21 healthy" tone="warning" />
          <CommandMetric label="Active Issues" value="5" tone="critical" />
          <CommandMetric label="Immediate Actions" value="3" tone="warning" />
          <CommandMetric label="Projected Cost" value="AED 184,000" />
          <CommandMetric label="ISO Evidence Ready" value="72%" tone="warning" />
        </div>
      </Card>

      <div className="mt-3 grid gap-3 lg:grid-cols-2 xl:grid-cols-[0.88fr_1.15fr_1fr]">
        <ControlPanel
          title="Infrastructure Health"
          detail="Fleet state and capacity pressure."
          action={<div className="flex gap-2"><Link href="/dashboard/targets" className="text-[10px] font-semibold text-[var(--brand-primary)]">View Fleet</Link><Link href="/dashboard/targets" className="text-[10px] font-semibold text-[var(--status-critical)]">Open Critical</Link></div>}
        >
          <div className="divide-y divide-[var(--border-subtle)]">
            {infrastructure.map((item) => (
              <Link key={item.name} href={item.href} className="group flex min-h-[58px] items-center gap-3 px-3.5 py-2.5 transition hover:bg-[var(--surface-muted)]">
                <span className={`h-2 w-2 shrink-0 rounded-full ${item.status === "Healthy" ? "bg-[var(--status-healthy)]" : item.status === "Offline" ? "bg-[var(--status-critical)]" : "bg-[var(--status-warning)]"}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">{item.name}</span>
                  <span className="mt-0.5 flex gap-2 text-[10px] text-[var(--text-secondary)]"><span>{item.metric}</span><span>·</span><span className="truncate">{item.detail}</span></span>
                </span>
                <StatusBadge value={item.status} />
              </Link>
            ))}
          </div>
          <div className="flex gap-2 border-t border-[var(--border-subtle)] px-3.5 py-2.5">
            {renderAction("Open Server", "Fleet")}
            {renderAction("View Logs", "Legal Sandbox")}
          </div>
        </ControlPanel>

        <ControlPanel title="Immediate Issues" detail="Ordered by operational impact." badge="5 open">
          <div className="divide-y divide-[var(--border-subtle)]">
            {issues.map((issue) => (
              <div key={issue.title} className={`grid min-h-[58px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-l-2 px-3 py-2 transition hover:bg-[var(--surface-muted)] ${issue.severity === "Critical" ? "border-l-[var(--status-critical)]" : issue.severity === "Medium" ? "border-l-[var(--brand-primary)]" : "border-l-[var(--status-warning)]"}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5"><StatusBadge value={issue.severity} /><span className="truncate text-[10px] font-semibold uppercase text-[var(--text-secondary)]">{issue.area}</span></div>
                  <p className="mt-1 truncate text-xs font-semibold">{issue.title}</p>
                  <p className="mt-0.5 truncate text-[10px] text-[var(--text-secondary)]" title={`${issue.problem} ${issue.recommendation}`}>{issue.problem} {issue.recommendation}</p>
                </div>
                {renderAction(issue.action, issue.title)}
              </div>
            ))}
          </div>
        </ControlPanel>

        <ControlPanel title="Recommended Actions" detail="Changes with the highest expected impact." badge="3 urgent" className="lg:col-span-2 xl:col-span-1">
          <div className="divide-y divide-[var(--border-subtle)]">
            {recommendedActions.map((item, index) => (
              <div key={item.title} className="group grid min-h-[58px] grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2 transition hover:bg-[var(--surface-muted)]">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${item.tone === "Critical" ? "bg-[rgba(225,29,72,0.10)] text-[var(--status-critical)]" : item.tone === "Medium" ? "bg-[rgba(91,61,255,0.10)] text-[var(--brand-primary)]" : "bg-[rgba(245,158,11,0.12)] text-[var(--status-warning)]"}`}>{index + 1}</span>
                <div className="min-w-0"><p className="truncate text-xs font-semibold" title={item.title}>{item.title}</p><p className="mt-0.5 truncate text-[10px] text-[var(--text-secondary)]">{item.impact}</p></div>
                {renderAction(item.action, item.title)}
              </div>
            ))}
          </div>
        </ControlPanel>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((item) => <CompactKpi key={item.label} {...item} />)}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        <SupportingCard title="Cost by Model" detail="GPT-5 remains the main cost driver." href="/dashboard/cost-capacity">
          <div className="grid grid-cols-[96px_1fr] items-center gap-3">
            <div className="h-28"><DonutChart data={modelCosts} innerRadius={30} outerRadius={48} /></div>
            <div className="space-y-1.5">{modelCosts.slice(0, 4).map((item, index) => <div key={item.name} className="grid grid-cols-[1fr_auto] gap-2 text-[10px]"><span className="flex min-w-0 items-center gap-1.5"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: chartColors[index] }} /><span className="truncate">{item.name}</span></span><span className="font-semibold">{item.share}</span></div>)}</div>
          </div>
        </SupportingCard>

        <SupportingCard title="Workspace Activity" detail="Usage across published AI interfaces." href="/dashboard/workspaces">
          <div className="space-y-2">
            <ActivityRow name="Engineering Copilot" value="41.2k" change="+18%" />
            <ActivityRow name="Claims AI Assistant" value="38.1k" change="+11%" />
            <ActivityRow name="Legal AI Assistant" value="16.3k" change="-8%" warning />
          </div>
        </SupportingCard>

        <SupportingCard title="Provider Drift" detail="Traffic is routing to approved fallbacks." href="/dashboard/monitoring">
          <div className="space-y-2">
            <SignalRow label="OpenAI GPT-5" value="Degraded" status="Warning" />
            <SignalRow label="Claude fallback" value="Ready" status="Healthy" />
            <SignalRow label="Qwen Local" value="Safe route" status="Healthy" />
          </div>
        </SupportingCard>

        <SupportingCard title="Compliance Readiness" detail="ISO readiness support; not certification." href="/dashboard/compliance">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="Evidence ready" value="72%" status="Warning" />
            <MiniStat label="Policy coverage" value="24" status="Healthy" />
            <MiniStat label="Open gaps" value="5" status="Warning" />
            <MiniStat label="Audit coverage" value="100%" status="Healthy" />
          </div>
        </SupportingCard>
      </div>

      <Card className="mt-3 overflow-hidden">
        <div className="flex flex-col justify-between gap-2 border-b border-[var(--border-subtle)] px-4 py-3 lg:flex-row lg:items-center">
          <div><h2 className="text-sm font-semibold">Operational Detail</h2><p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">Lower-priority evidence and trends, available on demand.</p></div>
          <div role="tablist" aria-label="Overview detail sections" className="flex gap-1 rounded-md bg-[var(--surface-muted)] p-1">
            {detailTabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={detailTab === tab.id} onClick={() => setDetailTab(tab.id)} className={`min-h-8 rounded px-2.5 text-[11px] font-medium transition ${detailTab === tab.id ? "bg-white text-[var(--brand-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>{tab.label}</button>)}
          </div>
        </div>
        {detailTab === "workspaces" ? (
          <DataTable columns={["Workspace", "Team", "Interface", "Models", "Status", "Action"]} rows={workspaces.map((workspace) => [workspace.name, workspace.department, workspace.interface, workspace.allowedModels.join(", "), <StatusBadge key="status" value={workspace.publishStatus} />, <Link key="action" href="/dashboard/workspaces" className="font-semibold text-[var(--brand-primary)]">Launch</Link>])} />
        ) : null}
        {detailTab === "trend" ? (
          <div className="p-4"><div className="h-56"><TrafficCostChart data={trafficCostTrend} /></div></div>
        ) : null}
        {detailTab === "audit" ? (
          <DataTable columns={["Time", "Actor", "Event", "Target", "Status"]} rows={auditLogs.slice(0, 6).map((event) => [event.timestamp, event.actor, event.action, event.target, <StatusBadge key="status" value={event.status} />])} />
        ) : null}
      </Card>

      {confirmation ? (
        <Modal title={confirmation.title} onClose={() => setConfirmation(null)}>
          <div className="flex items-start gap-3 rounded-md bg-[rgba(245,158,11,0.08)] p-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--status-warning)]" />
            <div><p className="text-sm font-medium">{confirmation.message}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{confirmation.impact}</p></div>
          </div>
          <p className="mt-4 text-xs text-[var(--text-secondary)]">Simulated action only. No infrastructure or provider configuration is changed.</p>
          <div className="mt-5 flex justify-end gap-2"><ActionButton variant="secondary" onClick={() => setConfirmation(null)}>Cancel</ActionButton><ActionButton onClick={confirmAction}>Confirm simulated action</ActionButton></div>
        </Modal>
      ) : null}
    </Section>
  );
}

function CommandMetric({ label, value, tone }: { label: string; value: string; tone?: "warning" | "critical" }) {
  const valueClass = tone === "critical" ? "text-rose-300" : tone === "warning" ? "text-amber-300" : "text-white";
  return <div className="min-w-0 bg-[var(--surface-dark)] px-3 py-3"><p className="truncate text-[9px] uppercase text-slate-400">{label}</p><p className={`mt-1 truncate text-xs font-semibold ${valueClass}`} title={value}>{value}</p></div>;
}

function ControlPanel({ title, detail, children, action, badge, className = "" }: { title: string; detail: string; children: ReactNode; action?: ReactNode; badge?: string; className?: string }) {
  return (
    <Card className={`flex min-h-[360px] flex-col overflow-hidden ${className}`}>
      <div className="flex min-h-[55px] items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-3.5 py-2.5">
        <div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">{detail}</p></div>
        {action ?? (badge ? <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1 text-[9px] font-semibold text-[var(--text-secondary)]">{badge}</span> : null)}
      </div>
      <div className="flex-1">{children}</div>
    </Card>
  );
}

function CompactKpi({ label, value, status, detail, icon: Icon }: { label: string; value: string; status: string; detail: string; icon: typeof Server }) {
  const tone = status === "Healthy" ? "text-[var(--status-healthy)]" : "text-[var(--status-warning)]";
  return (
    <Card className="group relative overflow-hidden p-3 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_26px_rgba(17,24,39,0.09)]">
      <span className={`absolute inset-x-0 top-0 h-0.5 ${status === "Healthy" ? "bg-[var(--status-healthy)]" : "bg-[var(--status-warning)]"}`} />
      <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-[10px] text-[var(--text-secondary)]">{label}</p><p className="mt-1 truncate text-base font-semibold">{value}</p></div><span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--surface-muted)] text-[var(--brand-primary)]"><Icon size={14} /></span></div>
      <p className={`mt-1 truncate text-[10px] font-medium ${tone}`}>{detail}</p>
    </Card>
  );
}

function SupportingCard({ title, detail, href, children }: { title: string; detail: string; href: string; children: ReactNode }) {
  return (
    <Card className="flex min-h-48 flex-col p-4">
      <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-0.5 text-[10px] leading-4 text-[var(--text-secondary)]">{detail}</p></div><Link href={href} className="shrink-0 text-[var(--brand-primary)]"><ArrowRight size={14} /></Link></div>
      <div className="mt-3 flex-1">{children}</div>
    </Card>
  );
}

function ActivityRow({ name, value, change, warning }: { name: string; value: string; change: string; warning?: boolean }) {
  return <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-[10px]"><span className="truncate font-medium">{name}</span><span className="text-[var(--text-secondary)]">{value}</span><span className={warning ? "font-semibold text-[var(--status-warning)]" : "font-semibold text-[var(--status-healthy)]"}>{change}</span></div>;
}

function SignalRow({ label, value, status }: { label: string; value: string; status: string }) {
  return <div className="flex items-center justify-between gap-2 rounded-md border border-[var(--border-subtle)] px-2.5 py-2"><span className="truncate text-[10px] font-medium">{label}</span><span className="flex items-center gap-2 text-[10px]"><span>{value}</span><StatusBadge value={status} /></span></div>;
}

function MiniStat({ label, value, status }: { label: string; value: string; status: string }) {
  return <div className="rounded-md border border-[var(--border-subtle)] p-2.5"><div className="flex items-center justify-between gap-2"><p className="text-[9px] text-[var(--text-secondary)]">{label}</p><span className={`h-1.5 w-1.5 rounded-full ${status === "Healthy" ? "bg-[var(--status-healthy)]" : "bg-[var(--status-warning)]"}`} /></div><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}
