"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCheck2,
  Gauge,
  PiggyBank,
  Route,
  Server,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react";
import { AreaMetricChart, BarMetricChart, DonutChart } from "@/components/charts";
import { ActionButton, Card, ChartCard, DataTable, Modal, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { costByModel, providerHealth, requestsByDepartment, requestVolume, targets, workspaces } from "@/lib/mock-data";

const overviewKpis = [
  {
    title: "Infrastructure Health",
    value: "3/4 servers online",
    details: ["18/21 services healthy", "2 open alerts"],
    icon: <Server size={18} />,
    status: "Warning",
    href: "/dashboard/targets"
  },
  {
    title: "AI Usage",
    value: "128,420 monthly requests",
    details: ["5 active workspaces", "Claims is top usage driver"],
    icon: <Gauge size={18} />,
    status: "Healthy",
    href: "/dashboard/monitoring"
  },
  {
    title: "Cost & Capacity",
    value: "AED 184,000 projected",
    details: ["AED 42,000 savings opportunity", "2 teams over budget"],
    icon: <WalletCards size={18} />,
    status: "Cost risk",
    href: "/dashboard/cost-capacity"
  },
  {
    title: "Governance & Sovereignty",
    value: "24 active policies",
    details: ["1 governance risk", "6 restricted knowledge bases"],
    icon: <ShieldCheck size={18} />,
    status: "Governance risk",
    href: "/dashboard/compliance"
  },
  {
    title: "Compounding Asset",
    value: "61% graduable to local",
    details: ["AED 420,000 projected annual savings", "Support traffic can become owned capacity"],
    icon: <PiggyBank size={18} />,
    status: "Opportunity",
    href: "/dashboard/resource-planner"
  }
];

const recommendedActions = [
  {
    title: "Claims under-allocated",
    severity: "Warning",
    team: "Claims AI Assistant",
    evidence: "GPU peak is 92% and queue wait is rising during claims review windows.",
    recommendation: "Increase Qwen Local capacity by 25% or add one local serving replica.",
    impact: "Lower queue wait and reduce missed SLA risk for Claims.",
    href: "/dashboard/resource-planner"
  },
  {
    title: "Marketing over-spending",
    severity: "Cost risk",
    team: "Marketing workspace",
    evidence: "Drafting and summarization traffic is trending above GPT-5 budget.",
    recommendation: "Route low-sensitivity drafting to a cheaper model with GPT-5 fallback.",
    impact: "Projected savings: AED 18,000/month.",
    href: "/dashboard/routing-policies"
  },
  {
    title: "Legal sovereignty risk",
    severity: "Governance risk",
    team: "Legal AI Assistant",
    evidence: "Confidential contract workflows are touching an external Claude route.",
    recommendation: "Enforce local-only routing for confidential knowledge bases.",
    impact: "Reduces data sovereignty exposure for Legal.",
    href: "/dashboard/routing-policies"
  },
  {
    title: "Support cache opportunity",
    severity: "Healthy",
    team: "Customer Support",
    evidence: "Repeated queries represent a large share of support traffic.",
    recommendation: "Enable permission-aware semantic cache for approved support answers.",
    impact: "Projected savings: AED 11,400/month.",
    href: "/dashboard/resource-planner"
  }
];

const workspaceActivity = [
  { workspace: "Claims AI Assistant", requests: "42,800", cost: "AED 46,200", risk: "Under-allocated", action: "Review capacity" },
  { workspace: "Engineering Copilot", requests: "31,900", cost: "AED 58,400", risk: "Healthy", action: "Monitor" },
  { workspace: "Legal AI Assistant", requests: "18,700", cost: "AED 29,100", risk: "Governance risk", action: "Enforce local-only" },
  { workspace: "Marketing Studio", requests: "14,600", cost: "AED 31,500", risk: "Cost risk", action: "Route cheaper" }
];

const complianceSignals = [
  ["Policy coverage", "24 active policies", "Healthy"],
  ["Restricted knowledge", "6 knowledge bases", "Healthy"],
  ["Sovereignty exceptions", "1 open item", "Governance risk"],
  ["Audit capture", "100% admin actions", "Healthy"]
];

function MissionKpiCard({ item }: { item: (typeof overviewKpis)[number] }) {
  return (
    <Link href={item.href} className="group block rounded-lg border border-[var(--border-subtle)] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(91,61,255,0.28)]">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-[rgba(22,199,232,0.12)] text-[var(--brand-accent)]">{item.icon}</div>
        <StatusBadge value={item.status} />
      </div>
      <div className="mt-4 text-sm font-semibold text-[var(--text-secondary)]">{item.title}</div>
      <div className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-primary)]">{item.value}</div>
      <div className="mt-3 space-y-1 text-sm text-[var(--text-secondary)]">
        {item.details.map((detail) => <div key={detail}>{detail}</div>)}
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)]">
        Open <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function RecommendationCard({ item }: { item: (typeof recommendedActions)[number] }) {
  const { showToast, addAudit } = useAppState();

  function simulate(label: string) {
    showToast(`${label} simulated for ${item.title}`);
    addAudit(label, item.title, "Recommendation");
  }

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <StatusBadge value={item.severity} />
          <h3 className="mt-3 text-base font-semibold text-[var(--text-primary)]">{item.title}</h3>
          <div className="mt-1 text-sm font-medium text-[var(--brand-primary)]">{item.team}</div>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[rgba(91,61,255,0.10)] text-[var(--brand-primary)]">
          <AlertTriangle size={18} />
        </div>
      </div>
      <div className="mt-4 flex-1 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
        <p><span className="font-semibold text-[var(--text-primary)]">Evidence:</span> {item.evidence}</p>
        <p><span className="font-semibold text-[var(--text-primary)]">Recommendation:</span> {item.recommendation}</p>
      </div>
      <div className="mt-4 rounded-md border border-[rgba(91,61,255,0.14)] bg-[rgba(91,61,255,0.06)] px-3 py-2 text-sm font-semibold text-[var(--brand-primary-dark)]">{item.impact}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={item.href} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--border-subtle)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:bg-[var(--surface-muted)]">
          Review
        </Link>
        <ActionButton onClick={() => simulate("Recommendation applied")}>Apply</ActionButton>
      </div>
    </Card>
  );
}

function SignalRow({ label, value, status }: { label: string; value: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-[var(--border-subtle)] bg-white px-4 py-3">
      <div>
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className="mt-1 text-xs text-[var(--text-secondary)]">{value}</div>
      </div>
      <StatusBadge value={status} />
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { showToast, addAudit, auditRows } = useAppState();
  const [workspaceModal, setWorkspaceModal] = useState<(typeof workspaces)[number] | null>(null);

  function copyText(value: string, message: string) {
    navigator.clipboard?.writeText(value);
    showToast(message);
  }

  return (
    <>
      <PageHeader
        eyebrow="Command center"
        title="Overview"
        description="A decision-first view of health, risk, spend, capacity, and the next actions across the AI estate."
        action={<Link href="/dashboard/resource-planner" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-primary-dark)]"><Sparkles size={16} /> Review Recommendations</Link>}
      />
      <Section>
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <Card className="overflow-hidden border-[rgba(91,61,255,0.16)] bg-[var(--surface-dark)] text-white">
            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_280px] xl:p-7">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge value="Warning" />
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)]" />
                    Live AI estate
                  </span>
                </div>
                <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-white xl:text-4xl">Your AI estate is operational, but 3 actions can reduce risk and save AED 42,000/month.</h2>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">Claims GPU utilization is above 90%, Legal Sandbox is offline, and Marketing is trending over budget.</p>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-md border border-white/10 bg-white/5 p-3">
                    <div className="text-xs font-semibold uppercase text-slate-400">Top risk</div>
                    <div className="mt-2 text-sm font-semibold">Claims GPU at 92%</div>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/5 p-3">
                    <div className="text-xs font-semibold uppercase text-slate-400">Cost driver</div>
                    <div className="mt-2 text-sm font-semibold">Marketing GPT-5 spend</div>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/5 p-3">
                    <div className="text-xs font-semibold uppercase text-slate-400">Sovereignty</div>
                    <div className="mt-2 text-sm font-semibold">Legal external route</div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#recommended-actions" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-primary-dark)]">Review Recommendations <ArrowRight size={15} /></a>
                  <Link href="/dashboard/stacks" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">Deploy Stack</Link>
                  <Link href="/dashboard/workspaces#workspace-form" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">Create Workspace</Link>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase text-slate-400">Overall AI Ops Status</div>
                    <div className="mt-2 text-4xl font-semibold">Warning</div>
                  </div>
                  <Gauge className="text-[var(--brand-accent)]" size={30} />
                </div>
                <div className="mt-6 space-y-3">
                  <SignalRow label="Critical admin actions" value="3 recommended now" status="Warning" />
                  <SignalRow label="Savings opportunity" value="AED 42,000/month" status="Cost risk" />
                  <SignalRow label="Policies enforced" value="24 active controls" status="Healthy" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">What to do next</p>
                <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">Priority action queue</h2>
              </div>
              <AlertTriangle className="text-[var(--status-warning)]" size={22} />
            </div>
            <div className="mt-5 space-y-3">
              {recommendedActions.slice(0, 3).map((item) => (
                <Link key={item.title} href={item.href} className="group flex items-center justify-between gap-4 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 transition hover:border-[rgba(91,61,255,0.25)] hover:bg-white">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</div>
                    <div className="mt-1 text-xs text-[var(--text-secondary)]">{item.impact}</div>
                  </div>
                  <ArrowRight size={15} className="text-[var(--brand-primary)] transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {overviewKpis.map((item) => <MissionKpiCard key={item.title} item={item} />)}
        </div>

        <Card id="recommended-actions" className="mt-6 p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Recommended actions</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">Reduce risk, reclaim spend, improve capacity</h2>
            </div>
            <div className="rounded-full border border-[rgba(22,199,232,0.18)] bg-[rgba(22,199,232,0.08)] px-3 py-1 text-xs font-semibold text-cyan-700">Simulated actions only</div>
          </div>
          <div className="mt-5 grid gap-4 xl:grid-cols-4">
            {recommendedActions.map((item) => <RecommendationCard key={item.title} item={item} />)}
          </div>
        </Card>

        <div className="mt-6 rounded-lg border border-[rgba(91,61,255,0.16)] bg-[rgba(91,61,255,0.06)] px-5 py-4 text-sm font-medium text-[var(--brand-primary-dark)]">
          Your AI spend becomes an owned AI asset over time.
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Fleet Health</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Servers, agents, stacks, and last heartbeat.</p>
              </div>
              <Link href="/dashboard/targets" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)]">Servers <ArrowRight size={14} /></Link>
            </div>
            <DataTable
              columns={["Server", "Agent", "Stack", "Health", "Last heartbeat", "Action"]}
              rows={targets.map((target) => [
                <span key="server" className="font-semibold">{target.name}</span>,
                <StatusBadge key="agent" value={target.agent} />,
                target.stack,
                <StatusBadge key="health" value={target.health} />,
                target.lastHeartbeat,
                <Link key="action" href={target.id === "acme" ? "/dashboard/targets/acme" : "/dashboard/targets"} className="font-semibold text-[var(--brand-primary)]">View</Link>
              ])}
            />
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">AI Workspace Activity</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Where usage, cost, and policy risk are concentrated.</p>
              </div>
              <Link href="/dashboard/workspaces" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)]">Workspaces <ArrowRight size={14} /></Link>
            </div>
            <DataTable
              columns={["Workspace", "Requests", "Monthly cost", "Risk", "Action"]}
              rows={workspaceActivity.map((item) => [
                <span key="workspace" className="font-semibold">{item.workspace}</span>,
                item.requests,
                item.cost,
                <StatusBadge key="risk" value={item.risk} />,
                <span key="action" className="font-semibold text-[var(--brand-primary)]">{item.action}</span>
              ])}
            />
          </Card>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <ChartCard title="Request Volume" detail="Short trend to confirm demand direction.">
            <AreaMetricChart data={requestVolume} dataKey="requests" />
          </ChartCard>
          <ChartCard title="Cost by Model" detail="Spend concentration by model.">
            <DonutChart data={costByModel} />
          </ChartCard>
          <ChartCard title="Department Usage" detail="Requests by department.">
            <BarMetricChart data={requestsByDepartment} dataKey="value" />
          </ChartCard>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr_0.9fr]">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Provider Drift Alerts</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">External provider health and routing pressure.</p>
              </div>
              <Route className="text-[var(--brand-primary)]" size={22} />
            </div>
            <div className="mt-4 space-y-3">
              {providerHealth.slice(0, 3).map((provider) => (
                <div key={provider.provider} className="rounded-md border border-[var(--border-subtle)] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">{provider.provider}</div>
                      <div className="mt-1 text-xs text-[var(--text-secondary)]">{provider.lastChecked}</div>
                    </div>
                    <StatusBadge value={provider.status} />
                  </div>
                  <div className="mt-3 text-sm text-[var(--text-secondary)]">{provider.impact}</div>
                  <div className="mt-3 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--brand-primary-dark)]">{provider.action}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Recent Audit Events</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Latest control-plane changes and alerts.</p>
              </div>
              <FileCheck2 className="text-[var(--brand-primary)]" size={22} />
            </div>
            <div className="mt-4 space-y-3">
              {auditRows.slice(0, 5).map((event) => (
                <div key={`${event.timestamp}-${event.action}`} className="rounded-md border border-[var(--border-subtle)] bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{event.action}</div>
                    <StatusBadge value={event.status} />
                  </div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">{event.actor} - {event.target}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Compliance Readiness Snapshot</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Policy, evidence, sovereignty, and audit posture.</p>
              </div>
              <CheckCircle2 className="text-[var(--status-healthy)]" size={22} />
            </div>
            <div className="mt-4 space-y-3">
              {complianceSignals.map(([label, value, status]) => <SignalRow key={label} label={label} value={value} status={status} />)}
            </div>
            <Link href="/dashboard/compliance" className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-primary-dark)]">Open readiness <ArrowRight size={14} /></Link>
          </Card>
        </div>

        <Card className="mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Published Workspace Launcher</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Send users into approved AI workspaces without exposing the underlying infrastructure.</p>
            </div>
            <Bot className="text-[var(--brand-primary)]" size={22} />
          </div>
          <DataTable
            columns={["Workspace", "Department", "Interface", "Status", "Allowed models", "Launch", "Manage"]}
            rows={workspaces.map((workspace) => [
              <span key="name" className="font-semibold">{workspace.name}</span>,
              workspace.department,
              workspace.interface,
              <div key="status" className="flex flex-wrap gap-2"><StatusBadge value={workspace.publishStatus} /><StatusBadge value={workspace.status} /></div>,
              workspace.allowedModels.join(", "),
              <div key="launch" className="flex flex-wrap gap-2">
                <ActionButton variant="secondary" onClick={() => setWorkspaceModal(workspace)}><ExternalLink size={14} /> Launch</ActionButton>
                <button onClick={() => copyText(workspace.launchUrl, `${workspace.name} URL copied`)} className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-white px-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)]" aria-label={`Copy ${workspace.name} URL`}><Copy size={14} /></button>
              </div>,
              <Link key="manage" href="/dashboard/workspaces" className="font-semibold text-[var(--brand-primary)]">Manage</Link>
            ])}
          />
        </Card>
      </Section>

      {workspaceModal ? (
        <Modal title={`Launch ${workspaceModal.name}`} onClose={() => setWorkspaceModal(null)}>
          <div className="grid gap-4 md:grid-cols-[1fr_180px]">
            <div>
              <div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">{workspaceModal.interface}</div>
              <div className="mt-2 break-all rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]">{workspaceModal.launchUrl}</div>
            </div>
            <div className="rounded-md border border-[var(--border-subtle)] p-3">
              <div className="text-xs text-[var(--text-secondary)]">Status</div>
              <div className="mt-2 flex flex-wrap gap-2"><StatusBadge value={workspaceModal.publishStatus} /><StatusBadge value={workspaceModal.status} /></div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <LaunchInfo label="Users" value={workspaceModal.assignedUsers} />
            <LaunchInfo label="Department" value={workspaceModal.department} />
            <LaunchInfo label="Allowed models" value={workspaceModal.allowedModels.join(", ")} />
            <LaunchInfo label="Knowledge" value={workspaceModal.knowledgeBases.join(", ")} />
            <LaunchInfo label="Agents" value={workspaceModal.agents.join(", ")} />
            <LaunchInfo label="External rule" value={workspaceModal.externalRule} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={workspaceModal.launchUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-primary-dark)]"><ExternalLink size={14} /> Open</a>
            <ActionButton variant="secondary" onClick={() => copyText(workspaceModal.launchUrl, `${workspaceModal.name} URL copied`)}><Copy size={14} /> Copy URL</ActionButton>
            <ActionButton variant="secondary" onClick={() => { showToast(`Invite flow opened for ${workspaceModal.name}`); addAudit("Workspace invite opened", workspaceModal.name, "Permission"); }}>Invite users</ActionButton>
            <Link href="/dashboard/workspaces" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--border-subtle)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-muted)]"><ShieldCheck size={14} /> Manage policy</Link>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function LaunchInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border-subtle)] p-3 text-sm">
      <div className="text-xs font-semibold uppercase text-[var(--text-secondary)]">{label}</div>
      <div className="mt-1 font-medium text-[var(--text-primary)]">{value}</div>
    </div>
  );
}
