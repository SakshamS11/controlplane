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
  Lightbulb,
  RefreshCw,
  Server,
  Timer,
  WalletCards
} from "lucide-react";
import { useState } from "react";
import { DonutChart, TrafficCostChart } from "@/components/charts";
import { ActionButton, Card, DataTable, Modal, Section, StatusBadge, useAppState } from "@/components/ui";
import { auditLogs, providerHealth, workspaces } from "@/lib/mock-data";

type SupportingTab = "workspaces" | "analytics" | "providers" | "audit" | "compliance";
type ConfirmationAction = {
  title: string;
  message: string;
  impact: string;
  target: string;
  auditType: string;
};

const actionIssues = [
  {
    title: "Legal Sandbox Offline",
    severity: "Critical",
    type: "Agent / Infrastructure",
    problem: "Agent has not checked in for 42 minutes.",
    change: "Reconnect or restart the agent.",
    impact: "Restores Legal workspace availability.",
    actions: ["Open Server", "Restart Agent", "View Logs"]
  },
  {
    title: "Claims GPU Pressure",
    severity: "Warning",
    type: "Capacity",
    problem: "GPU is at 92%; VRAM is 22/24 GB.",
    change: "Add a Qwen replica or reclaim Finance GPU.",
    impact: "Reduces queue wait and missed SLA risk.",
    actions: ["Review Capacity", "Simulate Fix", "Open Server"]
  },
  {
    title: "OpenAI Provider Degraded",
    severity: "Warning",
    type: "Provider",
    problem: "GPT-5 latency is elevated.",
    change: "Route critical work to Claude or Qwen Local.",
    impact: "Improves latency and provider resilience.",
    actions: ["Apply Routing Policy", "View Providers"]
  },
  {
    title: "Marketing Overspend Risk",
    severity: "Warning",
    type: "Cost",
    problem: "Marketing is trending above budget.",
    change: "Route drafting to a cheaper model first.",
    impact: "Saves an estimated AED 18,000/month.",
    actions: ["Simulate Savings", "Apply Cost Ladder"]
  },
  {
    title: "ISO Readiness Gap",
    severity: "Medium",
    type: "Governance",
    problem: "Finance Analysis Agent lacks human approval.",
    change: "Require approval before external actions.",
    impact: "Improves evidence readiness.",
    actions: ["Review Evidence", "Enable Approval"]
  }
];

const infrastructure = [
  {
    name: "Acme Azure GPU Server",
    status: "Healthy",
    agent: "Agent online",
    metric: "GPU 71%",
    detail: "Services 6/6",
    action: "View"
  },
  {
    name: "Claims On-Prem Node",
    status: "Warning",
    agent: "Agent online",
    metric: "GPU 92%",
    detail: "VRAM 22/24 GB",
    action: "Review Capacity"
  },
  {
    name: "AWS Private AI Node",
    status: "Healthy",
    agent: "Agent online",
    metric: "GPU 54%",
    detail: "RAG Stack running",
    action: "View"
  },
  {
    name: "Legal Sandbox",
    status: "Offline",
    agent: "Agent offline",
    metric: "No stack",
    detail: "42 min since heartbeat",
    action: "Restart Agent"
  }
];

const kpis = [
  { label: "Servers", value: "3/4", status: "Warning", detail: "online", icon: Server },
  { label: "Services", value: "18/21", status: "Warning", detail: "healthy", icon: Boxes },
  { label: "GPU peak", value: "92%", status: "Warning", detail: "Claims node", icon: Cpu },
  { label: "Monthly requests", value: "128,420", status: "Healthy", detail: "+18%", icon: Activity },
  { label: "Avg latency", value: "812 ms", status: "Healthy", detail: "within limit", icon: Timer },
  { label: "Projected cost", value: "AED 184k", status: "Warning", detail: "month end", icon: WalletCards },
  { label: "Savings opportunity", value: "AED 42k", status: "Healthy", detail: "per month", icon: CircleDollarSign },
  { label: "Compliance gaps", value: "5", status: "Warning", detail: "evidence tasks", icon: FileCheck2 }
];

const recommendedChanges = [
  { change: "Reclaim unused Finance GPU capacity", area: "Finance / Claims", impact: "20% GPU returned" },
  { change: "Enable Marketing cost ladder", area: "Marketing", impact: "Save AED 18k/month" },
  { change: "Route sensitive Legal workflows locally", area: "Legal", impact: "Reduce sovereignty risk" },
  { change: "Restart Legal Sandbox agent", area: "Legal Sandbox", impact: "Restore workspace access" },
  { change: "Enable Support semantic cache", area: "Customer Support", impact: "Save AED 11.4k/month" }
];

const trafficCostTrend = [
  { name: "Jan", requests: 148000, cost: 14200 },
  { name: "Feb", requests: 172000, cost: 15800 },
  { name: "Mar", requests: 189000, cost: 17400 },
  { name: "Apr", requests: 216000, cost: 20100 },
  { name: "May", requests: 238000, cost: 22600 },
  { name: "Jun", requests: 251000, cost: 23500 },
  { name: "Jul", requests: 206000, cost: 24000 }
];

const modelCosts = [
  { name: "GPT-5", value: 73600, share: "40%" },
  { name: "Claude", value: 44160, share: "24%" },
  { name: "Qwen 32B Local", value: 29440, share: "16%" },
  { name: "Gemini", value: 18400, share: "10%" },
  { name: "Others", value: 18400, share: "10%" }
];

const chartColors = ["#5B3DFF", "#16C7E8", "#10B981", "#F59E0B", "#64748B"];

const supportingTabs: Array<{ id: SupportingTab; label: string }> = [
  { id: "workspaces", label: "Workspaces" },
  { id: "analytics", label: "Usage & Cost" },
  { id: "providers", label: "Provider Drift" },
  { id: "audit", label: "Recent Audit" },
  { id: "compliance", label: "Compliance" }
];

export default function DashboardOverviewPage() {
  const { showToast, addAudit } = useAppState();
  const [supportingTab, setSupportingTab] = useState<SupportingTab>("workspaces");
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

  function renderIssueAction(label: string, issue: (typeof actionIssues)[number]) {
    const commonClass = "inline-flex min-h-7 items-center justify-center rounded-md px-2 text-[10px] font-semibold transition";
    if (label === "Open Server") {
      return <Link key={label} href="/dashboard/targets" className={`${commonClass} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</Link>;
    }
    if (label === "Review Capacity") {
      return <Link key={label} href="/dashboard/cost-capacity" className={`${commonClass} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</Link>;
    }
    if (label === "View Providers") {
      return <Link key={label} href="/dashboard/models" className={`${commonClass} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</Link>;
    }
    if (label === "Review Evidence") {
      return <Link key={label} href="/dashboard/compliance" className={`${commonClass} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</Link>;
    }
    if (label === "Restart Agent") {
      return <button key={label} type="button" onClick={() => requestConfirmation({ title: "Restart Legal Sandbox agent", message: "Queue an allowlisted agent restart command for Legal Sandbox?", impact: "Legal workspace availability should return after the agent reconnects.", target: "Legal Sandbox", auditType: "Agent" })} className={`${commonClass} bg-[var(--status-critical)] text-white hover:bg-rose-700`}>{label}</button>;
    }
    if (label === "Apply Routing Policy") {
      return <button key={label} type="button" onClick={() => requestConfirmation({ title: "Apply approved fallback routing", message: "Route critical GPT-5 work to Claude or Qwen Local while OpenAI is degraded?", impact: "Expected latency and provider concentration risk will decrease.", target: "GPT-5 provider degradation", auditType: "Routing" })} className={`${commonClass} bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]`}>{label}</button>;
    }
    if (label === "Apply Cost Ladder") {
      return <button key={label} type="button" onClick={() => requestConfirmation({ title: "Apply Marketing cost ladder", message: "Route drafting and summarization to the approved lower-cost model first?", impact: "Projected savings are AED 18,000 per month.", target: "Marketing", auditType: "Routing" })} className={`${commonClass} bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]`}>{label}</button>;
    }
    if (label === "Enable Approval") {
      return <button key={label} type="button" onClick={() => requestConfirmation({ title: "Enable human approval", message: "Require human approval before Finance Analysis Agent performs external actions?", impact: "Evidence readiness improves and unapproved external actions are blocked.", target: "Finance Analysis Agent", auditType: "Permission" })} className={`${commonClass} bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]`}>{label}</button>;
    }
    return <button key={label} type="button" onClick={() => simulateAction(label, issue.title)} className={`${commonClass} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</button>;
  }

  return (
    <Section>
      <Card className="overflow-hidden bg-[var(--surface-dark)] text-white">
        <div className="grid gap-3 px-4 py-3.5 xl:grid-cols-[minmax(0,1.35fr)_minmax(520px,1fr)] xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase text-cyan-200">AI operations control room</span>
              <StatusBadge value="Warning" />
              <span className="text-xs text-slate-400">Updated 48 seconds ago</span>
            </div>
            <h1 className="mt-1.5 text-xl font-semibold">AI Ops Status: Warning</h1>
            <p className="mt-1 text-xs leading-5 text-slate-300">Claims GPU is above 90%, Legal Sandbox agent is offline, and Marketing is trending over budget.</p>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-white/10 sm:grid-cols-4">
            <DarkMetric label="Infrastructure" value="3/4 online" tone="warning" />
            <DarkMetric label="Active issues" value="5" tone="critical" />
            <DarkMetric label="Immediate actions" value="3" tone="warning" />
            <DarkMetric label="Projected cost" value="AED 184k" />
            <DarkMetric label="Savings" value="AED 42k" tone="healthy" />
            <DarkMetric label="Evidence ready" value="72%" tone="warning" />
            <div className="col-span-2 flex items-center justify-between bg-[var(--surface-dark)] px-3 py-2">
              <span className="text-[10px] text-slate-400">ISO/IEC 42001 readiness support</span>
              <button type="button" onClick={refreshOverview} className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-200 hover:text-white"><RefreshCw size={12} /> Refresh</button>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(390px,0.8fr)]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
            <div>
              <h2 className="text-sm font-semibold">Immediate Action Center</h2>
              <p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">Prioritized by operational and governance impact.</p>
            </div>
            <span className="text-xs font-semibold text-[var(--status-critical)]">5 open</span>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {actionIssues.map((issue) => (
              <div key={issue.title} className="grid gap-2 px-3 py-2.5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge value={issue.severity} />
                    <span className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">{issue.type}</span>
                    <h3 className="text-xs font-semibold">{issue.title}</h3>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-[var(--text-secondary)]" title={`${issue.problem} Change: ${issue.change}`}>{issue.problem} <span className="font-medium text-[var(--text-primary)]">Change:</span> {issue.change}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-[var(--brand-primary-dark)]">{issue.impact}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 lg:max-w-56 lg:justify-end">
                  {issue.actions.map((label) => renderIssueAction(label, issue))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
            <div>
              <h2 className="text-sm font-semibold">Infrastructure Status</h2>
              <p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">Fleet state and the next operator action.</p>
            </div>
            <Link href="/dashboard/targets" className="text-[10px] font-semibold text-[var(--brand-primary)]">Open fleet</Link>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {infrastructure.map((item) => (
              <div key={item.name} className="px-3 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-xs font-semibold">{item.name}</h3><StatusBadge value={item.status} /></div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--text-secondary)]">
                      <span>{item.agent}</span><span>{item.metric}</span><span>{item.detail}</span>
                    </div>
                  </div>
                  {item.action === "Restart Agent" ? (
                    <button type="button" onClick={() => requestConfirmation({ title: "Restart Legal Sandbox agent", message: "Queue an allowlisted agent restart command for Legal Sandbox?", impact: "Legal workspace availability should return after the agent reconnects.", target: "Legal Sandbox", auditType: "Agent" })} className="shrink-0 text-[10px] font-semibold text-[var(--status-critical)] hover:underline">{item.action}</button>
                  ) : (
                    <Link href={item.action === "Review Capacity" ? "/dashboard/cost-capacity" : "/dashboard/targets/acme"} className="shrink-0 text-[10px] font-semibold text-[var(--brand-primary)] hover:underline">{item.action}</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        {kpis.map((item) => <CompactKpi key={item.label} {...item} />)}
      </div>

      <Card className="mt-3 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
          <div><h2 className="text-sm font-semibold">Recommended Changes</h2><p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">Highest-value configuration changes for the current state.</p></div>
          <Link href="/dashboard/resource-planner" className="text-[10px] font-semibold text-[var(--brand-primary)]">Open planner</Link>
        </div>
        <div className="grid divide-y divide-[var(--border-subtle)] lg:grid-cols-5 lg:divide-x lg:divide-y-0">
          {recommendedChanges.map((item) => (
            <div key={item.change} className="flex min-h-28 flex-col px-3 py-3">
              <p className="text-xs font-semibold">{item.change}</p>
              <p className="mt-1 text-[10px] text-[var(--text-secondary)]">{item.area}</p>
              <p className="mt-1 text-[10px] font-medium text-[var(--status-healthy)]">{item.impact}</p>
              <button type="button" onClick={() => simulateAction("Review change", item.change)} className="mt-auto pt-2 text-left text-[10px] font-semibold text-[var(--brand-primary)]">Review</button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-3 overflow-hidden">
        <div className="flex flex-col justify-between gap-2 border-b border-[var(--border-subtle)] px-4 py-3 lg:flex-row lg:items-center">
          <div><h2 className="text-sm font-semibold">Supporting Intelligence</h2><p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">Open details when the immediate issues are under control.</p></div>
          <div role="tablist" aria-label="Overview supporting sections" className="flex max-w-full gap-1 overflow-x-auto rounded-md bg-[var(--surface-muted)] p-1">
            {supportingTabs.map((tab) => (
              <button key={tab.id} type="button" role="tab" aria-selected={supportingTab === tab.id} onClick={() => setSupportingTab(tab.id)} className={`min-h-8 shrink-0 rounded px-2.5 text-[11px] font-medium ${supportingTab === tab.id ? "bg-white text-[var(--brand-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>{tab.label}</button>
            ))}
          </div>
        </div>

        {supportingTab === "workspaces" ? (
          <div className="grid gap-0 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="overflow-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="bg-[var(--surface-muted)] text-[10px] uppercase text-[var(--text-secondary)]"><tr><th className="px-4 py-2.5">Workspace</th><th className="px-4 py-2.5">Team</th><th className="px-4 py-2.5">Interface</th><th className="px-4 py-2.5">Models</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Action</th></tr></thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {workspaces.map((workspace) => <tr key={workspace.name}><td className="px-4 py-3 font-semibold">{workspace.name}</td><td className="px-4 py-3">{workspace.department}</td><td className="px-4 py-3">{workspace.interface}</td><td className="max-w-56 truncate px-4 py-3">{workspace.allowedModels.join(", ")}</td><td className="px-4 py-3"><StatusBadge value={workspace.publishStatus} /></td><td className="px-4 py-3"><Link href="/dashboard/workspaces" className="font-semibold text-[var(--brand-primary)]">Launch</Link></td></tr>)}
                </tbody>
              </table>
            </div>
            <div className="border-t border-[var(--border-subtle)] p-4 xl:border-l xl:border-t-0">
              <h3 className="text-sm font-semibold">AI Workspace Activity</h3>
              <div className="mt-3 space-y-3">
                <WorkspaceActivity name="Engineering Copilot" requests="41.2k requests" change="+18%" />
                <WorkspaceActivity name="Claims AI Assistant" requests="38.1k requests" change="+11%" />
                <WorkspaceActivity name="Legal AI Assistant" requests="16.3k requests" change="-8%" warning />
              </div>
            </div>
          </div>
        ) : null}

        {supportingTab === "analytics" ? (
          <div className="grid gap-0 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="p-4">
              <div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold">Traffic & Cost Trend</h3><p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">Requests and spend across the selected period.</p></div><div className="flex gap-3 text-[10px] text-[var(--text-secondary)]"><LegendDot color="#5B3DFF" label="Requests" /><LegendDot color="#16C7E8" label="Cost" /></div></div>
              <div className="mt-2 h-52"><TrafficCostChart data={trafficCostTrend} /></div>
            </div>
            <div className="border-t border-[var(--border-subtle)] p-4 xl:border-l xl:border-t-0">
              <h3 className="text-sm font-semibold">Cost by Model</h3>
              <div className="mt-2 grid grid-cols-[120px_1fr] items-center gap-3">
                <div className="h-36"><DonutChart data={modelCosts} innerRadius={38} outerRadius={60} /></div>
                <div className="space-y-2">
                  {modelCosts.map((item, index) => <div key={item.name} className="grid grid-cols-[1fr_auto] gap-2 text-[10px]"><span className="flex min-w-0 items-center gap-1.5"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: chartColors[index] }} /><span className="truncate">{item.name}</span></span><span className="font-semibold">{item.share}</span></div>)}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {supportingTab === "providers" ? (
          <DataTable columns={["Provider", "Status", "Affected Models", "Observed Impact", "Recommended Action"]} rows={providerHealth.map((provider) => [provider.provider, <StatusBadge key="status" value={provider.status} />, provider.affectedModels.join(", "), provider.impact, provider.action])} />
        ) : null}

        {supportingTab === "audit" ? (
          <DataTable columns={["Time", "Actor", "Event", "Target", "Status"]} rows={auditLogs.slice(0, 6).map((event) => [event.timestamp, event.actor, event.action, event.target, <StatusBadge key="status" value={event.status} />])} />
        ) : null}

        {supportingTab === "compliance" ? (
          <div className="grid gap-3 p-4 md:grid-cols-4">
            <ComplianceStat label="Evidence readiness" value="72%" status="Warning" />
            <ComplianceStat label="Active policies" value="24" status="Healthy" />
            <ComplianceStat label="Evidence gaps" value="5" status="Warning" />
            <ComplianceStat label="Audit coverage" value="100%" status="Healthy" />
            <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 md:col-span-4">
              <p className="text-xs font-medium">ISO/IEC 42001 readiness support; not certification.</p>
              <p className="mt-1 text-[10px] text-[var(--text-secondary)]">Finance human approval is the highest-priority open evidence task.</p>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="mt-3 border-[rgba(91,61,255,0.24)] px-4 py-3">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[rgba(91,61,255,0.10)] text-[var(--brand-primary)]"><Lightbulb size={15} /></span>
            <div><div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Today&apos;s opportunity</div><p className="mt-0.5 text-sm font-medium">Move 18% of drafting traffic to Gemini or local models to save AED 18K/month.</p><p className="mt-0.5 text-xs text-[var(--text-secondary)]">Your AI spend becomes an owned AI asset over time.</p></div>
          </div>
          <Link href="/dashboard/resource-planner" className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md bg-[var(--brand-primary)] px-3 text-xs font-semibold text-white hover:bg-[var(--brand-primary-dark)]">Run resource planner <ArrowRight size={13} /></Link>
        </div>
      </Card>

      {confirmation ? (
        <Modal title={confirmation.title} onClose={() => setConfirmation(null)}>
          <div className="flex items-start gap-3 rounded-md bg-[rgba(245,158,11,0.08)] p-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--status-warning)]" />
            <div><p className="text-sm font-medium">{confirmation.message}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{confirmation.impact}</p></div>
          </div>
          <p className="mt-4 text-xs text-[var(--text-secondary)]">Simulated action only. No infrastructure or provider configuration is changed.</p>
          <div className="mt-5 flex justify-end gap-2">
            <ActionButton variant="secondary" onClick={() => setConfirmation(null)}>Cancel</ActionButton>
            <ActionButton onClick={confirmAction}>Confirm simulated action</ActionButton>
          </div>
        </Modal>
      ) : null}
    </Section>
  );
}

function DarkMetric({ label, value, tone }: { label: string; value: string; tone?: "healthy" | "warning" | "critical" }) {
  const color = tone === "healthy" ? "text-emerald-300" : tone === "warning" ? "text-amber-300" : tone === "critical" ? "text-rose-300" : "text-white";
  return <div className="bg-[var(--surface-dark)] px-3 py-2"><p className="text-[10px] text-slate-400">{label}</p><p className={`mt-0.5 text-sm font-semibold ${color}`}>{value}</p></div>;
}

function CompactKpi({ label, value, status, detail, icon: Icon }: {
  label: string;
  value: string;
  status: string;
  detail: string;
  icon: typeof Server;
}) {
  const tone = status === "Healthy" ? "text-[var(--status-healthy)]" : status === "Critical" ? "text-[var(--status-critical)]" : "text-[var(--status-warning)]";
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div><p className="text-[10px] text-[var(--text-secondary)]">{label}</p><p className="mt-1 whitespace-nowrap text-base font-semibold">{value}</p></div>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--surface-muted)] text-[var(--brand-primary)]"><Icon size={14} /></span>
      </div>
      <p className={`mt-1 text-[10px] font-medium ${tone}`}>{detail}</p>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{label}</span>;
}

function WorkspaceActivity({ name, requests, change, warning }: { name: string; requests: string; change: string; warning?: boolean }) {
  return <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--border-subtle)] p-3"><div className="min-w-0"><p className="truncate text-xs font-semibold">{name}</p><p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">{requests}</p></div><span className={`text-xs font-semibold ${warning ? "text-[var(--status-warning)]" : "text-[var(--status-healthy)]"}`}>{change}</span></div>;
}

function ComplianceStat({ label, value, status }: { label: string; value: string; status: string }) {
  return <div className="rounded-md border border-[var(--border-subtle)] p-3"><div className="flex items-center justify-between gap-2"><p className="text-[10px] text-[var(--text-secondary)]">{label}</p><StatusBadge value={status} /></div><p className="mt-2 text-xl font-semibold">{value}</p></div>;
}
