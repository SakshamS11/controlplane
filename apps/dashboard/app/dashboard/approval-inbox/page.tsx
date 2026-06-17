"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GitPullRequestArrow,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { ActionButton, Card, MetricCard, Modal, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

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
    exactChange: "Set Claims critical task route: primary Claude, local Qwen fallback, GPT-5 paused until provider status recovers."
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
    exactChange: "Publish Legal AI Assistant with Claude and Qwen 32B, Legal Contracts KB, Contract Review Agent, and audit logging enabled."
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
    rollback: "Remove new authorization grant and re-index affected access fingerprint.",
    related: "Finance Policies",
    relatedHref: "/dashboard/knowledge-bases",
    exactChange: "Grant Finance team access to Finance Policies and HR Policies inside Finance AI Desk only."
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
    exactChange: "Enable ladder: semantic cache -> Gemini -> approval for GPT-5 -> hard stop at budget limit."
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
    rollback: "Keep tool execution blocked; no external action is made in this prototype.",
    related: "Finance approval gap",
    relatedHref: "/dashboard/incidents",
    exactChange: "Approve a single Finance Analysis Agent external action with current payload hash and 30-minute expiry."
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
    exactChange: "Deploy Private RAG Stack template to Claims On-Prem Node with rollback checkpoint and audit hooks."
  }
];

function approvalMatches(approval: Approval, filter: (typeof filters)[number]) {
  if (filter === "Pending") return approval.status === "Pending";
  if (filter === "My approvals") return approval.status === "Pending" && (approval.risk === "High" || approval.due.includes("min"));
  if (filter === "High risk") return approval.risk === "High";
  if (filter === "Due soon") return approval.due.includes("min") || approval.due.includes("hr");
  return approval.status === filter;
}

export default function ApprovalInboxPage() {
  const { showToast, addAudit } = useAppState();
  const [approvals, setApprovals] = useState(initialApprovals);
  const [filter, setFilter] = useState<(typeof filters)[number]>("Pending");
  const [selected, setSelected] = useState<Approval>(initialApprovals[0]);
  const [confirmation, setConfirmation] = useState<{ title: string; body: string; run: () => void } | null>(null);

  const visibleApprovals = useMemo(() => approvals.filter((approval) => approvalMatches(approval, filter)), [approvals, filter]);
  const pending = approvals.filter((approval) => approval.status === "Pending");
  const highRisk = pending.filter((approval) => approval.risk === "High");
  const dueSoon = pending.filter((approval) => approval.due.includes("min") || approval.due.includes("hr"));
  const completedToday = approvals.filter((approval) => approval.status === "Approved" || approval.status === "Denied").length;

  function updateApproval(id: string, status: ApprovalStatus) {
    setApprovals((current) => current.map((approval) => approval.id === id ? { ...approval, status } : approval));
    setSelected((current) => current.id === id ? { ...current, status } : current);
  }

  function approve(approval: Approval) {
    setConfirmation({
      title: `Approve ${approval.type}?`,
      body: "This approval is simulated in the frontend prototype. No policy, workspace, stack, knowledge, or agent action will be applied.",
      run: () => {
        updateApproval(approval.id, "Approved");
        showToast(`${approval.change} approved in simulation`);
        addAudit("Approval granted", approval.change, "Permission");
        setConfirmation(null);
      }
    });
  }

  function deny(approval: Approval) {
    setConfirmation({
      title: `Deny ${approval.type}?`,
      body: "This denial is simulated and only updates local state in this demo session.",
      run: () => {
        updateApproval(approval.id, "Denied");
        showToast(`${approval.change} denied in simulation`);
        addAudit("Approval denied", approval.change, "Permission");
        setConfirmation(null);
      }
    });
  }

  function requestChanges(approval: Approval) {
    updateApproval(approval.id, "Changes requested");
    showToast(`Changes requested for ${approval.change}`);
    addAudit("Approval changes requested", approval.change, "Permission");
  }

  function simulateImpact(approval: Approval) {
    showToast(`Impact simulation opened for ${approval.change}`);
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
          <MetricCard label="Approved / denied today" value={String(completedToday)} detail="Local mock session" status="Healthy" icon={<CheckCircle2 size={18} />} />
        </div>

        <Card className="mb-4 overflow-hidden border-l-4 border-l-[var(--brand-primary)]">
          <div className="flex flex-col justify-between gap-3 px-4 py-3 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[rgba(91,61,255,0.10)] text-[var(--brand-primary)]">
                <GitPullRequestArrow size={18} />
              </span>
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Highest priority: Finance agent external action</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Approve only the exact proposed action. Approval expires and is audited in this simulated session.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton variant="secondary" onClick={() => simulateImpact(selected)}>Simulate impact</ActionButton>
              <ActionButton onClick={() => approve(selected)}>Approve selected</ActionButton>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 xl:flex-row xl:items-center">
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Approval queue</h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Review the exact proposed change, evidence, risk, requester, expiry, and status.</p>
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
                  {["Request type", "Requested change", "Requester", "Affected resource", "Risk", "Evidence", "Expiry", "Status", "Action"].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleApprovals.map((approval) => (
                  <tr
                    key={approval.id}
                    onClick={() => setSelected(approval)}
                    className={`cursor-pointer transition hover:bg-[var(--surface-muted)] ${selected.id === approval.id ? "bg-[rgba(91,61,255,0.06)]" : ""}`}
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-[var(--text-primary)]">{approval.type}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[var(--text-primary)]">{approval.change}</div>
                      <div className="mt-1 max-w-[240px] text-xs text-[var(--text-secondary)]">{approval.exactChange}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{approval.requester}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{approval.affected}</td>
                    <td className="px-4 py-3"><StatusBadge value={approval.risk} /></td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{approval.evidence}</td>
                    <td className="px-4 py-3 text-xs text-[var(--status-warning)]">{approval.due}</td>
                    <td className="px-4 py-3"><StatusBadge value={approval.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            approve(approval);
                          }}
                          className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            deny(approval);
                          }}
                          className="text-xs font-semibold text-[var(--status-critical)] hover:underline"
                        >
                          Deny
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleApprovals.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">No approvals match this view.</div>
          ) : null}
        </Card>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_420px]">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-[var(--brand-primary)]" />
              <h2 className="font-semibold">Approval guardrails</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["Exact payload", "Approve the requested change, not a broad permission."],
                ["Expiry", "Approvals expire before stale actions can be applied."],
                ["Audit trail", "Each decision is recorded in the in-memory audit log."]
              ].map(([title, detail]) => (
                <div key={title} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{title}</div>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{detail}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold">Selected approval</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{selected.change}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton onClick={() => approve(selected)}>Approve</ActionButton>
              <ActionButton variant="danger" onClick={() => deny(selected)}>Deny</ActionButton>
              <ActionButton variant="secondary" onClick={() => requestChanges(selected)}>Request changes</ActionButton>
              <ActionButton variant="secondary" onClick={() => simulateImpact(selected)}>Simulate impact</ActionButton>
            </div>
          </Card>
        </div>
      </Section>

      {selected ? (
        <aside className="fixed bottom-4 right-4 z-30 hidden w-[430px] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-white shadow-2xl 2xl:block">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
            <div>
              <div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Approval detail</div>
              <h2 className="mt-1 font-semibold text-[var(--text-primary)]">{selected.type}</h2>
            </div>
            <StatusBadge value={selected.risk} />
          </div>
          <div className="max-h-[62vh] overflow-y-auto p-4">
            <Detail label="Request summary" value={selected.change} />
            <Detail label="Exact proposed change" value={selected.exactChange} />
            <Detail label="Requester" value={selected.requester} />
            <Detail label="Affected resources" value={selected.affected} />
            <Detail label="Evidence" value={selected.evidence} />
            <Detail label="Policy reason" value={selected.policyReason} />
            <Detail label="Expected impact" value={selected.expectedImpact} />
            <Detail label="Rollback or next step" value={selected.rollback} />
            <Detail label="Approval expiry" value={selected.due} />
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">Simulated frontend approval only. No real enforcement changes are made.</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={selected.relatedHref} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-medium text-white hover:bg-[var(--brand-primary-dark)]">
                Open related resource <ArrowRight size={15} />
              </Link>
              <ActionButton variant="secondary" onClick={() => showToast("Evidence view simulated")}>View evidence</ActionButton>
            </div>
          </div>
        </aside>
      ) : null}

      {confirmation ? (
        <Modal title={confirmation.title} onClose={() => setConfirmation(null)}>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{confirmation.body}</p>
          <div className="mt-5 flex justify-end gap-3">
            <ActionButton variant="secondary" onClick={() => setConfirmation(null)}>Cancel</ActionButton>
            <ActionButton variant="danger" onClick={confirmation.run}>Confirm simulated decision</ActionButton>
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
