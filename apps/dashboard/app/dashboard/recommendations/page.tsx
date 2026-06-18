"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Gauge,
  Play,
  ShieldCheck,
  Sparkles,
  WalletCards,
  XCircle
} from "lucide-react";
import { ActionButton, Card, DataBoundaryChip, MetricCard, Modal, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

type RecommendationStatus = "Open" | "Reviewed" | "Simulated" | "Awaiting approval" | "Applied" | "Dismissed";
type ApprovalState = "Not required" | "Required" | "Requested" | "Approved" | "Blocked";
type Severity = "Critical" | "Warning" | "Info";
type Category = "Cost" | "Capacity" | "Routing" | "Provider" | "Governance" | "Access" | "Cache" | "Model Graduation" | "Evidence";

type Recommendation = {
  id: string;
  title: string;
  category: Category;
  severity: Severity;
  problem: string;
  evidence: string;
  impact: string;
  owner: string;
  action: string;
  currentState: string;
  proposedState: string;
  monthlySavings?: string;
  capacityImpact?: string;
  governanceImpact?: string;
  approval: ApprovalState;
  status: RecommendationStatus;
  relatedIncident?: string;
  relatedApproval?: string;
  relatedAudit: string[];
  relatedHref: string;
  rollback: string;
  simulation: { label: string; value: string }[];
};

type RecommendationResult = {
  title: string;
  summary: string;
  rows: { label: string; value: string }[];
};

const filters = ["All", "Cost", "Capacity", "Routing", "Provider", "Governance", "Access", "Cache", "Model Graduation", "Evidence", "Applied", "Dismissed"] as const;

const seedRecommendations: Recommendation[] = [
  {
    id: "rec-claims-gpu",
    title: "Claims GPU reallocation",
    category: "Capacity",
    severity: "Critical",
    problem: "Claims workload is near VRAM pressure during peak periods.",
    evidence: "Claims node is near threshold; Finance has reclaimable capacity.",
    impact: "Claims AI latency may increase and private RAG jobs may queue.",
    owner: "Infrastructure",
    action: "Reclaim Finance GPU allocation before adding new infrastructure.",
    currentState: "Claims GPU 92%, VRAM 22/24GB; Finance reserves 30% capacity with 8% utilization.",
    proposedState: "Move 12% reserved capacity from Finance to Claims and monitor queue wait.",
    capacityImpact: "Claims queue risk reduced; Finance remains above observed utilization.",
    approval: "Required",
    status: "Open",
    relatedIncident: "Claims GPU pressure",
    relatedApproval: "Capacity reallocation approval",
    relatedAudit: ["GPU threshold alert", "Resource Planner recommendation generated"],
    relatedHref: "/dashboard/resource-planner#simulator",
    rollback: "Return reclaimed capacity to Finance if Claims latency does not improve.",
    simulation: [
      { label: "Capacity impact", value: "Claims reserved GPU +12%, Finance reserved GPU -12%" },
      { label: "Latency expectation", value: "Queue wait risk drops from high to medium" },
      { label: "Risk", value: "Requires production capacity approval before apply" }
    ]
  },
  {
    id: "rec-marketing-cost",
    title: "Marketing cost ladder",
    category: "Cost",
    severity: "Warning",
    problem: "Marketing usage is forecast to exceed monthly budget.",
    evidence: "Spend trend and premium model usage are above plan.",
    impact: "Budget circuit breaker may trigger or cost may exceed plan.",
    owner: "Marketing Ops",
    action: "Route drafting tasks to a cheaper approved model and reserve premium model for executive content.",
    currentState: "GPT-5 is used for routine drafting and summarization.",
    proposedState: "Gemini first, semantic cache when eligible, GPT-5 by approval for executive content.",
    monthlySavings: "AED 18,000",
    governanceImpact: "Budget ladder creates a clearer approval path for premium usage.",
    approval: "Required",
    status: "Open",
    relatedIncident: "Marketing overspend risk",
    relatedApproval: "Marketing budget circuit breaker",
    relatedAudit: ["Cost forecast alert", "Marketing ladder recommendation generated"],
    relatedHref: "/dashboard/cost-capacity#safeguards",
    rollback: "Allow GPT-5 for executive content if quality risk increases.",
    simulation: [
      { label: "Projected savings", value: "AED 18,000/month" },
      { label: "Quality risk", value: "Low for routine drafting; approval for executive content" },
      { label: "Policy effect", value: "Budget breaker activates later in the month" }
    ]
  },
  {
    id: "rec-openai-fallback",
    title: "OpenAI degraded fallback",
    category: "Provider",
    severity: "Warning",
    problem: "GPT-5 latency is degraded.",
    evidence: "Provider drift and monitoring alert show elevated latency.",
    impact: "Critical workflows may slow down.",
    owner: "AI Platform",
    action: "Route critical work to approved Claude or Qwen fallback.",
    currentState: "Critical GPT-5 routes remain primary while provider is degraded.",
    proposedState: "Temporarily route critical tasks to Claude, with Qwen Local fallback for sensitive work.",
    governanceImpact: "Fallback route remains inside approved model policy.",
    approval: "Required",
    status: "Open",
    relatedIncident: "OpenAI GPT-5 latency degraded",
    relatedApproval: "Route GPT-5 critical claims work to Claude fallback",
    relatedAudit: ["Provider degradation detected", "Fallback recommendation opened"],
    relatedHref: "/dashboard/routing-policies",
    rollback: "Restore GPT-5 primary route after provider health returns to normal.",
    simulation: [
      { label: "Latency effect", value: "Critical requests avoid degraded GPT-5 route" },
      { label: "Fallback", value: "Claude first, Qwen Local for sensitive work" },
      { label: "Approval", value: "Production routing change requires approval" }
    ]
  },
  {
    id: "rec-support-cache",
    title: "Support semantic cache opportunity",
    category: "Cache",
    severity: "Warning",
    problem: "Repeated support questions are generating avoidable model cost.",
    evidence: "Repeated request pattern detected in Product FAQ traffic.",
    impact: "Unnecessary spend and avoidable latency continue.",
    owner: "Support Ops",
    action: "Enable permission-aware semantic cache for approved support workspace.",
    currentState: "Repeated support prompts are sent to models each time.",
    proposedState: "Cache approved repeated answers using the same authorization boundary.",
    monthlySavings: "AED 11,400",
    governanceImpact: "Cache must be permission-aware; no cross-boundary sharing.",
    approval: "Required",
    status: "Open",
    relatedAudit: ["Support traffic clustered", "Semantic cache recommendation generated"],
    relatedHref: "/dashboard/cost-capacity",
    rollback: "Disable cache and route all support prompts directly to model providers.",
    simulation: [
      { label: "Estimated savings", value: "AED 11,400/month" },
      { label: "Latency", value: "Repeat answers become near-instant" },
      { label: "Boundary", value: "Cache key includes permission fingerprint" }
    ]
  },
  {
    id: "rec-engineering-graduation",
    title: "Engineering model graduation",
    category: "Model Graduation",
    severity: "Info",
    problem: "Repeatable engineering coding tasks may be suitable for local model routing.",
    evidence: "External model usage pattern overlaps with local DeepSeek/Qwen availability.",
    impact: "Potential API cost reduction remains unused.",
    owner: "Engineering Platform",
    action: "Shadow test local model before moving routine code drafting.",
    currentState: "Most code drafting routes to premium external models.",
    proposedState: "Shadow test DeepSeek Coder and Qwen for repeatable drafting before route change.",
    monthlySavings: "AED 7,200",
    governanceImpact: "Default route change requires approval before user-visible cutover.",
    approval: "Required",
    status: "Open",
    relatedAudit: ["Model graduation candidate detected"],
    relatedHref: "/dashboard/models",
    rollback: "Keep external provider as primary if quality or latency is below threshold.",
    simulation: [
      { label: "Cost", value: "Potential AED 7,200/month reduction" },
      { label: "Latency", value: "Local route expected to be stable for routine drafting" },
      { label: "Quality risk", value: "Medium until shadow test completes" }
    ]
  },
  {
    id: "rec-legal-local",
    title: "Legal local-only enforcement",
    category: "Governance",
    severity: "Critical",
    problem: "Legal workspace uses restricted knowledge and must remain on approved local/private runtime.",
    evidence: "Restricted knowledge base attached and external model rule risk.",
    impact: "Possible data-boundary breach if routed externally.",
    owner: "Governance",
    action: "Enforce local-only routing and add approval for exceptions.",
    currentState: "Legal has restricted knowledge attached and external exception risk.",
    proposedState: "Local-only route for confidential workflows; approval required for exceptions.",
    governanceImpact: "Reduces sovereignty risk and improves evidence readiness.",
    approval: "Required",
    status: "Open",
    relatedIncident: "Legal sovereignty risk",
    relatedApproval: "Publish Legal AI Workspace",
    relatedAudit: ["Legal model access changed", "Restricted KB attached"],
    relatedHref: "/dashboard/compliance",
    rollback: "Keep Claude available only for non-sensitive drafting.",
    simulation: [
      { label: "Governance", value: "Confidential work stays local-only" },
      { label: "Exceptions", value: "External route requires approval" },
      { label: "Evidence", value: "Readiness gap reduced by one policy control" }
    ]
  },
  {
    id: "rec-finance-agent",
    title: "Finance agent approval gap",
    category: "Governance",
    severity: "Warning",
    problem: "Finance agent has external action capability but approval rule is incomplete.",
    evidence: "Agent tool risk and missing approval path.",
    impact: "External actions may be blocked, delayed, or insufficiently governed.",
    owner: "Finance Ops",
    action: "Enable human approval before external action.",
    currentState: "Finance Analysis Agent has external action capability without complete approval path.",
    proposedState: "Human approval required before external Finance agent action.",
    governanceImpact: "Improves oversight and avoids blocked external actions.",
    approval: "Not required",
    status: "Open",
    relatedIncident: "Finance approval gap",
    relatedApproval: "Run external action from Finance agent",
    relatedAudit: ["Approval gap detected", "Evidence readiness updated"],
    relatedHref: "/dashboard/agents",
    rollback: "Disable the approval rule if Finance agent external tools are disabled.",
    simulation: [
      { label: "Control", value: "External actions require approval before execution" },
      { label: "Risk", value: "Governance gap moves from warning to healthy" },
      { label: "Audit", value: "Approval rule update appears in audit trail" }
    ]
  },
  {
    id: "rec-evidence-readiness",
    title: "Evidence readiness gap",
    category: "Evidence",
    severity: "Warning",
    problem: "Some AI systems are missing current risk assessment or human oversight evidence.",
    evidence: "Compliance readiness gaps remain open.",
    impact: "Audit readiness may remain incomplete.",
    owner: "Governance",
    action: "Assign evidence owner and generate readiness task.",
    currentState: "Risk assessments and human oversight evidence are incomplete for some systems.",
    proposedState: "Evidence owners assigned and readiness tasks generated.",
    governanceImpact: "Reduces open readiness gaps; does not mean certification.",
    approval: "Not required",
    status: "Open",
    relatedAudit: ["Compliance evidence gap detected"],
    relatedHref: "/dashboard/compliance",
    rollback: "Reopen readiness task if evidence owner cannot confirm current control.",
    simulation: [
      { label: "Evidence", value: "One owner assigned per open readiness gap" },
      { label: "Readiness", value: "Preparation improves; certification is not claimed" },
      { label: "Audit", value: "Readiness task creation recorded in session" }
    ]
  }
];

function matchesFilter(item: Recommendation, filter: (typeof filters)[number]) {
  if (filter === "All") return item.status !== "Dismissed";
  if (filter === "Applied") return item.status === "Applied";
  if (filter === "Dismissed") return item.status === "Dismissed";
  if (filter === "Routing") return item.category === "Routing" || item.id === "rec-openai-fallback" || item.id === "rec-legal-local";
  return item.category === filter;
}

function statusForKpi(count: number) {
  return count > 0 ? "Warning" : "Healthy";
}

function boundaryForRecommendation(item: Recommendation) {
  if (item.id === "rec-legal-local" || item.id === "rec-claims-gpu") return "On-Prem / Sovereign" as const;
  if (item.id === "rec-openai-fallback" || item.id === "rec-marketing-cost") return "External AI Provider" as const;
  if (item.id === "rec-support-cache" || item.id === "rec-evidence-readiness") return "Customer Cloud" as const;
  return "Private GPU Runtime" as const;
}

function policyForRecommendation(item: Recommendation) {
  if (item.category === "Capacity") return "Resource Planner capacity policy";
  if (item.category === "Cost" || item.category === "Cache") return "Budget Circuit Breaker";
  if (item.category === "Provider") return "Provider Degradation fallback";
  if (item.category === "Governance" || item.category === "Evidence") return "ISO/IEC 42001 readiness support";
  if (item.category === "Model Graduation") return "Model Graduation Flywheel";
  return "Sovereignty Router";
}

export default function RecommendationsPage() {
  const { showToast, addAudit } = useAppState();
  const [recommendations, setRecommendations] = useState(seedRecommendations);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selectedId, setSelectedId] = useState(seedRecommendations[0].id);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [confirmation, setConfirmation] = useState<{ title: string; body: string; run: () => void } | null>(null);

  const selected = recommendations.find((item) => item.id === selectedId) ?? recommendations[0];
  const visibleRecommendations = useMemo(() => recommendations.filter((item) => matchesFilter(item, filter)), [filter, recommendations]);
  const openRecommendations = recommendations.filter((item) => item.status !== "Applied" && item.status !== "Dismissed");
  const criticalRecommendations = openRecommendations.filter((item) => item.severity === "Critical");
  const awaitingApproval = openRecommendations.filter((item) => item.status === "Awaiting approval" || item.approval === "Required");
  const governanceOpen = openRecommendations.filter((item) => item.category === "Governance" || item.category === "Evidence").length;
  const capacityOpen = openRecommendations.filter((item) => item.category === "Capacity").length;

  function updateRecommendation(id: string, changes: Partial<Recommendation>) {
    setRecommendations((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  }

  function showResult(title: string, summary: string, rows: { label: string; value: string }[]) {
    setResult({ title, summary, rows });
  }

  function reviewRecommendation(item: Recommendation) {
    setSelectedId(item.id);
    updateRecommendation(item.id, { status: item.status === "Open" ? "Reviewed" : item.status });
    showResult("Recommendation reviewed", `${item.title} is selected for decision review.`, [
      { label: "Owner", value: item.owner },
      { label: "Evidence", value: item.evidence },
      { label: "Next action", value: item.action }
    ]);
    showToast(`${item.title} reviewed`);
    addAudit("Recommendation reviewed", item.title, "Alert");
  }

  function simulateRecommendation(item: Recommendation) {
    setSelectedId(item.id);
    updateRecommendation(item.id, { status: "Simulated" });
    showResult("Simulation complete", "Simulation only. No backend change was made.", item.simulation);
    showToast(`${item.title} simulation complete`);
    addAudit("Recommendation simulated", item.title, "Alert");
  }

  function requestApproval(item: Recommendation) {
    setSelectedId(item.id);
    updateRecommendation(item.id, { status: "Awaiting approval", approval: "Requested" });
    showResult("Approval request simulated", "Approval request added to this browser session. Real approval execution requires backend workflow support.", [
      { label: "Approval path", value: item.relatedApproval ?? "Approval Inbox" },
      { label: "Requester", value: item.owner },
      { label: "Audit", value: "Audit entry added to this browser session" }
    ]);
    showToast(`${item.title} approval requested`);
    addAudit("Recommendation approval requested", item.title, "Permission");
  }

  function applyRecommendation(item: Recommendation) {
    if (item.approval === "Required" || item.approval === "Requested") {
      requestApproval(item);
      return;
    }
    setConfirmation({
      title: `Apply ${item.title}?`,
      body: "Simulated action only. No backend change was made and no real policy, deployment, route, cache, model, or approval execution occurred.",
      run: () => {
        updateRecommendation(item.id, { status: "Applied" });
        showResult("Recommendation marked as applied", "No backend change was made. The local UI state and audit trail were updated.", [
          { label: "Applied change", value: item.action },
          { label: "Expected impact", value: item.impact },
          { label: "Audit", value: "Audit entry added to this browser session" }
        ]);
        showToast(`${item.title} applied in simulation`);
        addAudit("Recommendation applied", item.title, "Alert");
        setConfirmation(null);
      }
    });
  }

  function dismissRecommendation(item: Recommendation) {
    const run = () => {
      updateRecommendation(item.id, { status: "Dismissed" });
      showResult("Recommendation dismissed", "Dismissal only changes local state in this frontend prototype.", [
        { label: "Dismissed", value: item.title },
        { label: "Risk if ignored", value: item.impact },
        { label: "Rollback", value: "Use the Dismissed filter to find it again during this session" }
      ]);
      showToast(`${item.title} dismissed`);
      addAudit("Recommendation dismissed", item.title, "Alert");
      setConfirmation(null);
    };

    if (item.severity === "Critical") {
      setConfirmation({
        title: `Dismiss critical recommendation?`,
        body: "This is simulated, but critical recommendations should only be dismissed after reviewing evidence and impact.",
        run
      });
      return;
    }
    run();
  }

  return (
    <>
      <PageHeader
        eyebrow="Command Center"
        title="Recommendations"
        description="Prioritized AI operations recommendations with evidence, impact, simulation, approval path, and audit trail."
        action={<ActionButton onClick={() => simulateRecommendation(selected)}><Play size={16} /> Simulate top recommendation</ActionButton>}
      />
      <Section>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <MetricCard label="Open recommendations" value={String(openRecommendations.length)} detail="Need review or action" status={statusForKpi(openRecommendations.length)} icon={<Sparkles size={18} />} />
          <MetricCard label="Critical" value={String(criticalRecommendations.length)} detail="Capacity and governance risk" status={criticalRecommendations.length ? "Critical" : "Healthy"} icon={<AlertTriangle size={18} />} />
          <MetricCard label="Monthly savings" value="AED 36,600" detail="Simulated opportunity" status="Healthy" icon={<WalletCards size={18} />} />
          <MetricCard label="Awaiting approval" value={String(awaitingApproval.length)} detail="Requires decision path" status={statusForKpi(awaitingApproval.length)} icon={<FileCheck2 size={18} />} />
          <MetricCard label="Governance gaps" value={String(governanceOpen)} detail="Could be reduced" status={statusForKpi(governanceOpen)} icon={<ShieldCheck size={18} />} />
          <MetricCard label="Capacity risk" value={String(capacityOpen)} detail="Claims GPU pressure" status={statusForKpi(capacityOpen)} icon={<Gauge size={18} />} />
        </div>

        {result ? <ResultPanel result={result} onClear={() => setResult(null)} /> : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(390px,0.55fr)]">
          <Card className="overflow-hidden">
            <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Recommendation queue</h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Problem, evidence, impact, owner, approval, and next action in one place.</p>
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
              {visibleRecommendations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => reviewRecommendation(item)}
                  className={`grid w-full gap-3 px-4 py-3 text-left transition hover:bg-[var(--surface-muted)] lg:grid-cols-[112px_minmax(250px,1fr)_minmax(220px,0.9fr)_150px_160px] lg:items-center ${
                    selected.id === item.id ? "bg-[rgba(91,61,255,0.06)]" : ""
                  }`}
                >
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge value={item.severity} />
                    <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">{item.category}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
                    <div className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--text-primary)]">Problem:</span> {item.problem}
                    </div>
                  </div>
                  <div className="text-xs leading-5 text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">Evidence:</span> {item.evidence}
                    <br />
                    <span className="font-semibold text-[var(--text-primary)]">Impact:</span> {item.impact}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    <div className="font-semibold text-[var(--text-primary)]">{item.owner}</div>
                    <div className="mt-1">{item.approval}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 lg:justify-end">
                    <StatusBadge value={item.status} />
                    <span className="text-xs font-semibold text-[var(--brand-primary)]">{item.approval === "Required" ? "Request approval" : "Simulate"}</span>
                  </div>
                </button>
              ))}
              {visibleRecommendations.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
                  No recommendations match this filter. Try All, or review Incidents and Monitoring for active signals.
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Selected recommendation</div>
                <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{selected.title}</h2>
              </div>
              <StatusBadge value={selected.severity} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">{selected.category}</span>
              <DataBoundaryChip value={boundaryForRecommendation(selected)} />
              <StatusBadge value={selected.status} />
              <StatusBadge value={selected.approval} />
            </div>

            <div className="mt-5 space-y-4">
              <Detail label="Problem" value={selected.problem} />
              <Detail label="Evidence" value={selected.evidence} />
              <Detail label="Impact if ignored" value={selected.impact} />
              <Detail label="Recommended change" value={selected.action} />
              <Detail label="Current state" value={selected.currentState} />
              <Detail label="Proposed state" value={selected.proposedState} />
              {selected.monthlySavings ? <Detail label="Estimated monthly savings" value={selected.monthlySavings} /> : null}
              {selected.capacityImpact ? <Detail label="Capacity impact" value={selected.capacityImpact} /> : null}
              {selected.governanceImpact ? <Detail label="Governance impact" value={selected.governanceImpact} /> : null}
              <Detail label="Rollback or next step" value={selected.rollback} />
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <ActionButton variant="secondary" onClick={() => reviewRecommendation(selected)}>Review</ActionButton>
              <ActionButton variant="secondary" onClick={() => simulateRecommendation(selected)}>Simulate</ActionButton>
              {selected.approval === "Required" || selected.approval === "Requested" ? (
                <ActionButton onClick={() => requestApproval(selected)}>Request approval</ActionButton>
              ) : (
                <ActionButton onClick={() => applyRecommendation(selected)}>Apply simulated change</ActionButton>
              )}
              <ActionButton variant="secondary" onClick={() => showResult("Evidence opened", "Evidence is shown here so the admin can understand why this exists.", [
                { label: "Evidence", value: selected.evidence },
                { label: "Related audit", value: selected.relatedAudit.join(", ") },
                { label: "Owner", value: selected.owner }
              ])}>View evidence</ActionButton>
              <ActionButton variant={selected.severity === "Critical" ? "danger" : "secondary"} onClick={() => dismissRecommendation(selected)}>Dismiss</ActionButton>
              <Link href={selected.relatedHref} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--border-subtle)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-muted)]">
                Open related page <ArrowRight size={15} />
              </Link>
            </div>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          <RelatedCard title="Related incident" value={selected.relatedIncident ?? "No active incident linked"} />
          <RelatedCard title="Related approval" value={selected.relatedApproval ?? selected.approval} />
          <RelatedCard title="Related audit events" value={selected.relatedAudit.join(", ")} />
          <RelatedCard title="Related resource" value={selected.relatedHref.replace("/dashboard/", "") || "Overview"} />
          <RelatedCard title="Related policy" value={policyForRecommendation(selected)} />
        </div>
      </Section>

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

function ResultPanel({ result, onClear }: { result: RecommendationResult; onClear: () => void }) {
  return (
    <Card className="mb-4 border-[rgba(91,61,255,0.22)] bg-[rgba(91,61,255,0.04)] p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Action result</div>
          <h2 className="mt-1 font-semibold text-[var(--text-primary)]">{result.title}</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{result.summary}</p>
        </div>
        <button type="button" onClick={onClear} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <XCircle size={14} /> Clear
        </button>
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

function RelatedCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={15} className="text-[var(--brand-primary)]" />
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{value}</p>
    </Card>
  );
}
