"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, Clock3, FileText, Play, Plus, Server, UserRound } from "lucide-react";
import { ActionButton, Card, MetricCard, Modal, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

type IncidentStatus = "Open" | "Acknowledged" | "Mitigating" | "Resolved";
type IncidentCategory = "Infrastructure" | "Capacity" | "Provider" | "Cost" | "Governance";
type Incident = {
  id: string;
  title: string;
  category: IncidentCategory;
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

type SimulationResult = {
  title: string;
  summary: string;
  rows: { label: string; value: string }[];
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
    evidence: "No heartbeat for 42 minutes.",
    impact: "Legal workspace cannot use governed local model.",
    owner: "Platform Ops",
    sla: "Due in 18 min",
    action: "Restart agent",
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
    evidence: "GPU 92%, VRAM 22/24GB.",
    impact: "Claims AI latency may increase and queue wait may breach SLA.",
    owner: "Infrastructure",
    sla: "Due in 46 min",
    action: "Simulate GPU reallocation",
    timeline: ["VRAM crossed warning threshold", "Queue wait increased 18%", "Planner suggested Finance capacity reclaim"],
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
    evidence: "Provider degraded 48 seconds ago.",
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
    evidence: "Monthly budget projected above threshold.",
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
    evidence: "Human approval rule is missing.",
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

function buildSimulation(incident: Incident, mode: "simulate" | "apply" | "logs"): SimulationResult {
  if (mode === "logs") {
    return {
      title: `Logs opened for ${incident.title}`,
      summary: "The prototype shows what an operator would inspect next.",
      rows: [
        { label: "Signal", value: incident.evidence },
        { label: "Likely source", value: incident.affected },
        { label: "Next check", value: incident.rollback }
      ]
    };
  }

  return {
    title: `${incident.action} ${mode === "apply" ? "applied" : "simulated"}`,
    summary: "No real infrastructure changes were made. This preview shows the expected operational result.",
    rows: [
      { label: "Affected area", value: incident.affected },
      { label: "Expected impact", value: incident.impact },
      { label: "Audit result", value: `${incident.title} response recorded in this demo session.` }
    ]
  };
}

export default function IncidentsPage() {
  const { showToast, addAudit } = useAppState();
  const [incidents, setIncidents] = useState(initialIncidents);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selected, setSelected] = useState<Incident>(initialIncidents[0]);
  const [confirmation, setConfirmation] = useState<{ title: string; body: string; run: () => void } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [draft, setDraft] = useState({
    title: "New routing policy incident",
    category: "Provider" as IncidentCategory,
    severity: "Warning" as "Critical" | "Warning",
    affected: "Model routing",
    owner: "AI Platform"
  });

  const visibleIncidents = useMemo(() => incidents.filter((incident) => filterIncident(incident, filter)), [filter, incidents]);
  const activeIncidents = incidents.filter((incident) => incident.status !== "Resolved");
  const criticalCount = activeIncidents.filter((incident) => incident.severity === "Critical").length;
  const mitigationsReady = activeIncidents.filter((incident) => incident.action).length;

  function updateIncident(id: string, changes: Partial<Incident>) {
    setIncidents((current) => current.map((incident) => incident.id === id ? { ...incident, ...changes } : incident));
    setSelected((current) => current.id === id ? { ...current, ...changes } : current);
  }

  function createIncident() {
    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      title: draft.title,
      category: draft.category,
      severity: draft.severity,
      status: "Open",
      affected: draft.affected,
      evidence: "Manually created from the Incidents page.",
      impact: "Needs triage before the affected workflow is trusted.",
      owner: draft.owner,
      sla: "Due today",
      action: "Review and assign mitigation",
      timeline: ["Incident created manually", "Awaiting owner review"],
      approvals: ["Approval required if mitigation changes policy"],
      audit: ["Incident created"],
      relatedHref: "/dashboard/monitoring",
      rollback: "Close the incident if investigation confirms no operational risk."
    };
    setIncidents((current) => [newIncident, ...current]);
    setSelected(newIncident);
    setCreateOpen(false);
    setSimulation({ title: "Incident created", summary: "The new incident is now at the top of the response queue.", rows: [
      { label: "Owner", value: newIncident.owner },
      { label: "Affected area", value: newIncident.affected },
      { label: "Next step", value: newIncident.action }
    ] });
    showToast("Incident created in simulation");
    addAudit("Incident created", newIncident.title, "Alert");
  }

  function acknowledge(incident: Incident) {
    updateIncident(incident.id, { status: "Acknowledged" });
    setSimulation({ title: "Incident acknowledged", summary: `${incident.owner} now owns initial response.`, rows: [
      { label: "Incident", value: incident.title },
      { label: "SLA", value: incident.sla },
      { label: "Audit result", value: "Acknowledgement recorded in this demo session." }
    ] });
    showToast(`${incident.title} acknowledged`);
    addAudit("Incident acknowledged", incident.title, "Alert");
  }

  function assignOwner(incident: Incident) {
    updateIncident(incident.id, { owner: "You", status: incident.status === "Open" ? "Acknowledged" : incident.status });
    setSimulation({ title: "Owner assigned", summary: "The incident is now assigned to you for follow-up.", rows: [
      { label: "Incident", value: incident.title },
      { label: "New owner", value: "You" },
      { label: "Next step", value: incident.action }
    ] });
    showToast(`${incident.title} assigned to you`);
    addAudit("Incident owner assigned", incident.title, "Alert");
  }

  function simulateFix(incident: Incident) {
    updateIncident(incident.id, { status: "Mitigating" });
    setSimulation(buildSimulation(incident, "simulate"));
    showToast(`${incident.action} simulated`);
    addAudit("Incident fix simulated", incident.title, "Alert");
  }

  function applyMitigation(incident: Incident) {
    setConfirmation({
      title: `Apply mitigation for ${incident.title}?`,
      body: "Simulated action only. No infrastructure, routing, or budget policy will be changed.",
      run: () => {
        updateIncident(incident.id, { status: "Mitigating" });
        setSimulation(buildSimulation(incident, "apply"));
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
        setSimulation({ title: "Incident resolved", summary: "The incident moved to the resolved view.", rows: [
          { label: "Incident", value: incident.title },
          { label: "Resolution", value: "Marked resolved in local state." },
          { label: "Audit result", value: "Resolution event added to the audit trail." }
        ] });
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
        action={<ActionButton onClick={() => setCreateOpen(true)}><Plus size={16} /> Create incident</ActionButton>}
      />
      <Section>
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Open incidents" value={String(activeIncidents.length)} detail="Active response queue" status="Warning" icon={<AlertTriangle size={18} />} />
          <MetricCard label="Critical incidents" value={String(criticalCount)} detail="Legal Sandbox offline" status={criticalCount ? "Critical" : "Healthy"} icon={<Server size={18} />} />
          <MetricCard label="Mitigations ready" value={String(mitigationsReady)} detail="Simulated controls available" status="Healthy" icon={<Play size={18} />} />
          <MetricCard label="SLA risk" value="18 min" detail="Nearest due response" status="Warning" icon={<Clock3 size={18} />} />
        </div>

        {simulation ? <SimulationPanel result={simulation} onClear={() => setSimulation(null)} /> : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
          <Card className="overflow-hidden">
            <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Incident queue</h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Select a row to see evidence and act.</p>
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
            <div className="divide-y divide-[var(--border-subtle)]">
              {visibleIncidents.map((incident) => (
                <button
                  key={incident.id}
                  type="button"
                  onClick={() => setSelected(incident)}
                  className={`grid w-full gap-3 px-4 py-3 text-left transition hover:bg-[var(--surface-muted)] lg:grid-cols-[110px_minmax(220px,1.1fr)_minmax(180px,0.8fr)_150px_130px] lg:items-center ${
                    selected.id === incident.id ? "bg-[rgba(91,61,255,0.06)]" : ""
                  }`}
                >
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={incident.severity} />
                    <StatusBadge value={incident.status} />
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">{incident.title}</div>
                    <div className="mt-1 text-xs text-[var(--text-secondary)]">{incident.category} - {incident.affected}</div>
                  </div>
                  <div className="text-xs leading-5 text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">Evidence:</span> {incident.evidence}
                    <br />
                    <span className="font-semibold text-[var(--text-primary)]">Impact:</span> {incident.impact}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    <div className="font-semibold text-[var(--text-primary)]">{incident.owner}</div>
                    <div className="mt-1 text-[var(--status-warning)]">{incident.sla}</div>
                  </div>
                  <div className="text-xs font-semibold text-[var(--brand-primary)]">{incident.action}</div>
                </button>
              ))}
              {visibleIncidents.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">No incidents match this filter.</div>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Selected incident</div>
                <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{selected.title}</h2>
              </div>
              <StatusBadge value={selected.severity} />
            </div>
            <div className="mt-4 space-y-4">
              <Detail label="Problem" value={`${selected.affected}: ${selected.evidence}`} />
              <Detail label="Recommended action" value={selected.action} />
              <Detail label="Expected impact" value={selected.impact} />
              <Detail label="Rollback note" value={selected.rollback} />
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <ActionButton variant="secondary" onClick={() => acknowledge(selected)}>Acknowledge</ActionButton>
              <ActionButton variant="secondary" onClick={() => assignOwner(selected)}>Assign owner</ActionButton>
              <ActionButton variant="secondary" onClick={() => simulateFix(selected)}>Simulate fix</ActionButton>
              <ActionButton onClick={() => applyMitigation(selected)}>Apply mitigation</ActionButton>
              <ActionButton variant={selected.severity === "Critical" ? "danger" : "secondary"} onClick={() => resolveIncident(selected)}>Resolve</ActionButton>
              <ActionButton variant="secondary" onClick={() => setSimulation(buildSimulation(selected, "logs"))}>View logs</ActionButton>
            </div>
            <Link href={selected.relatedHref} className="mt-4 inline-flex text-sm font-semibold text-[var(--brand-primary)] hover:underline">
              Open related page
            </Link>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <DetailList label="Timeline" items={selected.timeline} />
          <DetailList label="Related approvals" items={selected.approvals} />
          <DetailList label="Related audit events" items={selected.audit} />
        </div>
      </Section>

      {createOpen ? (
        <Modal title="Create incident" onClose={() => setCreateOpen(false)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Incident title">
              <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="mt-1 h-10 w-full rounded-md border border-[var(--border-subtle)] px-3 text-sm" />
            </Field>
            <Field label="Affected area">
              <input value={draft.affected} onChange={(event) => setDraft((current) => ({ ...current, affected: event.target.value }))} className="mt-1 h-10 w-full rounded-md border border-[var(--border-subtle)] px-3 text-sm" />
            </Field>
            <Field label="Category">
              <select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as IncidentCategory }))} className="mt-1 h-10 w-full rounded-md border border-[var(--border-subtle)] px-3 text-sm">
                {["Infrastructure", "Capacity", "Provider", "Cost", "Governance"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Severity">
              <select value={draft.severity} onChange={(event) => setDraft((current) => ({ ...current, severity: event.target.value as "Critical" | "Warning" }))} className="mt-1 h-10 w-full rounded-md border border-[var(--border-subtle)] px-3 text-sm">
                <option>Warning</option>
                <option>Critical</option>
              </select>
            </Field>
            <Field label="Owner">
              <input value={draft.owner} onChange={(event) => setDraft((current) => ({ ...current, owner: event.target.value }))} className="mt-1 h-10 w-full rounded-md border border-[var(--border-subtle)] px-3 text-sm" />
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <ActionButton variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</ActionButton>
            <ActionButton onClick={createIncident}>Create incident</ActionButton>
          </div>
        </Modal>
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

function SimulationPanel({ result, onClear }: { result: SimulationResult; onClear: () => void }) {
  return (
    <Card className="mb-4 border-[rgba(91,61,255,0.22)] bg-[rgba(91,61,255,0.04)] p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Simulation result</div>
          <h2 className="mt-1 font-semibold text-[var(--text-primary)]">{result.title}</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{result.summary}</p>
        </div>
        <button type="button" onClick={onClear} className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Clear</button>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {result.rows.map((row) => (
          <div key={row.label} className="rounded-md border border-[var(--border-subtle)] bg-white px-3 py-2">
            <div className="text-[11px] font-semibold uppercase text-[var(--text-secondary)]">{row.label}</div>
            <div className="mt-1 text-sm text-[var(--text-primary)]">{row.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-[var(--text-secondary)]">{label}</div>
      <p className="mt-1 text-sm leading-6 text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function DetailList({ label, items }: { label: string; items: string[] }) {
  return (
    <Card className="p-4">
      <div className="text-xs font-semibold uppercase text-[var(--text-secondary)]">{label}</div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)]">
            {label === "Timeline" ? <Clock3 size={14} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" /> : label === "Related audit events" ? <FileText size={14} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" /> : <UserRound size={14} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" />}
            <span>{item}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-sm font-medium text-[var(--text-secondary)]">
      {label}
      {children}
    </label>
  );
}
