"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, FileCheck2, GitPullRequestArrow, ShieldAlert } from "lucide-react";
import { ActionButton, Card, DataBoundaryChip, MetricCard, Modal, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

type ApprovalStatus = "Pending" | "Approved" | "Denied" | "Changes requested" | "Expired";
type Approval = {
  id: string;
  type: string;
  change: string;
  requester: string;
  affected: string;
  risk: "Medium" | "High";
  evidence: string;
  due: string;
  status: ApprovalStatus;
  policyReason: string;
  expectedImpact: string;
  rollback: string;
  related: string;
  relatedHref: string;
  exactChange: string;
  relatedRecommendation: string;
  relatedIncident: string;
  relatedAudit: string;
  boundary: "External AI Provider" | "Private GPU Runtime" | "Customer Cloud" | "On-Prem / Sovereign" | "Air-gapped";
};

type SimulationResult = {
  title: string;
  summary: string;
  rows: { label: string; value: string }[];
};

const filters = ["Pending", "My approvals", "High risk", "Due soon", "Approved", "Denied", "Expired"] as const;

const initialApprovals: Approval[] = [
  {
    id: "ap-route-claims",
    type: "Routing policy change",
    change: "Route GPT-5 critical claims work to Claude fallback",
    requester: "AI Platform",
    affected: "Claims workflows / GPT-5",
    risk: "Medium",
    evidence: "OpenAI latency degraded for GPT-5.",
    due: "Expires in 27 min",
    status: "Pending",
    policyReason: "Provider degradation rule allows approved fallback for critical workflows.",
    expectedImpact: "Improves latency while keeping an audit trail of the temporary route.",
    rollback: "Restore GPT-5 primary route when provider health returns to normal.",
    related: "OpenAI GPT-5 latency degraded",
    relatedHref: "/dashboard/incidents",
    exactChange: "Set Claims critical task route to Claude first, Qwen fallback, and pause GPT-5 until provider health recovers.",
    relatedRecommendation: "OpenAI degraded fallback",
    relatedIncident: "OpenAI GPT-5 latency degraded",
    relatedAudit: "Provider degradation detected",
    boundary: "External AI Provider"
  },
  {
    id: "ap-legal-workspace",
    type: "Workspace publishing",
    change: "Publish Legal AI Workspace",
    requester: "Legal Ops",
    affected: "Legal AI Assistant",
    risk: "High",
    evidence: "Restricted knowledge attached; audit enabled.",
    due: "Due today",
    status: "Pending",
    policyReason: "Publishing restricted knowledge requires governance approval and evidence readiness review.",
    expectedImpact: "Legal team can launch governed Open WebUI with local-first routing.",
    rollback: "Disable workspace publishing and keep access to pilot group only.",
    related: "Legal Contracts knowledge base",
    relatedHref: "/dashboard/workspaces",
    exactChange: "Publish Legal AI Assistant with Claude, Qwen 32B, Legal Contracts, Contract Review Agent, and audit logging enabled.",
    relatedRecommendation: "Legal local-only enforcement",
    relatedIncident: "Legal sovereignty risk",
    relatedAudit: "Legal workspace publish approval requested",
    boundary: "On-Prem / Sovereign"
  },
  {
    id: "ap-finance-kb",
    type: "Knowledge access expansion",
    change: "Expand Finance knowledge access",
    requester: "Finance Ops",
    affected: "Finance team / Finance Policies",
    risk: "High",
    evidence: "New team access requested.",
    due: "Due in 4 hr",
    status: "Pending",
    policyReason: "Knowledge access expansion changes retrieval authorization boundaries.",
    expectedImpact: "Finance users can retrieve additional policy documents through approved workspaces.",
    rollback: "Remove the authorization grant and re-index affected access fingerprint.",
    related: "Finance Policies",
    relatedHref: "/dashboard/knowledge-bases",
    exactChange: "Grant Finance team access to Finance Policies and HR Policies inside Finance AI Desk only.",
    relatedRecommendation: "Evidence readiness gap",
    relatedIncident: "Finance approval gap",
    relatedAudit: "Knowledge access expansion requested",
    boundary: "Customer Cloud"
  },
  {
    id: "ap-marketing-breaker",
    type: "Budget control",
    change: "Activate Marketing budget circuit breaker",
    requester: "Marketing Ops",
    affected: "Marketing drafting workspace",
    risk: "Medium",
    evidence: "Forecasted overspend above threshold.",
    due: "Expires in 2 hr",
    status: "Pending",
    policyReason: "Spend forecast crossed the configured 80% warning threshold.",
    expectedImpact: "Routes routine drafting to cheaper models before hard budget stop.",
    rollback: "Raise approval threshold or return GPT-5 access for executive content.",
    related: "Marketing overspend risk",
    relatedHref: "/dashboard/cost-capacity#safeguards",
    exactChange: "Enable ladder: semantic cache, then Gemini, then approval for GPT-5, then hard stop at budget limit.",
    relatedRecommendation: "Marketing cost ladder",
    relatedIncident: "Marketing overspend risk",
    relatedAudit: "Budget circuit breaker approval requested",
    boundary: "External AI Provider"
  },
  {
    id: "ap-finance-agent",
    type: "Agent tool execution",
    change: "Run external action from Finance agent",
    requester: "Finance Analysis Agent",
    affected: "Finance AI Desk",
    risk: "High",
    evidence: "Human approval required before external action.",
    due: "Expires in 18 min",
    status: "Pending",
    policyReason: "Agent tool execution with external side effects requires exact-payload approval.",
    expectedImpact: "Allows one approved finance action while preserving human oversight evidence.",
    rollback: "Keep tool execution blocked until a valid owner approval is recorded.",
    related: "Finance approval gap",
    relatedHref: "/dashboard/incidents",
    exactChange: "Approve a single Finance Analysis Agent external action with current payload hash and 30-minute expiry.",
    relatedRecommendation: "Finance agent approval gap",
    relatedIncident: "Finance approval gap",
    relatedAudit: "Agent tool approval requested",
    boundary: "External AI Provider"
  },
  {
    id: "ap-claims-rag",
    type: "Stack deployment",
    change: "Deploy Private RAG stack to Claims node",
    requester: "Infrastructure",
    affected: "Claims On-Prem Node",
    risk: "Medium",
    evidence: "Capacity available; rollback point exists.",
    due: "Due tomorrow",
    status: "Pending",
    policyReason: "Stack deployment changes local serving capacity and service availability.",
    expectedImpact: "Adds governed RAG services for Claims workflows.",
    rollback: "Rollback to Claims AI Stack snapshot if service health check fails.",
    related: "Claims GPU pressure",
    relatedHref: "/dashboard/stacks",
    exactChange: "Deploy Private RAG Stack template to Claims On-Prem Node with rollback checkpoint and audit hooks.",
    relatedRecommendation: "Claims GPU reallocation",
    relatedIncident: "Claims GPU pressure",
    relatedAudit: "Stack deployment approval requested",
    boundary: "Private GPU Runtime"
  }
];

function approvalMatches(approval: Approval, filter: (typeof filters)[number]) {
  if (filter === "Pending") return approval.status === "Pending";
  if (filter === "My approvals") return approval.status === "Pending" && (approval.risk === "High" || approval.due.includes("min"));
  if (filter === "High risk") return approval.risk === "High";
  if (filter === "Due soon") return approval.due.includes("min") || approval.due.includes("hr");
  return approval.status === filter;
}

function buildImpact(approval: Approval, action: "simulate" | "approve" | "deny" | "changes"): SimulationResult {
  const verb = action === "approve" ? "Approval granted" : action === "deny" ? "Approval denied" : action === "changes" ? "Changes requested" : "Impact simulated";
  return {
    title: `${verb}: ${approval.change}`,
    summary: action === "simulate"
      ? "Impact preview is ready for decision review."
      : "Decision recorded and linked to the audit trail.",
    rows: [
      { label: "Exact change", value: approval.exactChange },
      { label: "Expected impact", value: approval.expectedImpact },
      { label: "Rollback", value: approval.rollback }
    ]
  };
}

export default function ApprovalInboxPage() {
  const { showToast, addAudit, currentRole } = useAppState();
  const [approvals, setApprovals] = useState(initialApprovals);
  const [filter, setFilter] = useState<(typeof filters)[number]>("Pending");
  const [selected, setSelected] = useState<Approval>(initialApprovals[0]);
  const [confirmation, setConfirmation] = useState<{ title: string; body: string; run: () => void } | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  const visibleApprovals = useMemo(() => approvals.filter((approval) => approvalMatches(approval, filter)), [approvals, filter]);
  const pending = approvals.filter((approval) => approval.status === "Pending");
  const highRisk = pending.filter((approval) => approval.risk === "High");
  const dueSoon = pending.filter((approval) => approval.due.includes("min") || approval.due.includes("hr"));
  const completedToday = approvals.filter((approval) => approval.status === "Approved" || approval.status === "Denied").length;
  const canDecide = currentRole === "Owner";

  function updateApproval(id: string, status: ApprovalStatus) {
    setApprovals((current) => current.map((approval) => approval.id === id ? { ...approval, status } : approval));
    setSelected((current) => current.id === id ? { ...current, status } : current);
  }

  function approve(approval: Approval) {
    if (!canDecide) return;
    setConfirmation({
      title: `Approve ${approval.type}?`,
      body: "Approve the exact requested change and record the decision.",
      run: () => {
        updateApproval(approval.id, "Approved");
        setSimulation(buildImpact(approval, "approve"));
        showToast(`${approval.change} approved`);
        addAudit("Approval granted", approval.change, "Permission");
        setConfirmation(null);
      }
    });
  }

  function deny(approval: Approval) {
    if (!canDecide) return;
    setConfirmation({
      title: `Deny ${approval.type}?`,
      body: "Deny this requested change and record the decision.",
      run: () => {
        updateApproval(approval.id, "Denied");
        setSimulation(buildImpact(approval, "deny"));
        showToast(`${approval.change} denied`);
        addAudit("Approval denied", approval.change, "Permission");
        setConfirmation(null);
      }
    });
  }

  function requestChanges(approval: Approval) {
    updateApproval(approval.id, "Changes requested");
    setSimulation(buildImpact(approval, "changes"));
    showToast(`Changes requested for ${approval.change}`);
    addAudit("Approval changes requested", approval.change, "Permission");
  }

  function simulateImpact(approval: Approval) {
    setSimulation(buildImpact(approval, "simulate"));
    showToast(`Impact simulation shown for ${approval.change}`);
    addAudit("Approval impact simulated", approval.change, "Permission");
  }

  return (
    <>
      <PageHeader
        eyebrow="Govern"
        title="Approval Inbox"
        description="Review high-impact AI operations changes before they are applied."
        action={<ActionButton onClick={() => setFilter("Pending")}>Review pending</ActionButton>}
      />
      <Section>
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Pending approvals" value={String(pending.length)} detail="Exact changes awaiting decision" status="Warning" icon={<FileCheck2 size={18} />} />
          <MetricCard label="High-risk approvals" value={String(highRisk.length)} detail="Knowledge, workspace, or agent risk" status="Critical" icon={<ShieldAlert size={18} />} />
          <MetricCard label="Due soon" value={String(dueSoon.length)} detail="Expires in minutes or hours" status="Warning" icon={<Clock3 size={18} />} />
          <MetricCard label="Approved / denied today" value={String(completedToday)} detail="Decision activity" status="Healthy" icon={<CheckCircle2 size={18} />} />
        </div>

        {simulation ? <SimulationPanel result={simulation} onClear={() => setSimulation(null)} /> : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(380px,0.6fr)]">
          <Card className="overflow-hidden">
            <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Approval queue</h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Select an approval to review the exact proposed change.</p>
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
              {visibleApprovals.map((approval) => (
                <button
                  key={approval.id}
                  type="button"
                  onClick={() => setSelected(approval)}
                  className={`grid w-full gap-3 px-4 py-3 text-left transition hover:bg-[var(--surface-muted)] lg:grid-cols-[minmax(220px,1.1fr)_minmax(180px,0.8fr)_110px_120px_120px] lg:items-center ${
                    selected.id === approval.id ? "bg-[rgba(91,61,255,0.06)]" : ""
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">{approval.change}</div>
                    <div className="mt-1 text-xs text-[var(--text-secondary)]">{approval.type} - {approval.requester}</div>
                  </div>
                  <div className="text-xs leading-5 text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">Evidence:</span> {approval.evidence}
                    <br />
                    <span className="font-semibold text-[var(--text-primary)]">Affects:</span> {approval.affected}
                  </div>
                  <StatusBadge value={approval.risk} />
                  <div className="text-xs text-[var(--status-warning)]">{approval.due}</div>
                  <StatusBadge value={approval.status} />
                </button>
              ))}
              {visibleApprovals.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">No approvals match this view.</div>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Selected approval</div>
                <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{selected.type}</h2>
              </div>
              <StatusBadge value={selected.risk} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <DataBoundaryChip value={selected.boundary} />
              <StatusBadge value={selected.status} />
            </div>
            <div className="mt-4 space-y-4">
              <Detail label="Requested change" value={selected.change} />
              <Detail label="Exact proposed change" value={selected.exactChange} />
              <Detail label="Policy reason" value={selected.policyReason} />
              <Detail label="Expected impact" value={selected.expectedImpact} />
              <Detail label="Rollback" value={selected.rollback} />
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <ActionButton onClick={() => approve(selected)} disabled={!canDecide} title={!canDecide ? "Only Owner role can approve high-impact changes." : undefined}>Approve</ActionButton>
              <ActionButton variant="danger" onClick={() => deny(selected)} disabled={!canDecide} title={!canDecide ? "Only Owner role can deny high-impact changes." : undefined}>Deny</ActionButton>
              <ActionButton variant="secondary" onClick={() => requestChanges(selected)}>Request changes</ActionButton>
              <ActionButton variant="secondary" onClick={() => simulateImpact(selected)}>Simulate impact</ActionButton>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href={selected.relatedHref} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)] hover:underline">
                Open related resource <ArrowRight size={15} />
              </Link>
              <button type="button" onClick={() => setSimulation({
                title: `Evidence opened: ${selected.change}`,
                summary: "Evidence is shown inside this page so the reviewer understands why the approval exists.",
                rows: [
                  { label: "Evidence", value: selected.evidence },
                  { label: "Related event", value: selected.related },
                  { label: "Requester", value: selected.requester }
                ]
              })} className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                View evidence
              </button>
            </div>
            <div className="mt-5 grid gap-2">
              <RelatedRecord label="Related recommendation" value={selected.relatedRecommendation} href="/dashboard/recommendations" />
              <RelatedRecord label="Related incident" value={selected.relatedIncident} href="/dashboard/incidents" />
              <RelatedRecord label="Exact payload/change" value={selected.exactChange} />
              <RelatedRecord label="Related audit event" value={selected.relatedAudit} href="/dashboard/audit-logs" />
            </div>
          </Card>
        </div>

        <Card className="mt-4 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
            <GitPullRequestArrow size={17} className="text-[var(--brand-primary)]" />
            <h2 className="font-semibold text-[var(--text-primary)]">Decision activity</h2>
          </div>
          <div className="grid gap-px bg-[var(--border-subtle)] md:grid-cols-3">
            {[
              ["Next expiry", "Finance agent external action", "18 min"],
              ["Highest risk", "Publish Legal AI Workspace", "Restricted knowledge"],
              ["Most likely action", "Marketing budget circuit breaker", "Simulate first"]
            ].map(([label, title, value]) => (
              <div key={label} className="bg-white p-4">
                <div className="text-xs font-semibold uppercase text-[var(--text-secondary)]">{label}</div>
                <div className="mt-1 font-semibold text-[var(--text-primary)]">{title}</div>
                <div className="mt-1 text-sm text-[var(--text-secondary)]">{value}</div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {confirmation ? (
        <Modal title={confirmation.title} onClose={() => setConfirmation(null)}>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{confirmation.body}</p>
          <div className="mt-5 flex justify-end gap-3">
            <ActionButton variant="secondary" onClick={() => setConfirmation(null)}>Cancel</ActionButton>
            <ActionButton variant="danger" onClick={confirmation.run}>Confirm decision</ActionButton>
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
          <div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Action result</div>
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

function RelatedRecord({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2">
      <div className="text-[11px] font-semibold uppercase text-[var(--text-secondary)]">{label}</div>
      <div className="mt-1 text-sm font-medium text-[var(--text-primary)]">{value}</div>
    </div>
  );

  return href ? <Link href={href} className="block hover:opacity-90">{content}</Link> : content;
}
