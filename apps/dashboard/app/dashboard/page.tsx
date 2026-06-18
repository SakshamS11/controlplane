"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Boxes,
  CircleDollarSign,
  Cpu,
  FileCheck2,
  RefreshCw,
  Send,
  Server,
  ShieldCheck,
  WalletCards
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { BarMetricChart } from "@/components/charts";
import { ActionButton, Card, DataTable, Modal, Section, StatusBadge, useAppState } from "@/components/ui";
import { auditLogs } from "@/lib/mock-data";

type DetailTab = "infrastructure" | "actions" | "teams" | "audit";
type ConfirmationAction = {
  title: string;
  message: string;
  impact: string;
  target: string;
  auditType: string;
};
type Reminder = {
  team: string;
  owner: string;
  reason: string;
  message: string;
};

const healthCards = [
  { label: "AI Ops Status", value: "Warning", context: "3 issues need action", status: "Warning", icon: Activity },
  { label: "Infrastructure", value: "3/4 online", context: "Legal Sandbox offline", status: "Warning", icon: Server },
  { label: "Services", value: "18/21 healthy", context: "3 services degraded", status: "Warning", icon: Boxes },
  { label: "Agents", value: "1 offline", context: "Legal Sandbox agent", status: "Critical", icon: Bot },
  { label: "Cost", value: "AED 184,000", context: "Projected monthly spend", status: "Cost risk", icon: WalletCards },
  { label: "ISO Evidence", value: "72%", context: "Readiness support only", status: "In progress", icon: FileCheck2 },
  { label: "Capacity", value: "92% GPU peak", context: "Claims node pressure", status: "Warning", icon: Cpu }
];

const alerts = [
  {
    title: "Legal Sandbox Offline",
    severity: "Critical",
    area: "Legal Sandbox",
    problem: "Agent offline for 42 minutes.",
    impact: "Legal workspace remains unavailable.",
    owner: "Platform Team",
    status: "Unassigned",
    actions: ["Restart Agent", "View Logs"]
  },
  {
    title: "Claims GPU Pressure",
    severity: "Warning",
    area: "Claims On-Prem Node",
    problem: "GPU 92%, VRAM 22/24 GB.",
    impact: "Queue wait may exceed SLA within 2 hours.",
    owner: "Platform Team",
    status: "Ready to simulate",
    actions: ["Review Capacity", "Simulate Fix", "Open Server"]
  },
  {
    title: "OpenAI Provider Degraded",
    severity: "Warning",
    area: "GPT-5 routing",
    problem: "GPT-5 latency is elevated.",
    impact: "Critical workflows may see higher latency.",
    owner: "AI Platform Owner",
    status: "Fallback ready",
    actions: ["Request Routing Approval", "View Providers"]
  },
  {
    title: "Marketing Overspend Risk",
    severity: "Warning",
    area: "Marketing",
    problem: "AI spend is projected above budget.",
    impact: "Budget may exceed its limit by AED 18,000.",
    owner: "Marketing Ops",
    status: "In review",
    actions: ["Simulate Savings", "Request Cost Approval", "Notify Team Owner"]
  },
  {
    title: "Finance Agent Approval Gap",
    severity: "Medium",
    area: "Finance Analysis Agent",
    problem: "Human approval rule is missing.",
    impact: "ISO evidence readiness remains incomplete.",
    owner: "Governance Lead",
    status: "Needs review",
    actions: ["Review Evidence", "Enable Approval"]
  }
];

const infrastructure = [
  ["Acme Azure GPU Server", "Healthy", "Agent online", "GPU 71%"],
  ["Claims On-Prem Node", "Warning", "GPU 92%", "VRAM 22/24 GB"],
  ["AWS Private AI Node", "Healthy", "RAG Stack running", "GPU 54%"],
  ["Legal Sandbox", "Offline", "Agent offline", "Heartbeat 42 min ago"]
];

const actionRows = [
  ["Restart Legal Sandbox agent", "Restores Legal workspace availability", "Restart Agent"],
  ["Reclaim Finance GPU capacity", "Reduces Claims queue pressure without new infrastructure", "Review Capacity"],
  ["Request GPT-5 fallback approval", "Improves latency during provider degradation", "Request Routing Approval"],
  ["Review Marketing cost ladder", "Saves projected AED 18,000/month", "Request Cost Approval"],
  ["Enable Finance human approval", "Improves governance evidence readiness", "Enable Approval"]
];

const teams = [
  {
    team: "Marketing",
    owner: "Marketing Ops",
    issue: "Projected 27% above AI budget",
    cause: "GPT-5 used for low-risk drafting",
    primary: "Request Cost Approval",
    message: "Marketing AI usage is projected to exceed the monthly budget by 27%. Please review high-cost GPT-5 drafting usage or approve the recommended cost ladder."
  },
  {
    team: "Engineering",
    owner: "Engineering Platform Lead",
    issue: "1.8M tokens above monthly plan",
    cause: "Code assistant usage spike",
    primary: "Review Model Access",
    message: "Engineering AI usage is 1.8M tokens above plan. Please review the current code-assistant model mix and high-volume workflows."
  },
  {
    team: "Finance",
    owner: "Finance Operations",
    issue: "Reserved GPU capacity underused",
    cause: "30% allocation, 8% utilization",
    primary: "Reclaim Capacity",
    message: "Finance is using 8% of its 30% reserved GPU allocation. Please review whether 20% can be returned to the shared capacity pool."
  },
  {
    team: "Legal",
    owner: "Legal Operations",
    issue: "Confidential traffic touched external provider",
    cause: "Local-only routing policy gap",
    primary: "Enforce Local-Only",
    message: "A confidential Legal workflow touched an external provider. Please review the local-only routing policy and approve the recommended restriction."
  }
];

const workspaceActivity = [
  { name: "Claims AI", requests: 38120 },
  { name: "Eng Copilot", requests: 41200 },
  { name: "Legal AI", requests: 16300 },
  { name: "Support", requests: 28700 },
  { name: "Marketing", requests: 22100 }
];

const detailTabs: Array<{ id: DetailTab; label: string }> = [
  { id: "infrastructure", label: "Infrastructure" },
  { id: "actions", label: "Recommended Actions" },
  { id: "teams", label: "Teams Needing Attention" },
  { id: "audit", label: "Recent Audit" }
];

const queuePreviews = [
  {
    title: "Recommendations",
    value: "8 open",
    detail: "Capacity, cost, routing, governance, cache, and evidence actions.",
    href: "/dashboard/recommendations",
    action: "Open action queue",
    status: "Warning"
  },
  {
    title: "Incidents",
    value: "5 active",
    detail: "Legal Sandbox offline is the highest-priority response item.",
    href: "/dashboard/incidents",
    action: "Review response",
    status: "Critical"
  },
  {
    title: "Approval Inbox",
    value: "6 pending",
    detail: "Production route, workspace, budget, and agent decisions await review.",
    href: "/dashboard/approval-inbox",
    action: "Review pending",
    status: "Warning"
  }
];

export default function DashboardOverviewPage() {
  const { showToast, addAudit } = useAppState();
  const [detailTab, setDetailTab] = useState<DetailTab>("infrastructure");
  const [confirmation, setConfirmation] = useState<ConfirmationAction | null>(null);
  const [reminder, setReminder] = useState<Reminder | null>(null);

  function simulateAction(label: string, target: string, auditType = "Alert") {
    showToast(`${label} simulated`);
    addAudit(`${label} simulated`, target, auditType);
  }

  function confirmAction() {
    if (!confirmation) return;
    showToast(`${confirmation.title} confirmed in simulation`);
    addAudit(confirmation.title, confirmation.target, confirmation.auditType);
    setConfirmation(null);
  }

  function sendReminder() {
    if (!reminder) return;
    showToast(`Simulated reminder sent to ${reminder.team} owner.`);
    addAudit("Usage reminder sent", reminder.team, "Permission");
    setReminder(null);
  }

  function openReminder(team = teams[0]) {
    setReminder({ team: team.team, owner: team.owner, reason: team.issue, message: team.message });
  }

  function renderAction(label: string, target: string) {
    const common = "inline-flex min-h-7 items-center justify-center rounded-md px-2 text-[10px] font-semibold shadow-sm transition hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1";

    if (label === "Open Server") return <Link href="/dashboard/targets" className={`${common} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</Link>;
    if (label === "Review Capacity" || label === "Reclaim Capacity") return <Link href="/dashboard/recommendations" className={`${common} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</Link>;
    if (label === "View Providers" || label === "Review Model Access") return <Link href="/dashboard/models" className={`${common} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</Link>;
    if (label === "Review Evidence") return <Link href="/dashboard/compliance" className={`${common} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</Link>;
    if (label === "Simulate Fix" || label === "Simulate Savings" || label === "Enforce Local-Only") return <Link href="/dashboard/recommendations" className={`${common} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</Link>;
    if (label === "View Logs") return <button type="button" onClick={() => simulateAction(label, target)} className={`${common} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}>{label}</button>;
    if (label === "Notify Team Owner") return <button type="button" onClick={() => openReminder(teams.find((team) => team.team === target) ?? teams[0])} className={`${common} border border-[var(--border-subtle)] bg-white hover:bg-[var(--surface-muted)]`}><Send size={11} /> {label}</button>;
    if (label === "Restart Agent") return <button type="button" onClick={() => setConfirmation({ title: "Restart Legal Sandbox agent", message: "Queue an allowlisted restart command for Legal Sandbox?", impact: "Legal workspace availability should return after the agent reconnects.", target: "Legal Sandbox", auditType: "Agent" })} className={`${common} bg-[var(--status-critical)] text-white hover:bg-rose-700`}>{label}</button>;
    if (label === "Request Routing Approval") return <button type="button" onClick={() => setConfirmation({ title: "Request fallback routing approval", message: "Send GPT-5 fallback routing to Approval Inbox?", impact: "Approval reviewers see the exact route change before any real policy execution.", target: "GPT-5", auditType: "Permission" })} className={`${common} bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]`}>{label}</button>;
    if (label === "Request Cost Approval") return <button type="button" onClick={() => setConfirmation({ title: "Request Marketing cost ladder approval", message: "Send the Marketing cost ladder to Approval Inbox?", impact: "Approval reviewers see the proposed ladder before any real routing or budget enforcement.", target: "Marketing", auditType: "Permission" })} className={`${common} bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]`}>{label}</button>;
    return <button type="button" onClick={() => setConfirmation({ title: "Enable Finance human approval", message: "Require approval before Finance Analysis Agent performs external actions?", impact: "Evidence readiness improves and unapproved external actions are blocked.", target: "Finance Analysis Agent", auditType: "Permission" })} className={`${common} bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]`}>{label}</button>;
  }

  return (
    <Section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Command Center</p>
          <h1 className="mt-1 text-xl font-semibold">AI Estate Health</h1>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Current infrastructure, cost, capacity, and governance posture.</p>
        </div>
        <button type="button" onClick={() => simulateAction("Health telemetry refreshed", "Overview")} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-white px-3 text-xs font-semibold shadow-sm hover:bg-[var(--surface-muted)]"><RefreshCw size={13} /> Refresh</button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {healthCards.map((item) => <HealthCard key={item.label} {...item} />)}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {queuePreviews.map((item) => (
          <Card key={item.title} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{item.title}</h2>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              </div>
              <StatusBadge value={item.status} />
            </div>
            <p className="mt-2 min-h-10 text-xs leading-5 text-[var(--text-secondary)]">{item.detail}</p>
            <Link href={item.href} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] hover:underline">
              {item.action} <ArrowRight size={12} />
            </Link>
          </Card>
        ))}
      </div>

      <Card className="mt-3 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
          <div><h2 className="text-sm font-semibold">Immediate Attention Preview</h2><p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">Top signals only. Response lives in Incidents; recommendations live in Recommendations.</p></div>
          <div className="flex gap-3">
            <Link href="/dashboard/recommendations" className="text-[10px] font-semibold text-[var(--brand-primary)]">Open Recommendations</Link>
            <Link href="/dashboard/incidents" className="text-[10px] font-semibold text-[var(--brand-primary)]">Open Incidents</Link>
          </div>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.title} className={`grid gap-2 border-l-2 px-3.5 py-2.5 transition hover:bg-[var(--surface-muted)] xl:grid-cols-[190px_minmax(0,1fr)_210px_auto] xl:items-center ${alert.severity === "Critical" ? "border-l-[var(--status-critical)]" : alert.severity === "Medium" ? "border-l-[var(--brand-primary)]" : "border-l-[var(--status-warning)]"}`}>
              <div className="min-w-0"><div className="flex items-center gap-1.5"><StatusBadge value={alert.severity} /><span className="truncate text-[9px] font-semibold uppercase text-[var(--text-secondary)]">{alert.area}</span></div><h3 className="mt-1 truncate text-xs font-semibold">{alert.title}</h3></div>
              <div className="min-w-0"><p className="truncate text-[11px] text-[var(--text-primary)]">{alert.problem}</p><p className="mt-0.5 truncate text-[10px] text-[var(--status-critical)]"><span className="font-semibold">If ignored:</span> {alert.impact}</p></div>
              <div className="flex items-center gap-2 text-[10px]"><span className="truncate text-[var(--text-secondary)]">{alert.owner}</span><span className="rounded-full bg-[var(--surface-muted)] px-2 py-1 font-medium">{alert.status}</span></div>
              <div className="flex flex-wrap gap-1.5 xl:max-w-64 xl:justify-end">{alert.actions.map((action) => <span key={action}>{renderAction(action, alert.area)}</span>)}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden">
          <div className="flex flex-col justify-between gap-2 border-b border-[var(--border-subtle)] px-4 py-3 lg:flex-row lg:items-center">
            <div><h2 className="text-sm font-semibold">Operational Details</h2><p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">Inspect infrastructure, actions, teams, or audit evidence.</p></div>
            <div role="tablist" aria-label="Overview detail sections" className="flex max-w-full gap-1 overflow-x-auto rounded-md bg-[var(--surface-muted)] p-1">
              {detailTabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={detailTab === tab.id} onClick={() => setDetailTab(tab.id)} className={`min-h-8 shrink-0 rounded px-2.5 text-[10px] font-medium transition ${detailTab === tab.id ? "bg-white text-[var(--brand-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>{tab.label}</button>)}
            </div>
          </div>
          {detailTab === "infrastructure" ? (
            <div>
              {infrastructure.map((row) => <div key={row[0]} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3 text-xs last:border-b-0"><span className="font-semibold">{row[0]}</span><StatusBadge value={row[1]} /><span className="text-[var(--text-secondary)]">{row[2]}</span><span className="font-medium">{row[3]}</span></div>)}
              <div className="flex gap-2 border-t border-[var(--border-subtle)] px-4 py-3"><Link href="/dashboard/targets" className="text-xs font-semibold text-[var(--brand-primary)]">View Fleet</Link><Link href="/dashboard/targets" className="text-xs font-semibold text-[var(--status-critical)]">Open Critical</Link></div>
            </div>
          ) : null}
          {detailTab === "actions" ? <div className="divide-y divide-[var(--border-subtle)]">{actionRows.map((row) => <div key={row[0]} className="grid gap-2 px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"><div><p className="text-xs font-semibold">{row[0]}</p><p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">{row[1]}</p></div>{renderAction(row[2], row[0])}</div>)}</div> : null}
          {detailTab === "teams" ? <TeamsTable onNotify={openReminder} /> : null}
          {detailTab === "audit" ? <DataTable columns={["Time", "Actor", "Event", "Target", "Status"]} rows={auditLogs.slice(0, 6).map((event) => [event.timestamp, event.actor, event.action, event.target, <StatusBadge key="status" value={event.status} />])} /> : null}
        </Card>

        <div className="grid gap-3">
          <Card className="p-4">
            <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-semibold">Workspace Activity</h2><p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">Monthly requests by governed workspace.</p></div><Link href="/dashboard/workspaces" className="text-[var(--brand-primary)]"><ArrowRight size={14} /></Link></div>
            <div className="mt-2 h-44"><BarMetricChart data={workspaceActivity} dataKey="requests" /></div>
          </Card>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <CostSnapshot />
            <Card className="p-4">
              <div className="flex items-start justify-between gap-2"><div><h2 className="text-sm font-semibold">Provider & Governance</h2><p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">External health and evidence posture.</p></div><ShieldCheck size={16} className="text-[var(--brand-primary)]" /></div>
              <div className="mt-3 space-y-2"><Signal label="OpenAI GPT-5" value="Degraded" status="Warning" /><Signal label="Claude fallback" value="Ready" status="Healthy" /><Signal label="ISO evidence ready" value="72%" status="Warning" /></div>
            </Card>
          </div>
        </div>
      </div>

      <Card className="mt-3 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3"><div><h2 className="text-sm font-semibold">Teams Needing Attention</h2><p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">Notify the team owner before applying limits.</p></div><button type="button" onClick={() => openReminder()} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-white px-2.5 text-[10px] font-semibold hover:bg-[var(--surface-muted)]"><Send size={11} /> Notify Team Owner</button></div>
        <TeamsTable onNotify={openReminder} />
      </Card>

      {confirmation ? <ConfirmationModal confirmation={confirmation} onClose={() => setConfirmation(null)} onConfirm={confirmAction} /> : null}
      {reminder ? (
        <Modal title="Send usage reminder" onClose={() => setReminder(null)}>
          <div className="grid gap-3 sm:grid-cols-2"><ReadOnlyField label="Team" value={reminder.team} /><ReadOnlyField label="Owner" value={reminder.owner} /></div>
          <ReadOnlyField label="Reason" value={reminder.reason} className="mt-3" />
          <label className="mt-3 block text-sm font-medium">Suggested message<textarea value={reminder.message} onChange={(event) => setReminder({ ...reminder, message: event.target.value })} className="mt-2 min-h-28 w-full rounded-md border border-[var(--border-subtle)] p-3 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" /></label>
          <p className="mt-3 text-xs text-[var(--text-secondary)]">Simulated action only. No email is sent.</p>
          <div className="mt-5 flex justify-end gap-2"><ActionButton variant="secondary" onClick={() => setReminder(null)}>Cancel</ActionButton><ActionButton onClick={sendReminder}><Send size={14} /> Send simulated reminder</ActionButton></div>
        </Modal>
      ) : null}
    </Section>
  );
}

function HealthCard({ label, value, context, status, icon: Icon }: { label: string; value: string; context: string; status: string; icon: typeof Activity }) {
  return <Card className="group relative overflow-hidden p-3.5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_26px_rgba(17,24,39,0.09)]"><span className={`absolute inset-x-0 top-0 h-0.5 ${status === "Critical" ? "bg-[var(--status-critical)]" : status === "Warning" || status === "Cost risk" ? "bg-[var(--status-warning)]" : "bg-[var(--brand-primary)]"}`} /><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-[10px] text-[var(--text-secondary)]">{label}</p><p className="mt-1 truncate text-base font-semibold">{value}</p></div><span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--surface-muted)] text-[var(--brand-primary)]"><Icon size={14} /></span></div><div className="mt-2 flex items-center justify-between gap-2"><p className="truncate text-[10px] text-[var(--text-secondary)]">{context}</p><StatusBadge value={status} /></div></Card>;
}

function TeamsTable({ onNotify }: { onNotify: (team: (typeof teams)[number]) => void }) {
  return <div className="overflow-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-[var(--surface-muted)] text-[10px] uppercase text-[var(--text-secondary)]"><tr><th className="px-4 py-2.5">Team</th><th className="px-4 py-2.5">Issue</th><th className="px-4 py-2.5">Cause</th><th className="px-4 py-2.5">Action</th></tr></thead><tbody className="divide-y divide-[var(--border-subtle)]">{teams.map((team) => <tr key={team.team} className="hover:bg-[var(--surface-muted)]"><td className="px-4 py-3 font-semibold">{team.team}</td><td className="px-4 py-3">{team.issue}</td><td className="px-4 py-3 text-[var(--text-secondary)]">{team.cause}</td><td className="px-4 py-3"><div className="flex gap-2"><button type="button" onClick={() => onNotify(team)} className="inline-flex min-h-7 items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-white px-2 text-[10px] font-semibold hover:bg-[var(--surface-muted)]"><Send size={11} /> Notify Owner</button><Link href={team.primary.includes("Cost") ? "/dashboard/routing-policies" : team.primary.includes("Model") ? "/dashboard/models" : "/dashboard/resource-planner"} className="inline-flex min-h-7 items-center rounded-md bg-[var(--brand-primary)] px-2 text-[10px] font-semibold text-white">{team.primary}</Link></div></td></tr>)}</tbody></table></div>;
}

function CostSnapshot() {
  return <Card className="p-4"><div className="flex items-start justify-between gap-2"><div><h2 className="text-sm font-semibold">Cost Snapshot</h2><p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">Current forecast and saving opportunity.</p></div><CircleDollarSign size={16} className="text-[var(--brand-primary)]" /></div><div className="mt-3 grid grid-cols-2 gap-2"><MiniStat label="Projected cost" value="AED 184k" /><MiniStat label="Budget remaining" value="AED 46k" /><MiniStat label="Savings" value="AED 42k" healthy /><MiniStat label="Teams over budget" value="2" warning /></div><p className="mt-3 text-[10px] text-[var(--text-secondary)]"><span className="font-semibold text-[var(--text-primary)]">Highest driver:</span> GPT-5 drafting</p><Link href="/dashboard/recommendations" className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--brand-primary)]">Open cost recommendations <ArrowRight size={11} /></Link></Card>;
}

function MiniStat({ label, value, healthy, warning }: { label: string; value: string; healthy?: boolean; warning?: boolean }) {
  return <div className="rounded-md border border-[var(--border-subtle)] p-2.5"><p className="text-[9px] text-[var(--text-secondary)]">{label}</p><p className={`mt-1 text-sm font-semibold ${healthy ? "text-[var(--status-healthy)]" : warning ? "text-[var(--status-warning)]" : ""}`}>{value}</p></div>;
}

function Signal({ label, value, status }: { label: string; value: string; status: string }) {
  return <div className="flex items-center justify-between gap-2 rounded-md border border-[var(--border-subtle)] px-2.5 py-2"><span className="truncate text-[10px] font-medium">{label}</span><span className="flex items-center gap-2 text-[10px]"><span>{value}</span><StatusBadge value={status} /></span></div>;
}

function ReadOnlyField({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return <div className={className}><p className="text-xs font-medium text-[var(--text-secondary)]">{label}</p><div className="mt-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm">{value}</div></div>;
}

function ConfirmationModal({ confirmation, onClose, onConfirm }: { confirmation: ConfirmationAction; onClose: () => void; onConfirm: () => void }) {
  return <Modal title={confirmation.title} onClose={onClose}><div className="flex items-start gap-3 rounded-md bg-[rgba(245,158,11,0.08)] p-3"><AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--status-warning)]" /><div><p className="text-sm font-medium">{confirmation.message}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{confirmation.impact}</p></div></div><p className="mt-4 text-xs text-[var(--text-secondary)]">Simulated action only. No infrastructure or provider configuration is changed.</p><div className="mt-5 flex justify-end gap-2"><ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton><ActionButton onClick={onConfirm}>Confirm simulated action</ActionButton></div></Modal>;
}
