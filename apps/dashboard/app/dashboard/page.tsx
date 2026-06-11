"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Bot,
  Copy,
  ExternalLink,
  FileCheck2,
  Gauge,
  Route,
  ShieldCheck
} from "lucide-react";
import { DonutChart } from "@/components/charts";
import { ActionButton, Card, DataTable, Modal, Section, StatusBadge, useAppState } from "@/components/ui";
import { costByModel, providerHealth, targets, workspaces } from "@/lib/mock-data";

const costChartColors = ["#5B3DFF", "#16C7E8", "#10B981", "#F59E0B", "#E11D48"];

const kpis = [
  { label: "Servers", value: "3/4", detail: "One offline", status: "Warning", href: "/dashboard/targets" },
  { label: "Services", value: "18/21", detail: "Three need review", status: "Warning", href: "/dashboard/targets/acme" },
  { label: "GPU peak", value: "92%", detail: "Claims above range", status: "Warning", href: "/dashboard/monitoring" },
  { label: "Monthly requests", value: "128,420", detail: "Claims leads demand", status: "Healthy", href: "/dashboard/monitoring" },
  { label: "Projected cost", value: "AED 184k", detail: "Two teams over budget", status: "Cost risk", href: "/dashboard/cost-capacity" },
  { label: "Savings", value: "AED 42k", detail: "Monthly opportunity", status: "Healthy", href: "/dashboard/resource-planner" },
  { label: "Policies active", value: "24", detail: "Across all interfaces", status: "Healthy", href: "/dashboard/routing-policies" },
  { label: "Compliance gaps", value: "5", detail: "Evidence work open", status: "Warning", href: "/dashboard/compliance" }
];

const actions = [
  {
    severity: "Warning",
    area: "Claims / Capacity",
    issue: "Claims GPU at 92%",
    action: "Increase Qwen Local capacity by 25%",
    impact: "Reduce queue wait and SLA risk",
    evidence: "Peak utilization is above the configured safe range during the 10:00-13:00 claims window.",
    href: "/dashboard/resource-planner"
  },
  {
    severity: "Cost risk",
    area: "Marketing / Spend",
    issue: "Drafting traffic is over budget",
    action: "Route drafting and summarization to a cheaper model",
    impact: "Save AED 18,000/month",
    evidence: "Most Marketing prompts are low-sensitivity drafting tasks that do not require the premium route.",
    href: "/dashboard/routing-policies"
  },
  {
    severity: "Governance risk",
    area: "Legal / Sovereignty",
    issue: "Confidential knowledge can reach an external route",
    action: "Enforce local-only routing for confidential KBs",
    impact: "Close one sovereignty exposure",
    evidence: "Legal Contracts is confidential, while the active fallback policy still includes an external provider.",
    href: "/dashboard/routing-policies"
  },
  {
    severity: "Healthy",
    area: "Support / Efficiency",
    issue: "Repeated answers are consuming model capacity",
    action: "Enable permission-aware semantic cache",
    impact: "Save AED 11,400/month",
    evidence: "Repeated queries represent 35% of support traffic and can be cached within the same authorization boundary.",
    href: "/dashboard/resource-planner"
  },
  {
    severity: "Warning",
    area: "Finance / ISO readiness",
    issue: "Agent human approval evidence is incomplete",
    action: "Add and evidence a human approval rule",
    impact: "Close one ISO readiness gap",
    evidence: "The Finance Analysis Agent is registered, but its oversight evidence is not complete in the readiness vault.",
    href: "/dashboard/compliance"
  }
];

const workspaceActivity = [
  { workspace: "Claims AI Assistant", requests: "42,800", cost: "AED 46,200", risk: "Under-allocated" },
  { workspace: "Engineering Copilot", requests: "31,900", cost: "AED 58,400", risk: "Healthy" },
  { workspace: "Legal AI Assistant", requests: "18,700", cost: "AED 29,100", risk: "Governance risk" },
  { workspace: "Marketing Studio", requests: "14,600", cost: "AED 31,500", risk: "Cost risk" }
];

const complianceSignals = [
  ["Evidence readiness", "72%", "Warning"],
  ["Risk assessments", "9/14", "Warning"],
  ["Human oversight", "11/14", "Healthy"],
  ["Audit capture", "100%", "Healthy"]
];

function CompactKpi({ item }: { item: (typeof kpis)[number] }) {
  return (
    <Link href={item.href} className="group min-w-0 rounded-lg border border-[var(--border-subtle)] bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition hover:border-[rgba(91,61,255,0.28)] hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-[var(--text-secondary)]">{item.label}</div>
          <div className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-primary)]">{item.value}</div>
        </div>
        <StatusDot status={item.status} />
      </div>
      <div className="mt-1 truncate text-xs text-[var(--text-secondary)]">{item.detail}</div>
    </Link>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === "Healthy" ? "bg-[var(--status-healthy)]" : status === "Governance risk" ? "bg-[var(--status-critical)]" : "bg-[var(--status-warning)]";
  return <span title={status} aria-label={status} className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />;
}

function PriorityActions() {
  const { showToast, addAudit } = useAppState();

  function applyAction(item: (typeof actions)[number]) {
    showToast(`${item.action} simulated`);
    addAudit("Recommendation applied", item.issue, "Recommendation");
  }

  return (
    <Card id="priority-actions" className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <div>
          <h2 className="font-semibold">Priority Action Queue</h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Five decisions ranked by operational impact.</p>
        </div>
        <span className="rounded-full bg-[rgba(245,158,11,0.12)] px-2.5 py-1 text-xs font-semibold text-[var(--status-warning)]">5 open</span>
      </div>
      <div className="divide-y divide-slate-100">
        {actions.map((item) => (
          <div key={item.issue} className="px-4 py-3">
            <div className="grid gap-2 xl:grid-cols-[130px_minmax(0,1fr)_auto] xl:items-center">
              <div>
                <StatusBadge value={item.severity} />
                <div className="mt-1 text-[11px] font-medium text-[var(--text-secondary)]">{item.area}</div>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)]">{item.issue}</div>
                <div className="mt-0.5 text-xs text-[var(--text-secondary)]"><span className="font-medium text-[var(--brand-primary-dark)]">{item.action}</span> · {item.impact}</div>
                <details className="mt-1">
                  <summary className="cursor-pointer text-[11px] font-medium text-[var(--brand-primary)]">Evidence</summary>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{item.evidence}</p>
                </details>
              </div>
              <div className="flex gap-1.5">
                <Link href={item.href} className="inline-flex min-h-8 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-white px-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-muted)]">Review</Link>
                <button onClick={() => applyAction(item)} className="inline-flex min-h-8 items-center justify-center rounded-md bg-[var(--brand-primary)] px-2.5 text-xs font-semibold text-white hover:bg-[var(--brand-primary-dark)]">Apply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function InfrastructureSnapshot() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <div>
          <h2 className="font-semibold">Infrastructure Health</h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Agent and stack status across the fleet.</p>
        </div>
        <Link href="/dashboard/targets" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)]">All servers <ArrowRight size={13} /></Link>
      </div>
      <div className="divide-y divide-slate-100">
        {targets.map((target) => (
          <div key={target.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_90px_100px] sm:items-center">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{target.name}</div>
              <div className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{target.stack} · {target.lastHeartbeat}</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge value={target.agent} />
              <StatusBadge value={target.health} />
            </div>
            <Link href={target.id === "acme" ? "/dashboard/targets/acme" : "/dashboard/targets"} className="inline-flex min-h-8 items-center justify-center rounded-md border border-[var(--border-subtle)] px-2.5 text-xs font-semibold hover:bg-[var(--surface-muted)]">
              {target.health === "Offline" ? "Reconnect" : "View"}
            </Link>
          </div>
        ))}
      </div>
    </Card>
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
      <Section>
        <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Command Center</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Overview</h1>
          </div>
          <div className="text-xs text-[var(--text-secondary)]">Last telemetry update: 8 seconds ago</div>
        </div>

        <Card className="overflow-hidden border-[rgba(91,61,255,0.18)] bg-[var(--surface-dark)] text-white">
          <div className="grid gap-4 px-5 py-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(560px,1fr)] xl:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(245,158,11,0.14)] px-2.5 py-1 text-xs font-semibold text-amber-200"><span className="h-1.5 w-1.5 rounded-full bg-[var(--status-warning)]" />AI Ops Status: Warning</span>
                <span className="text-xs text-slate-400">3 active issues</span>
              </div>
              <p className="mt-2 text-sm font-medium text-white">Claims GPU above 90%, Legal Sandbox offline, Marketing over budget.</p>
              <p className="mt-1 text-xs text-slate-400">Your AI spend becomes an owned AI asset over time.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Active issues", "3", "Warning"],
                ["Savings opportunity", "AED 42k/mo", "Healthy"],
                ["Sovereignty risk", "1", "Governance risk"],
                ["ISO readiness support", "72%", "Warning"]
              ].map(([label, value, status]) => (
                <div key={label} className="rounded-md border border-white/10 bg-white/5 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-lg font-semibold">{value}</div>
                    <StatusDot status={status} />
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{label}</div>
                  {label === "ISO readiness support" ? <div className="text-[10px] text-slate-500">Evidence ready</div> : null}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
          {kpis.map((item) => <CompactKpi key={item.label} item={item} />)}
        </div>

        <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(370px,0.75fr)]">
          <PriorityActions />
          <InfrastructureSnapshot />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border-subtle)]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">Supporting detail</span>
          <div className="h-px flex-1 bg-[var(--border-subtle)]" />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <div>
                <h2 className="font-semibold">Published Workspace Launcher</h2>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Open governed AI interfaces or copy their approved URLs.</p>
              </div>
              <Bot className="text-[var(--brand-primary)]" size={19} />
            </div>
            <DataTable
              columns={["Workspace", "Department", "Interface", "Status", "Launch"]}
              rows={workspaces.map((workspace) => [
                <span key="name" className="font-semibold">{workspace.name}</span>,
                workspace.department,
                workspace.interface,
                <div key="status" className="flex gap-1.5"><StatusBadge value={workspace.publishStatus} /><StatusBadge value={workspace.status} /></div>,
                <div key="launch" className="flex gap-1.5">
                  <button onClick={() => setWorkspaceModal(workspace)} className="inline-flex min-h-8 items-center gap-1 rounded-md bg-[var(--brand-primary)] px-2.5 text-xs font-semibold text-white hover:bg-[var(--brand-primary-dark)]"><ExternalLink size={12} /> Open</button>
                  <button onClick={() => copyText(workspace.launchUrl, `${workspace.name} URL copied`)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-subtle)] hover:bg-[var(--surface-muted)]" aria-label={`Copy ${workspace.name} URL`}><Copy size={13} /></button>
                </div>
              ])}
            />
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <div>
                <h2 className="font-semibold">AI Workspace Activity</h2>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Demand, cost, and policy pressure by workspace.</p>
              </div>
              <Link href="/dashboard/workspaces" className="text-xs font-semibold text-[var(--brand-primary)]">Manage</Link>
            </div>
            <DataTable
              columns={["Workspace", "Requests", "Cost", "Risk"]}
              rows={workspaceActivity.map((item) => [
                <span key="workspace" className="font-semibold">{item.workspace}</span>,
                item.requests,
                item.cost,
                <StatusBadge key="risk" value={item.risk} />
              ])}
            />
          </Card>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr_1fr]">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Cost by Model</h2>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Estimated monthly spend.</p>
              </div>
              <Gauge size={17} className="text-[var(--brand-primary)]" />
            </div>
            <div className="mt-3 grid grid-cols-[150px_1fr] items-center gap-2">
              <div className="h-40"><DonutChart data={costByModel} /></div>
              <div className="space-y-2">
                {costByModel.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: costChartColors[index] }}
                      />
                      {item.name}
                    </span>
                    <span className="font-semibold">AED {item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Provider Drift Alerts</h2>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">External health and recommended routes.</p>
              </div>
              <Route className="text-[var(--brand-primary)]" size={19} />
            </div>
            <div className="mt-3 space-y-2">
              {providerHealth.slice(0, 3).map((provider) => (
                <div key={provider.provider} className="flex items-center justify-between gap-3 rounded-md border border-[var(--border-subtle)] px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{provider.provider}</div>
                    <div className="truncate text-xs text-[var(--text-secondary)]">{provider.action}</div>
                  </div>
                  <StatusBadge value={provider.status} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Compliance Readiness</h2>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">ISO/IEC 42001 readiness support.</p>
              </div>
              <ShieldCheck className="text-[var(--brand-primary)]" size={19} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {complianceSignals.map(([label, value, status]) => (
                <div key={label} className="rounded-md border border-[var(--border-subtle)] px-3 py-2">
                  <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{value}</span><StatusDot status={status} /></div>
                  <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">{label}</div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/compliance" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)]">Review evidence readiness <ArrowRight size={13} /></Link>
          </Card>
        </div>

        <Card className="mt-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Recent Audit Events</h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Latest control-plane changes and alert decisions.</p>
            </div>
            <FileCheck2 className="text-[var(--brand-primary)]" size={19} />
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            {auditRows.slice(0, 5).map((event) => (
              <div key={`${event.timestamp}-${event.action}`} className="min-w-0 rounded-md border border-[var(--border-subtle)] px-3 py-2">
                <div className="truncate text-xs font-semibold">{event.action}</div>
                <div className="mt-1 truncate text-[11px] text-[var(--text-secondary)]">{event.actor} · {event.target}</div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {workspaceModal ? (
        <Modal title={`Launch ${workspaceModal.name}`} onClose={() => setWorkspaceModal(null)}>
          <div className="grid gap-4 md:grid-cols-[1fr_180px]">
            <div>
              <div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">{workspaceModal.interface}</div>
              <div className="mt-2 break-all rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-medium">{workspaceModal.launchUrl}</div>
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
            <a href={workspaceModal.launchUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-primary-dark)]"><ExternalLink size={14} /> Open workspace</a>
            <ActionButton variant="secondary" onClick={() => copyText(workspaceModal.launchUrl, `${workspaceModal.name} URL copied`)}><Copy size={14} /> Copy URL</ActionButton>
            <ActionButton variant="secondary" onClick={() => { showToast(`Invite flow opened for ${workspaceModal.name}`); addAudit("Workspace invite opened", workspaceModal.name, "Permission"); }}>Invite users</ActionButton>
            <Link href="/dashboard/workspaces" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--border-subtle)] bg-white px-3.5 py-2 text-sm font-medium hover:bg-[var(--surface-muted)]"><ShieldCheck size={14} /> Manage policy</Link>
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
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
