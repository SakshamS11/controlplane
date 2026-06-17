"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock3,
  FileText,
  Play,
  Route,
  Server,
  UserRound
} from "lucide-react";
import { ActionButton, Card, MetricCard, Modal, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

type IncidentStatus = "Open" | "Acknowledged" | "Mitigating" | "Resolved";
type Incident = {
  id: string;
  title: string;
  category: "Infrastructure" | "Capacity" | "Provider" | "Cost" | "Governance";
  severity: "Critical" | "Warning";
  status: IncidentStatus;
  affected: string;
  evidence: string;
  impact: string;
  owner: string;
  sla: string;
  action: string;
  timeline: string[];
  approvals: string[];
  audit: string[];
  relatedHref: string;
  rollback: string;
};

const filters = ["All", "Critical", "Provider", "Infrastructure", "Routing", "Cost", "Governance", "Resolved"] as const;

const initialIncidents: Incident[] = [
  {
    id: "inc-legal-agent",
    title: "Legal Sandbox agent offline",
    category: "Infrastructure",
    severity: "Critical",
    status: "Open",
    affected: "Legal Sandbox / Legal AI Assistant",
    evidence: "Last heartbeat missed; agent offline for 42 minutes.",
    impact: "Legal workspace cannot use governed local model.",
    owner: "Platform Ops",
    sla: "Due in 18 min",
    action: "Restart agent / open server",
    timeline: ["Heartbeat missed", "Agent marked offline", "Legal workspace availability degraded"],
    approvals: ["None required for restart"],
    audit: ["Agent missed heartbeat", "Monitoring alert opened"],
    relatedHref: "/dashboard/targets",
    rollback: "If restart fails, keep Legal workspace on approved local-only fallback and inspect logs."
  },
  {
    id: "inc-claims-gpu",
    title: "Claims GPU pressure",
    category: "Capacity",
    severity: "Warning",
    status: "Open",
    affected: "Claims On-Prem Node",
    evidence: "VRAM 22/24GB and peak GPU load 92%.",
    impact: "Claims AI latency may increase and queue wait may breach SLA.",
    owner: "Infrastructure",
    sla: "Due in 46 min",
    action: "Simulate GPU reallocation",
    timeline: ["VRAM crossed warning threshold", "Queue wait increased 18%", "Resource Planner suggested Finance capacity reclaim"],
    approvals: ["Capacity reallocation approval recommended"],
    audit: ["GPU threshold alert", "Planner recommendation generated"],
    relatedHref: "/dashboard/resource-planner#simulator",
    rollback: "Return reclaimed capacity to Finance if Claims latency does not improve."
  },
  {
    id: "inc-openai-latency",
    title: "OpenAI GPT-5 latency degraded",
    category: "Provider",
    severity: "Warning",
    status: "Open",
    affected: "OpenAI / GPT-5 critical workflows",
    evidence: "Latency above baseline; provider degraded 48 seconds ago.",
    impact: "Critical workflows may slow down unless routed to fallback.",
    owner: "AI Platform",
    sla: "Due in 32 min",
    action: "Route critical work to approved fallback",
    timeline: ["Provider drift detected", "GPT-5 p95 latency exceeded threshold", "Claude and Qwen fallback ready"],
    approvals: ["Routing policy change may require approval for restricted work"],
    audit: ["Provider degradation detected", "Fallback recommendation opened"],
    relatedHref: "/dashboard/routing-policies",
    rollback: "Restore GPT-5 primary route after provider health returns to normal."
  },
  {
    id: "inc-marketing-cost",
    title: "Marketing overspend risk",
    category: "Cost",
    severity: "Warning",
    status: "Open",
    affected: "Marketing drafting workspace",
    evidence: "Monthly budget projected to exceed threshold.",
    impact: "Budget circuit breaker may trigger and block premium model usage.",
    owner: "Marketing Ops",
    sla: "Due today",
    action: "Apply cost ladder",
    timeline: ["Spend forecast crossed 80%", "GPT-5 usage identified as cost driver", "Cost ladder ready"],
    approvals: ["Budget circuit breaker approval pending"],
    audit: ["Cost forecast alert", "Marketing ladder recommendation generated"],
    relatedHref: "/dashboard/cost-capacity#safeguards",
    rollback: "Re-enable premium model route for executive content if quality risk increases."
  },
  {
    id: "inc-finance-approval",
    title: "Finance approval gap",
    category: "Governance",
    severity: "Warning",
    status: "Open",
    affected: "Finance Analysis Agent",
    evidence: "Agent action requires human approval rule.",
    impact: "External action could be blocked or delayed.",
    owner: "Governance",
    sla: "Due tomorrow",
    action: "Open Approval Inbox",
    timeline: ["Finance agent action queued", "Human approval rule missing", "Evidence gap created"],
    approvals: ["Finance agent external action"],
    audit: ["Approval gap detected", "Evidence readiness updated"],
    relatedHref: "/dashboard/approval-inbox",
    rollback: "Keep external action blocked until approval rule is enabled."
  }
];

function filterIncident(incident: Incident, filter: (typeof filters)[number]) {
  if (filter === "All") return incident.status !== "Resolved";
  if (filter === "Critical") return incident.severity === "Critical";
  if (filter === "Resolved") return incident.status === "Resolved";
  if (filter === "Routing") return incident.id === "inc-openai-latency";
  return incident.category === filter;
}

export default function IncidentsPage() {
  const { showToast, addAudit } = useAppState();
  const [incidents, setIncidents] = useState(initialIncidents);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selected, setSelected] = useState<Incident>(initialIncidents[0]);
  const [confirmation, setConfirmation] = useState<{ title: string; body: string; run: () => void } | null>(null);

  const visibleIncidents = useMemo(() => incidents.filter((incident) => filterIncident(incident, filter)), [filter, incidents]);
  const activeIncidents = incidents.filter((incident) => incident.status !== "Resolved");
  const criticalCount = activeIncidents.filter((incident) => incident.severity === "Critical").length;
  const mitigationsReady = activeIncidents.filter((incident) => incident.action).length;

  function updateIncident(id: string, changes: Partial<Incident>) {
    setIncidents((current) => current.map((incident) => incident.id === id ? { ...incident, ...changes } : incident));
    setSelected((current) => current.id === id ? { ...current, ...changes } : current);
  }

  function acknowledge(incident: Incident) {
    updateIncident(incident.id, { status: "Acknowledged" });
    showToast(`${incident.title} acknowledged`);
    addAudit("Incident acknowledged", incident.title, "Alert");
  }

  function assignOwner(incident: Incident) {
    updateIncident(incident.id, { owner: "You", status: incident.status === "Open" ? "Acknowledged" : incident.status });
    showToast(`${incident.title} assigned to you`);
    addAudit("Incident owner assigned", incident.title, "Alert");
  }

  function simulateFix(incident: Incident) {
    updateIncident(incident.id, { status: "Mitigating" });
    showToast(`${incident.action} simulated`);
    addAudit("Incident fix simulated", incident.title, "Alert");
  }

  function applyMitigation(incident: Incident) {
    setConfirmation({
      title: `Apply mitigation for ${incident.title}?`,
      body: "Simulated action only. No infrastructure, routing, or budget policy will be changed.",
      run: () => {
        updateIncident(incident.id, { status: "Mitigating" });
        showToast(`${incident.action} applied in simulation`);
        addAudit("Incident mitigation applied", incident.title, "Alert");
        setConfirmation(null);
      }
    });
  }

  function resolveIncident(incident: Incident) {
    setConfirmation({
      title: `Resolve ${incident.title}?`,
      body: incident.severity === "Critical"
        ? "Critical incident resolution is simulated. Confirm only after reviewing evidence in this prototype."
        : "Resolution is simulated in this frontend prototype.",
      run: () => {
        updateIncident(incident.id, { status: "Resolved" });
        showToast(`${incident.title} resolved in simulation`);
        addAudit("Incident resolved", incident.title, "Alert");
        setConfirmation(null);
      }
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Command Center"
        title="Incidents"
        description="Track active AI operations incidents, affected systems, recommended mitigations, and response history."
        action={<ActionButton onClick={() => showToast("Create incident simulated")}>Create incident</ActionButton>}
      />
      <Section>
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Open incidents" value={String(activeIncidents.length)} detail="Active response queue" status="Warning" icon={<AlertTriangle size={18} />} />
          <MetricCard label="Critical incidents" value={String(criticalCount)} detail="Legal Sandbox offline" status={criticalCount ? "Critical" : "Healthy"} icon={<Server size={18} />} />
          <MetricCard label="Mitigations ready" value={String(mitigationsReady)} detail="Simulated controls available" status="Healthy" icon={<Play size={18} />} />
          <MetricCard label="SLA risk" value="18 min" detail="Nearest due response" status="Warning" icon={<Clock3 size={18} />} />
        </div>

        <Card className="mb-4 overflow-hidden border-l-4 border-l-[var(--status-critical)]">
          <div className="flex flex-col justify-between gap-3 px-4 py-3 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[rgba(225,29,72,0.10)] text-[var(--status-critical)]">
                <AlertTriangle size={18} />
              </span>
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Response focus: Legal Sandbox agent offline</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Agent offline for 42 minutes. Restart or inspect logs before Legal workspace demand rises.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton variant="secondary" onClick={() => simulateFix(selected)}>Simulate fix</ActionButton>
              <ActionButton onClick={() => applyMitigation(selected)}>Apply simulated mitigation</ActionButton>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 xl:flex-row xl:items-center">
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Incident queue</h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Each incident shows the problem, evidence, impact, owner, and next action.</p>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${
                    filter === item ? "bg-[var(--brand-primary)] text-white" : "border border-[var(--border-subtle)] bg-white text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-secondary)]">
                <tr>
                  {["Severity", "Status", "Incident", "Affected area", "Evidence", "Impact if ignored", "Owner", "SLA", "Next action"].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() => setSelected(incident)}
                    className={`cursor-pointer transition hover:bg-[var(--surface-muted)] ${selected.id === incident.id ? "bg-[rgba(91,61,255,0.06)]" : ""}`}
                  >
                    <td className="px-4 py-3"><StatusBadge value={incident.severity} /></td>
                    <td className="px-4 py-3"><StatusBadge value={incident.status} /></td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[var(--text-primary)]">{incident.title}</div>
                      <div className="mt-1 text-xs text-[var(--text-secondary)]">{incident.category}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{incident.affected}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{incident.evidence}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{incident.impact}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-[var(--text-primary)]">{incident.owner}</td>
                    <td className="px-4 py-3 text-xs text-[var(--status-warning)]">{incident.sla}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelected(incident);
                        }}
                        className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleIncidents.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">No incidents match this filter.</div>
          ) : null}
        </Card>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_420px]">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Route size={17} className="text-[var(--brand-primary)]" />
              <h2 className="font-semibold">Response path</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {["Detect signal", "Recommend fix", "Approve if risky", "Audit outcome"].map((step, index) => (
                <div key={step} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
                  <div className="text-xs font-semibold text-[var(--brand-primary)]">0{index + 1}</div>
                  <div className="mt-1 text-sm font-medium text-[var(--text-primary)]">{step}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold">Selected incident</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{selected.title}: {selected.action}.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton variant="secondary" onClick={() => acknowledge(selected)}>Acknowledge</ActionButton>
              <ActionButton variant="secondary" onClick={() => assignOwner(selected)}>Assign owner</ActionButton>
              <ActionButton variant="secondary" onClick={() => simulateFix(selected)}>Simulate fix</ActionButton>
              <ActionButton onClick={() => applyMitigation(selected)}>Apply simulated mitigation</ActionButton>
              <ActionButton variant={selected.severity === "Critical" ? "danger" : "secondary"} onClick={() => resolveIncident(selected)}>Resolve</ActionButton>
            </div>
          </Card>
        </div>
      </Section>

      {selected ? (
        <aside className="fixed bottom-4 right-4 z-30 hidden w-[410px] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-white shadow-2xl 2xl:block">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
            <div>
              <div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Incident detail</div>
              <h2 className="mt-1 font-semibold text-[var(--text-primary)]">{selected.title}</h2>
            </div>
            <StatusBadge value={selected.severity} />
          </div>
          <div className="max-h-[62vh] overflow-y-auto p-4">
            <Detail label="Problem" value={`${selected.affected}: ${selected.evidence}`} />
            <Detail label="Impact" value={selected.impact} />
            <Detail label="Owner" value={selected.owner} />
            <Detail label="Recommended mitigation" value={selected.action} />
            <Detail label="Rollback note" value={selected.rollback} />
            <DetailList label="Timeline" items={selected.timeline} />
            <DetailList label="Related approvals" items={selected.approvals} />
            <DetailList label="Related audit events" items={selected.audit} />
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={selected.relatedHref} className="inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-medium text-white hover:bg-[var(--brand-primary-dark)]">
                Open related page
              </Link>
              <ActionButton variant="secondary" onClick={() => showToast("View logs simulated")}>View logs</ActionButton>
            </div>
          </div>
        </aside>
      ) : null}

      {confirmation ? (
        <Modal title={confirmation.title} onClose={() => setConfirmation(null)}>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{confirmation.body}</p>
          <div className="mt-5 flex justify-end gap-3">
            <ActionButton variant="secondary" onClick={() => setConfirmation(null)}>Cancel</ActionButton>
            <ActionButton variant="danger" onClick={confirmation.run}>Confirm simulated action</ActionButton>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold uppercase text-[var(--text-secondary)]">{label}</div>
      <p className="mt-1 text-sm leading-6 text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function DetailList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold uppercase text-[var(--text-secondary)]">{label}</div>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)]">
            {label === "Timeline" ? <Clock3 size={14} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" /> : label === "Related audit events" ? <FileText size={14} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" /> : <UserRound size={14} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" />}
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
