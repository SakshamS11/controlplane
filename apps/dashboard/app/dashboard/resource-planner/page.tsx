"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Database,
  FileCheck2,
  Gauge,
  Lightbulb,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X
} from "lucide-react";
import { ActionButton, Card, DataTable, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

const teams = ["Claims", "Legal", "Engineering", "Finance", "Customer Support", "Marketing"];
const knowledgeBases = ["Claims SOPs", "Legal Contracts", "HR Policies", "Finance Policies", "Product FAQ", "Engineering Docs"];
const agents = ["Claims Summary Agent", "Contract Review Agent", "Support Triage Agent", "Code Review Agent", "Finance Analysis Agent"];
const fallbackPolicies = ["Local first", "Cheapest cloud", "Best quality", "Sensitive data local only"];
const plannerTabs = ["Summary", "Recommendations", "Simulator", "Team Usage", "Access & Policies", "Evidence"] as const;
const matrixTabs = ["Models", "Knowledge Bases", "Agents", "Workspaces"] as const;
type PlannerTab = (typeof plannerTabs)[number];
type MatrixTab = (typeof matrixTabs)[number];
type Matrix = Record<string, string[]>;

const workspaces = [
  { name: "Legal AI Assistant", team: "Legal", models: "Claude, Qwen 32B", knowledge: "Legal Contracts", route: "Confidential work local only" },
  { name: "Claims AI Assistant", team: "Claims", models: "Qwen 32B, Llama 3.1 8B", knowledge: "Claims SOPs", route: "External models blocked" },
  { name: "Engineering Copilot", team: "Engineering", models: "GPT-5, Claude, DeepSeek Coder", knowledge: "Engineering Docs", route: "Best quality with fallback" },
  { name: "Finance AI Desk", team: "Finance", models: "Qwen 32B", knowledge: "Finance Policies", route: "Local first" }
];

const departmentSuggestions: Record<string, {
  monthlyBudget: number;
  localGpu: number;
  maxConcurrent: number;
  fallbackPolicy: string;
  models: string[];
  knowledgeBases: string[];
  agents: string[];
  status: string;
  reason: string;
  capacityAction: string;
  costAction: string;
}> = {
  Claims: {
    monthlyBudget: 14200,
    localGpu: 36,
    maxConcurrent: 28,
    fallbackPolicy: "Sensitive data local only",
    models: ["Qwen 32B", "Llama 3.1 8B"],
    knowledgeBases: ["Claims SOPs"],
    agents: ["Claims Summary Agent"],
    status: "Under-allocated",
    reason: "Peak GPU load and queue wait are rising while sensitive claims work must remain local.",
    capacityAction: "Reclaim 8% local GPU from Finance before increasing Claims allocation.",
    costAction: "Keep cloud spend capped and block external fallback for claims documents."
  },
  Legal: {
    monthlyBudget: 8500,
    localGpu: 18,
    maxConcurrent: 16,
    fallbackPolicy: "Sensitive data local only",
    models: ["Qwen 32B", "Claude"],
    knowledgeBases: ["Legal Contracts"],
    agents: ["Contract Review Agent"],
    status: "Governance risk",
    reason: "Confidential contract review should use local retrieval and local models.",
    capacityAction: "Reserve local capacity for confidential contract workflows.",
    costAction: "Allow Claude only for non-sensitive drafting and summaries."
  },
  Engineering: {
    monthlyBudget: 16000,
    localGpu: 26,
    maxConcurrent: 34,
    fallbackPolicy: "Best quality",
    models: ["DeepSeek Coder", "Claude", "GPT-5"],
    knowledgeBases: ["Engineering Docs", "Product FAQ"],
    agents: ["Code Review Agent"],
    status: "Healthy",
    reason: "High volume is balanced by coding-specialized routing and healthy latency.",
    capacityAction: "Keep current allocation and prioritize code requests during build windows.",
    costAction: "Use DeepSeek Coder first, then Claude or GPT-5 for complex reviews."
  },
  Finance: {
    monthlyBudget: 3500,
    localGpu: 10,
    maxConcurrent: 8,
    fallbackPolicy: "Local first",
    models: ["Qwen 32B"],
    knowledgeBases: ["Finance Policies"],
    agents: ["Finance Analysis Agent"],
    status: "Over-allocated",
    reason: "Reserved local capacity is much higher than actual utilization.",
    capacityAction: "Reduce reserved GPU from 30% to 10% and release 20% to Claims or Legal.",
    costAction: "Keep external access restricted for finance policies."
  },
  "Customer Support": {
    monthlyBudget: 5200,
    localGpu: 8,
    maxConcurrent: 40,
    fallbackPolicy: "Cheapest cloud",
    models: ["Llama 3.1 8B", "Gemini"],
    knowledgeBases: ["Product FAQ", "Claims SOPs"],
    agents: ["Support Triage Agent"],
    status: "Healthy",
    reason: "Repeated questions create a strong semantic cache and lower-cost routing opportunity.",
    capacityAction: "Prioritize concurrency and cache hits over large-model allocation.",
    costAction: "Route simple traffic to Llama 3.1 8B or Gemini."
  },
  Marketing: {
    monthlyBudget: 2400,
    localGpu: 0,
    maxConcurrent: 14,
    fallbackPolicy: "Cheapest cloud",
    models: ["Gemini", "Claude"],
    knowledgeBases: ["Product FAQ"],
    agents: [],
    status: "Cost risk",
    reason: "Drafting and summarization traffic is overusing premium models.",
    capacityAction: "Do not reserve local GPU until usage justifies it.",
    costAction: "Use Gemini for standard content and Claude for higher-risk copy review."
  }
};

const teamUsage = [
  { team: "Claims", users: 42, requests: "31,400", tokens: "8.7M", cost: "AED 3,900", peak: "10:00-13:00", gpu: "28%", cloud: "AED 880", latency: "940 ms", status: "Under-allocated" },
  { team: "Legal", users: 18, requests: "12,700", tokens: "3.1M", cost: "AED 3,100", peak: "14:00-17:00", gpu: "10%", cloud: "AED 2,420", latency: "1,040 ms", status: "Governance risk" },
  { team: "Engineering", users: 55, requests: "38,900", tokens: "11.2M", cost: "AED 4,600", peak: "15:00-20:00", gpu: "26%", cloud: "AED 1,700", latency: "780 ms", status: "Healthy" },
  { team: "Finance", users: 11, requests: "4,200", tokens: "1.4M", cost: "AED 690", peak: "09:00-11:00", gpu: "30%", cloud: "AED 210", latency: "720 ms", status: "Over-allocated" },
  { team: "Customer Support", users: 63, requests: "24,100", tokens: "5.2M", cost: "AED 1,850", peak: "11:00-18:00", gpu: "6%", cloud: "AED 430", latency: "620 ms", status: "Healthy" },
  { team: "Marketing", users: 14, requests: "8,900", tokens: "980K", cost: "AED 4,260", peak: "13:00-16:00", gpu: "0%", cloud: "AED 3,920", latency: "1,120 ms", status: "Cost risk" }
];

const currentReservedCapacity: Record<string, number> = {
  Claims: 28,
  Legal: 10,
  Engineering: 26,
  Finance: 30,
  "Customer Support": 6,
  Marketing: 0
};

const actualLocalUtilization: Record<string, number> = {
  Claims: 31,
  Legal: 8,
  Engineering: 24,
  Finance: 8,
  "Customer Support": 5,
  Marketing: 0
};

type Recommendation = {
  title: string;
  team: string;
  status: string;
  issue: string;
  action: string;
  impact: string;
  evidence: string;
};

const recommendations: Recommendation[] = [
  {
    title: "Claims under-allocated",
    team: "Claims",
    status: "Under-allocated",
    issue: "GPU peak is 92% and queue wait is rising.",
    action: "Reclaim Finance capacity, then add 25% Qwen capacity.",
    impact: "Lower queue wait and SLA risk",
    evidence: "Claims uses 31% actual GPU against 28% reserved. Finance has 20% safely reclaimable capacity."
  },
  {
    title: "Marketing over-spending",
    team: "Marketing",
    status: "Cost risk",
    issue: "72% of requests are drafting or summarization.",
    action: "Route standard work to Gemini and reduce GPT-5 usage.",
    impact: "Save AED 2,000/month",
    evidence: "Premium-model usage is the main driver of Marketing's AED 3,920 cloud spend."
  },
  {
    title: "Finance over-allocated",
    team: "Finance",
    status: "Over-allocated",
    issue: "30% GPU is reserved while utilization is 8%.",
    action: "Reduce reserved capacity to 10%.",
    impact: "Release 20% local GPU",
    evidence: "Finance demand remains below its reservation during both normal and peak windows."
  },
  {
    title: "Legal governance risk",
    team: "Legal",
    status: "Governance risk",
    issue: "Confidential contract review is reaching Claude.",
    action: "Route confidential retrieval to Qwen 32B only.",
    impact: "Improve sovereignty posture",
    evidence: "Legal Contracts is restricted, but the current fallback still permits an external model."
  },
  {
    title: "Support cache opportunity",
    team: "Customer Support",
    status: "Healthy",
    issue: "Repeated queries represent 35% of traffic.",
    action: "Enable permission-aware semantic cache.",
    impact: "Save AED 1,400/month",
    evidence: "Product FAQ answers repeat frequently and already share the same authorization boundary."
  },
  {
    title: "ISO readiness gap",
    team: "Finance",
    status: "Warning",
    issue: "Finance agent has no recorded evidence owner.",
    action: "Assign an evidence owner and confirm human approval.",
    impact: "Close 1 readiness gap",
    evidence: "The agent is audited, but oversight ownership is incomplete. This supports readiness only, not certification."
  }
];

const initialModelAccess: Matrix = {
  Claims: ["Qwen 32B", "Llama 3.1 8B"],
  Legal: ["Qwen 32B", "Claude"],
  Engineering: ["Qwen 32B", "Llama 3.1 8B", "DeepSeek Coder", "GPT-5", "Claude"],
  Finance: ["Qwen 32B"],
  "Customer Support": ["Llama 3.1 8B", "Gemini"],
  Marketing: ["GPT-5", "Claude", "Gemini"]
};

const initialKbAccess: Matrix = {
  Claims: ["Claims SOPs", "Product FAQ"],
  Legal: ["Legal Contracts", "HR Policies"],
  Engineering: ["Engineering Docs", "Product FAQ"],
  Finance: ["Finance Policies", "HR Policies"],
  "Customer Support": ["Product FAQ", "Claims SOPs"],
  Marketing: ["Product FAQ"]
};

const initialAgentAccess: Matrix = {
  Claims: ["Claims Summary Agent"],
  Legal: ["Contract Review Agent"],
  Engineering: ["Code Review Agent"],
  Finance: ["Finance Analysis Agent"],
  "Customer Support": ["Support Triage Agent"],
  Marketing: []
};

const initialWorkspaceAccess: Matrix = {
  Claims: ["Claims AI Assistant"],
  Legal: ["Legal AI Assistant"],
  Engineering: ["Engineering Copilot"],
  Finance: ["Finance AI Desk"],
  "Customer Support": [],
  Marketing: []
};

const evidenceSignals = [
  { team: "Legal", signal: "Risk assessment pending", owner: "Legal Ops", status: "Critical", next: "Complete sensitivity assessment" },
  { team: "Finance", signal: "Human approval evidence missing", owner: "Finance Ops", status: "Warning", next: "Record approval rule" },
  { team: "Marketing", signal: "Policy acceptance pending", owner: "Marketing Lead", status: "Warning", next: "Confirm model-use policy" },
  { team: "Claims", signal: "Audit evidence review due", owner: "Claims Ops", status: "Open", next: "Review command evidence" },
  { team: "Customer Support", signal: "Training task open", owner: "Support Lead", status: "Open", next: "Complete change training" }
];

function hasAccess(matrix: Matrix, row: string, column: string) {
  return matrix[row]?.includes(column) ?? false;
}

function toggleMatrix(matrix: Matrix, row: string, column: string) {
  const current = matrix[row] ?? [];
  return {
    ...matrix,
    [row]: current.includes(column) ? current.filter((item) => item !== column) : [...current, column]
  };
}

function Toggle({ enabled, label, onClick }: { enabled: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={enabled}
      onClick={onClick}
      className={`h-6 w-11 rounded-full p-1 transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${enabled ? "bg-[var(--brand-primary)]" : "bg-slate-300"}`}
    >
      <span className={`block h-4 w-4 rounded-full bg-white transition ${enabled ? "translate-x-5" : ""}`} />
    </button>
  );
}

export default function ResourcePlannerPage() {
  const { showToast, addAudit, modelCatalog } = useAppState();
  const [activeTab, setActiveTab] = useState<PlannerTab>("Summary");
  const [activeMatrix, setActiveMatrix] = useState<MatrixTab>("Models");
  const [reviewedRecommendation, setReviewedRecommendation] = useState<Recommendation | null>(null);
  const [selectedTeam, setSelectedTeam] = useState("Claims");
  const [monthlyBudget, setMonthlyBudget] = useState(12000);
  const [localGpu, setLocalGpu] = useState(35);
  const [maxConcurrent, setMaxConcurrent] = useState(24);
  const [fallbackPolicy, setFallbackPolicy] = useState("Local first");
  const [allowedModels, setAllowedModels] = useState(["Qwen 32B", "Claude"]);
  const [selectedKbs, setSelectedKbs] = useState(["Claims SOPs"]);
  const [assignedAgents, setAssignedAgents] = useState(["Claims Summary Agent"]);
  const [modelAccess, setModelAccess] = useState<Matrix>(initialModelAccess);
  const [kbAccess, setKbAccess] = useState<Matrix>(initialKbAccess);
  const [agentAccess, setAgentAccess] = useState<Matrix>(initialAgentAccess);
  const [workspaceAccess, setWorkspaceAccess] = useState<Matrix>(initialWorkspaceAccess);

  useEffect(() => {
    function syncHash() {
      if (window.location.hash === "#simulator") setActiveTab("Simulator");
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const activeModelOptions = modelCatalog
    .filter((model) => model.status === "Running" || model.status === "Connected")
    .map((model) => model.name);
  const teamSuggestion = departmentSuggestions[selectedTeam];
  const totalReserved = Object.values(currentReservedCapacity).reduce((sum, value) => sum + value, 0);
  const currentTeamCapacity = currentReservedCapacity[selectedTeam] ?? 0;
  const proposedTotalReserved = totalReserved - currentTeamCapacity + localGpu;
  const unassignedCapacity = Math.max(0, 100 - proposedTotalReserved);
  const overbookedCapacity = Math.max(0, proposedTotalReserved - 100);
  const donorTeams = teams
    .filter((team) => team !== selectedTeam)
    .map((team) => ({
      team,
      reserved: currentReservedCapacity[team] ?? 0,
      utilized: actualLocalUtilization[team] ?? 0,
      reclaimable: Math.max(0, (currentReservedCapacity[team] ?? 0) - Math.max(10, actualLocalUtilization[team] ?? 0))
    }))
    .filter((team) => team.reclaimable > 0)
    .sort((a, b) => b.reclaimable - a.reclaimable);
  const totalReclaimable = donorTeams.reduce((sum, team) => sum + team.reclaimable, 0);
  const capacityDecision = overbookedCapacity === 0
    ? `${unassignedCapacity}% capacity remains unassigned after this change.`
    : totalReclaimable >= overbookedCapacity
      ? `Reclaim ${overbookedCapacity}% from over-allocated teams before applying.`
      : `Only ${totalReclaimable}% is safely reclaimable. Add GPU capacity or cloud credits.`;

  const projected = useMemo(() => {
    const cloudHeavy = allowedModels.includes("GPT-5") || allowedModels.includes("Claude");
    const projectedCost = Math.max(900, Math.round(monthlyBudget * (cloudHeavy ? 0.82 : 0.54) + maxConcurrent * 18 - localGpu * 22));
    const expectedLatency = Math.max(520, Math.round(1180 - localGpu * 7 + maxConcurrent * 8 + (cloudHeavy ? 120 : -80)));
    const risk = selectedKbs.some((kb) => kb.includes("Contracts") || kb.includes("Finance")) && cloudHeavy
      ? "Governance risk"
      : projectedCost > monthlyBudget * 0.85
        ? "Cost risk"
        : localGpu < 12
          ? "Under-allocated"
          : "Healthy";
    const savings = Math.max(0, monthlyBudget - projectedCost);
    const governanceImpact = risk === "Governance risk" ? "Needs policy change" : "Improved";
    const recommendation = risk === "Governance risk"
      ? "Keep sensitive knowledge on local routes."
      : risk === "Cost risk"
        ? "Use cheaper models for routine work."
        : risk === "Under-allocated"
          ? "Add local capacity or reduce concurrency."
          : "The proposed plan is balanced.";
    return { projectedCost, expectedLatency, risk, savings, governanceImpact, recommendation };
  }, [allowedModels, localGpu, maxConcurrent, monthlyBudget, selectedKbs]);

  const matrix = activeMatrix === "Models"
    ? modelAccess
    : activeMatrix === "Knowledge Bases"
      ? kbAccess
      : activeMatrix === "Agents"
        ? agentAccess
        : workspaceAccess;
  const matrixColumns = activeMatrix === "Models"
    ? activeModelOptions
    : activeMatrix === "Knowledge Bases"
      ? knowledgeBases
      : activeMatrix === "Agents"
        ? agents
        : workspaces.map((workspace) => workspace.name);

  function toggleSelected(list: string[], item: string, setter: (value: string[]) => void) {
    setter(list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]);
  }

  function openSimulator(team = selectedTeam) {
    setSelectedTeam(team);
    setActiveTab("Simulator");
    window.history.replaceState(null, "", "#simulator");
  }

  function selectPlannerTab(tab: PlannerTab) {
    setActiveTab(tab);
    if (tab !== "Simulator" && window.location.hash === "#simulator") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  function saveSimulation() {
    showToast(`${selectedTeam} planner policy simulated`);
    addAudit("Resource planner simulation updated", selectedTeam, "Permission");
  }

  function applyTeamSuggestion() {
    const suggestedModels = teamSuggestion.models.filter((model) => activeModelOptions.includes(model));
    setMonthlyBudget(teamSuggestion.monthlyBudget);
    setLocalGpu(teamSuggestion.localGpu);
    setMaxConcurrent(teamSuggestion.maxConcurrent);
    setFallbackPolicy(teamSuggestion.fallbackPolicy);
    if (suggestedModels.length > 0) setAllowedModels(suggestedModels);
    setSelectedKbs(teamSuggestion.knowledgeBases);
    setAssignedAgents(teamSuggestion.agents);
    showToast(`${selectedTeam} resource suggestion loaded`);
    addAudit("Resource planner suggestion loaded", selectedTeam, "Permission");
  }

  function toggleMatrixAccess(team: string, item: string) {
    if (activeMatrix === "Models") setModelAccess((current) => toggleMatrix(current, team, item));
    if (activeMatrix === "Knowledge Bases") setKbAccess((current) => toggleMatrix(current, team, item));
    if (activeMatrix === "Agents") setAgentAccess((current) => toggleMatrix(current, team, item));
    if (activeMatrix === "Workspaces") setWorkspaceAccess((current) => toggleMatrix(current, team, item));
  }

  return (
    <>
      <PageHeader
        eyebrow="Optimize"
        title="Resource Planner"
        description="Plan capacity, cost, access, and governance changes by team."
        action={<ActionButton onClick={() => openSimulator()}>Run Simulator</ActionButton>}
      />
      <Section>
        <nav
          aria-label="Resource Planner sections"
          className="sticky top-[84px] z-10 mb-5 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-white/95 p-1.5 shadow-sm backdrop-blur xl:top-[65px]"
        >
          <div className="flex min-w-max gap-1">
            {plannerTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => selectPlannerTab(tab)}
                className={`min-h-9 rounded-md px-3.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${
                  activeTab === tab
                    ? "bg-[var(--brand-primary)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        {activeTab === "Summary" ? (
          <SummaryView
            onReview={() => {
              setReviewedRecommendation(recommendations[0]);
              setActiveTab("Recommendations");
            }}
            onSimulate={() => openSimulator("Claims")}
          />
        ) : null}

        {activeTab === "Recommendations" ? (
          <RecommendationView
            onReview={setReviewedRecommendation}
            onSimulate={(team) => openSimulator(team)}
          />
        ) : null}

        {activeTab === "Simulator" ? (
          <div id="simulator" className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <Card className="p-5">
              <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 md:flex-row md:items-start">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[var(--brand-primary)]">
                    <SlidersHorizontal size={15} /> Policy simulation
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">Current plan vs proposed plan</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">No allocation or policy changes are made.</p>
                </div>
                <ActionButton variant="secondary" onClick={applyTeamSuggestion}>Load recommendation</ActionButton>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
                  <div className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Current plan</div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <PlanStat label="GPU reserved" value={`${currentTeamCapacity}%`} />
                    <PlanStat label="GPU utilized" value={`${actualLocalUtilization[selectedTeam] ?? 0}%`} />
                    <PlanStat label="Fallback" value="Local first" />
                  </div>
                </div>
                <div className="rounded-md border border-[rgba(91,61,255,0.22)] bg-[rgba(91,61,255,0.06)] p-4">
                  <div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Proposed plan</div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <PlanStat label="GPU reserved" value={`${localGpu}%`} />
                    <PlanStat label="Concurrency" value={`${maxConcurrent}`} />
                    <PlanStat label="Budget" value={`AED ${monthlyBudget.toLocaleString()}`} />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-col justify-between gap-3 rounded-md border border-[rgba(91,61,255,0.20)] bg-[rgba(91,61,255,0.05)] p-3 md:flex-row md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{selectedTeam} recommended plan</span>
                    <StatusBadge value={teamSuggestion.status} />
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{teamSuggestion.reason}</p>
                </div>
                <span className="text-xs font-medium text-[var(--brand-primary-dark)]">{teamSuggestion.capacityAction}</span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Selected team">
                  <select value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-[var(--border-subtle)] bg-white px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]">
                    {teams.map((team) => <option key={team}>{team}</option>)}
                  </select>
                </Field>
                <Field label="Fallback policy">
                  <select value={fallbackPolicy} onChange={(event) => setFallbackPolicy(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-[var(--border-subtle)] bg-white px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]">
                    {fallbackPolicies.map((policy) => <option key={policy}>{policy}</option>)}
                  </select>
                </Field>
                <RangeField label={`Monthly budget: AED ${monthlyBudget.toLocaleString()}`} min={1000} max={30000} step={500} value={monthlyBudget} onChange={setMonthlyBudget} />
                <RangeField label={`Local GPU allocation: ${localGpu}%`} min={0} max={80} step={5} value={localGpu} onChange={setLocalGpu} />
                <RangeField label={`Max concurrent requests: ${maxConcurrent}`} min={2} max={80} step={2} value={maxConcurrent} onChange={setMaxConcurrent} />
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                <Selector title="Allowed models" icon={<BrainCircuit size={16} />} options={activeModelOptions} values={allowedModels} onToggle={(item) => toggleSelected(allowedModels, item, setAllowedModels)} />
                <Selector title="Knowledge bases" icon={<Database size={16} />} options={knowledgeBases} values={selectedKbs} onToggle={(item) => toggleSelected(selectedKbs, item, setSelectedKbs)} />
                <Selector title="Assigned agents" icon={<Bot size={16} />} options={agents} values={assignedAgents} onToggle={(item) => toggleSelected(assignedAgents, item, setAssignedAgents)} />
              </div>
            </Card>

            <Card className="h-fit p-5 xl:sticky xl:top-32">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Gauge size={18} className="text-[var(--brand-primary)]" />
                  <h2 className="font-semibold">Projected effect</h2>
                </div>
                <StatusBadge value={projected.risk} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <EffectStat label="Monthly cost" value={`AED ${projected.projectedCost.toLocaleString()}`} />
                <EffectStat label="Expected latency" value={`${projected.expectedLatency} ms`} />
                <EffectStat label="Savings" value={`AED ${projected.savings.toLocaleString()}`} />
                <EffectStat label="Capacity impact" value={overbookedCapacity ? `+${overbookedCapacity}% over` : `${unassignedCapacity}% free`} />
              </div>
              <div className="mt-3 rounded-md border border-[var(--border-subtle)] p-3">
                <div className="text-xs text-[var(--text-secondary)]">Governance readiness impact</div>
                <div className="mt-1 text-sm font-semibold">{projected.governanceImpact}</div>
              </div>
              <div className={`mt-3 rounded-md border p-3 text-sm leading-6 ${
                overbookedCapacity > 0
                  ? "border-amber-200 bg-amber-50 text-amber-950"
                  : "border-emerald-200 bg-emerald-50 text-emerald-950"
              }`}>
                <div className="font-semibold">Capacity decision</div>
                <div className="mt-1">{capacityDecision}</div>
              </div>
              <div className="mt-3 rounded-md bg-[rgba(91,61,255,0.07)] p-3 text-sm leading-6 text-[var(--brand-primary-dark)]">
                {projected.recommendation}
              </div>
              <div className="mt-4">
                <ActionButton onClick={saveSimulation}>Apply simulated plan</ActionButton>
              </div>
            </Card>
          </div>
        ) : null}

        {activeTab === "Team Usage" ? (
          <Card className="overflow-hidden">
            <div className="flex flex-col justify-between gap-2 border-b border-[var(--border-subtle)] px-5 py-4 md:flex-row md:items-center">
              <div>
                <h2 className="font-semibold">Team usage</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Compare demand, spend, allocation, and latency.</p>
              </div>
              <StatusBadge value="6 teams analyzed" />
            </div>
            <DataTable
              columns={["Team", "Active users", "Requests", "Tokens", "AI cost", "GPU allocation", "Cloud spend", "Avg latency", "Status", "Action"]}
              rows={teamUsage.map((item) => [
                <div key="team">
                  <div className="font-semibold">{item.team}</div>
                  <details className="mt-1 text-xs text-[var(--text-secondary)]">
                    <summary className="cursor-pointer">Peak window</summary>
                    <div className="mt-1">{item.peak}</div>
                  </details>
                </div>,
                item.users,
                item.requests,
                item.tokens,
                item.cost,
                item.gpu,
                item.cloud,
                item.latency,
                <StatusBadge key="status" value={item.status} />,
                <button key="action" type="button" onClick={() => openSimulator(item.team)} className="font-semibold text-[var(--brand-primary)] hover:underline">Plan</button>
              ])}
            />
          </Card>
        ) : null}

        {activeTab === "Access & Policies" ? (
          <div className="space-y-5">
            <Card className="overflow-hidden">
              <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-4 xl:flex-row xl:items-center">
                <div>
                  <h2 className="font-semibold">Access and policy assignments</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Changes update this mock session only.</p>
                </div>
                <div role="tablist" aria-label="Access matrices" className="flex overflow-x-auto rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1">
                  {matrixTabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={activeMatrix === tab}
                      onClick={() => setActiveMatrix(tab)}
                      className={`min-h-9 whitespace-nowrap rounded px-3 text-sm font-medium ${
                        activeMatrix === tab ? "bg-white text-[var(--brand-primary)] shadow-sm" : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-secondary)]">
                    <tr>
                      <th className="px-4 py-3">Team</th>
                      {matrixColumns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teams.map((team) => (
                      <tr key={team} className="hover:bg-[var(--surface-muted)]">
                        <td className="px-4 py-4 font-semibold">{team}</td>
                        {matrixColumns.map((column) => (
                          <td key={column} className="px-4 py-4">
                            <Toggle
                              enabled={hasAccess(matrix, team, column)}
                              label={`Toggle ${column} for ${team}`}
                              onClick={() => toggleMatrixAccess(team, column)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <Card className="p-5">
                <h2 className="font-semibold">Policy context</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {[
                    ["Sensitive legal work", "Qwen 32B first; Claude only for non-sensitive drafting"],
                    ["Claims workflows", "Qwen 32B only; no external fallback"],
                    ["Engineering code", "DeepSeek Coder, then Claude or GPT-5"],
                    ["Marketing drafting", "Gemini first; premium models by exception"]
                  ].map(([scenario, route]) => (
                    <div key={scenario} className="rounded-md border border-[var(--border-subtle)] p-3">
                      <div className="text-sm font-semibold">{scenario}</div>
                      <div className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{route}</div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-2 text-[var(--brand-primary)]">
                  <Users size={17} />
                  <h2 className="font-semibold text-[var(--text-primary)]">Team membership</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Invites and membership are managed in Teams.</p>
                <Link href="/dashboard/departments" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)] hover:underline">
                  Open Teams <ArrowRight size={15} />
                </Link>
              </Card>
            </div>
          </div>
        ) : null}

        {activeTab === "Evidence" ? (
          <div className="space-y-5">
            <Card className="overflow-hidden">
              <div className="flex flex-col justify-between gap-2 border-b border-[var(--border-subtle)] px-5 py-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-semibold">Governance evidence gaps</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Prioritize oversight, policy, audit, and change evidence.</p>
                </div>
                <StatusBadge value="5 open gaps" />
              </div>
              <DataTable
                columns={["Team", "Evidence signal", "Owner", "Status", "Next action"]}
                rows={evidenceSignals.map((item) => [
                  <span key="team" className="font-semibold">{item.team}</span>,
                  item.signal,
                  item.owner,
                  <StatusBadge key="status" value={item.status} />,
                  <button
                    key="action"
                    type="button"
                    onClick={() => showToast(`${item.team} evidence task opened`)}
                    className="font-semibold text-[var(--brand-primary)] hover:underline"
                  >
                    {item.next}
                  </button>
                ])}
              />
            </Card>
            <Card className="flex items-start gap-3 p-5">
              <FileCheck2 size={19} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" />
              <div>
                <h2 className="font-semibold">ISO/IEC 42001 readiness support</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Evidence readiness supports preparation; it does not mean certification.</p>
              </div>
            </Card>
          </div>
        ) : null}
      </Section>

      {reviewedRecommendation ? (
        <div className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm" role="presentation" onMouseDown={() => setReviewedRecommendation(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="recommendation-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="ml-auto flex h-full w-full max-w-lg flex-col border-l border-[var(--border-subtle)] bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] p-5">
              <div>
                <div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Recommendation detail</div>
                <h2 id="recommendation-title" className="mt-1 text-xl font-semibold">{reviewedRecommendation.title}</h2>
              </div>
              <button type="button" onClick={() => setReviewedRecommendation(null)} aria-label="Close recommendation" className="rounded-md p-2 text-slate-500 hover:bg-[var(--surface-muted)]">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center gap-2">
                <StatusBadge value={reviewedRecommendation.status} />
                <span className="text-sm text-[var(--text-secondary)]">{reviewedRecommendation.team}</span>
              </div>
              <DetailBlock label="Issue" value={reviewedRecommendation.issue} />
              <DetailBlock label="Recommended action" value={reviewedRecommendation.action} />
              <DetailBlock label="Projected impact" value={reviewedRecommendation.impact} />
              <DetailBlock label="Evidence" value={reviewedRecommendation.evidence} />
              <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                Simulated action only. Review capacity and policy effects before applying.
              </div>
            </div>
            <div className="flex gap-3 border-t border-[var(--border-subtle)] p-5">
              <ActionButton onClick={() => {
                setReviewedRecommendation(null);
                openSimulator(reviewedRecommendation.team);
              }}>Simulate plan</ActionButton>
              <ActionButton variant="secondary" onClick={() => setReviewedRecommendation(null)}>Close</ActionButton>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function SummaryView({ onReview, onSimulate }: { onReview: () => void; onSimulate: () => void }) {
  const metrics = [
    ["Potential savings", "AED 9,400", "Monthly opportunity"],
    ["Under-allocated", "1", "Claims needs capacity"],
    ["Over-allocated", "2", "Capacity can be reclaimed"],
    ["Governance risks", "1", "Legal routing"],
    ["ISO readiness gaps", "5", "Evidence tasks open"]
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(([label, value, detail]) => (
          <Card key={label} className="p-4">
            <div className="text-xs font-medium text-[var(--text-secondary)]">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
            <div className="mt-1 text-xs text-[var(--text-secondary)]">{detail}</div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-[rgba(91,61,255,0.25)]">
        <div className="grid gap-5 bg-[var(--surface-dark)] p-5 text-white xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[var(--brand-accent)]">
              <Lightbulb size={15} /> Top recommended action
            </div>
            <h2 className="mt-2 text-lg font-semibold">Rebalance local GPU before increasing Claims capacity</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Claims needs more local capacity, but GPU is already 100% assigned. Reclaim Finance capacity before adding load.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={onSimulate}>Run Simulator</ActionButton>
            <button type="button" onClick={onReview} className="min-h-10 rounded-md border border-white/20 px-3.5 text-sm font-medium text-white hover:bg-white/10">
              Review evidence
            </button>
          </div>
        </div>
        <div className="grid gap-px bg-[var(--border-subtle)] sm:grid-cols-3">
          <SummaryStat label="Local GPU assigned" value="100%" status="At capacity" />
          <SummaryStat label="Finance reclaimable" value="20%" status="Safe donor" />
          <SummaryStat label="Claims peak" value="92%" status="Action required" />
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Decision queue</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Six recommendations are ready for review.</p>
            </div>
            <StatusBadge value="3 require action" />
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {[
              ["Capacity", "Claims +25%", "Reclaim Finance first"],
              ["Cost", "AED 9,400", "Route routine work down"],
              ["Governance", "1 risk", "Keep Legal confidential work local"]
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-md border border-[var(--border-subtle)] p-3">
                <div className="text-xs text-[var(--text-secondary)]">{label}</div>
                <div className="mt-1 font-semibold">{value}</div>
                <div className="mt-1 text-xs text-[var(--text-secondary)]">{detail}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={17} className="text-[var(--brand-primary)]" />
            <h2 className="font-semibold">Planning signals</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Usage, cost, latency, GPU pressure, sensitivity, and evidence readiness shape each recommendation.</p>
        </Card>
      </div>
    </div>
  );
}

function RecommendationView({ onReview, onSimulate }: { onReview: (item: Recommendation) => void; onSimulate: (team: string) => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col justify-between gap-2 border-b border-[var(--border-subtle)] px-5 py-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-semibold">Recommendation queue</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Open details only when evidence is needed.</p>
        </div>
        <StatusBadge value="AED 9,400 potential savings" />
      </div>
      <DataTable
        columns={["Status", "Team", "Issue", "Recommended action", "Projected impact", "Actions"]}
        rows={recommendations.map((item) => [
          <StatusBadge key="status" value={item.status} />,
          <span key="team" className="font-semibold">{item.team}</span>,
          <span key="issue" className="block max-w-[230px]">{item.issue}</span>,
          <span key="action" className="block max-w-[280px]">{item.action}</span>,
          <span key="impact" className="font-medium text-[var(--brand-primary-dark)]">{item.impact}</span>,
          <div key="actions" className="flex gap-2">
            <button type="button" onClick={() => onReview(item)} className="font-semibold text-[var(--brand-primary)] hover:underline">Review</button>
            <button type="button" onClick={() => onSimulate(item.team)} className="font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Simulate</button>
          </div>
        ])}
      />
    </Card>
  );
}

function SummaryStat({ label, value, status }: { label: string; value: string; status: string }) {
  return (
    <div className="bg-white p-4">
      <div className="text-xs text-[var(--text-secondary)]">{label}</div>
      <div className="mt-1 flex items-end justify-between gap-3">
        <span className="text-xl font-semibold">{value}</span>
        <span className="text-xs font-medium text-[var(--text-secondary)]">{status}</span>
      </div>
    </div>
  );
}

function PlanStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-[var(--text-secondary)]">{label}</div>
      <div className="mt-1 break-words font-semibold">{value}</div>
    </div>
  );
}

function EffectStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border-subtle)] p-3">
      <div className="text-xs text-[var(--text-secondary)]">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-5">
      <div className="text-xs font-semibold uppercase text-[var(--text-secondary)]">{label}</div>
      <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">{value}</p>
    </div>
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

function RangeField({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (value: number) => void }) {
  return (
    <label className="text-sm font-medium text-[var(--text-secondary)]">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-[var(--brand-primary)]"
      />
    </label>
  );
}

function Selector({ title, icon, options, values, onToggle }: { title: string; icon: ReactNode; options: string[]; values: string[]; onToggle: (item: string) => void }) {
  return (
    <div className="rounded-md border border-[var(--border-subtle)] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">{icon}{title}</div>
      <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs font-medium ${
              values.includes(option)
                ? "border-[rgba(91,61,255,0.25)] bg-[rgba(91,61,255,0.07)] text-[var(--brand-primary-dark)]"
                : "border-[var(--border-subtle)] bg-white text-[var(--text-secondary)]"
            }`}
          >
            {option}
            <span className={`h-2.5 w-2.5 rounded-full ${values.includes(option) ? "bg-[var(--brand-primary)]" : "bg-slate-300"}`} />
          </button>
        ))}
        {options.length === 0 ? <div className="text-xs text-[var(--text-secondary)]">No active catalog items.</div> : null}
      </div>
    </div>
  );
}
