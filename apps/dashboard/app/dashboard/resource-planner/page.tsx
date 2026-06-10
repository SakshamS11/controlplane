"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Bot, BrainCircuit, Database, Gauge, Info, Lightbulb, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { ActionButton, Card, DataTable, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

const departments = ["Claims", "Legal", "Engineering", "Finance", "Customer Support", "Marketing"];
const knowledgeBases = ["Claims SOPs", "Legal Contracts", "HR Policies", "Finance Policies", "Product FAQ", "Engineering Docs"];
const agents = ["Claims Summary Agent", "Contract Review Agent", "Support Triage Agent", "Code Review Agent", "Finance Analysis Agent"];
const fallbackPolicies = ["Local first", "Cheapest cloud", "Best quality", "Sensitive data local only"];
const matrixTabs = ["Models", "Knowledge Bases", "Agents"] as const;
type MatrixTab = (typeof matrixTabs)[number];

const initialTeamMembers = {
  Claims: ["claims.lead@acme.ai", "adjuster.ops@acme.ai"],
  Legal: ["legal.counsel@acme.ai", "contracts@acme.ai"],
  Engineering: ["platform@acme.ai", "devlead@acme.ai"],
  Finance: ["finance.ops@acme.ai"],
  "Customer Support": ["support.lead@acme.ai", "triage@acme.ai"],
  Marketing: ["marketing.lead@acme.ai"]
};

const workspaces = [
  { name: "Legal AI Assistant", interface: "Open WebUI", models: "Claude, Qwen 32B", knowledge: "Legal Contracts", users: "Legal team", external: "Restricted for confidential matters", audit: "Enabled" },
  { name: "Claims AI Assistant", interface: "Open WebUI", models: "Qwen 32B, Llama 3.1 8B", knowledge: "Claims SOPs, Policy Documents", users: "Claims department", external: "Blocked", audit: "Enabled" },
  { name: "Engineering Copilot", interface: "Open WebUI / custom chat", models: "GPT-5, Claude, DeepSeek Coder", knowledge: "Engineering Docs, Codebase Docs", users: "Engineering team", external: "Allowed by policy", audit: "Enabled" },
  { name: "Finance AI Desk", interface: "Custom chat", models: "Qwen 32B", knowledge: "Finance Policies", users: "Finance team", external: "Restricted", audit: "Enabled" }
];

const knowledgeBaseDetails = [
  { name: "Legal Contracts", documents: "1,240", source: "SharePoint", sync: "Synced", index: "Ready", workspace: "Legal AI Assistant", departments: "Legal", access: "Legal only", lastSync: "12 minutes ago" },
  { name: "Claims SOPs", documents: "850", source: "S3 bucket", sync: "Synced", index: "Ready", workspace: "Claims AI Assistant", departments: "Claims", access: "Claims only", lastSync: "18 minutes ago" },
  { name: "Engineering Docs", documents: "2,100", source: "Google Drive", sync: "Syncing", index: "Rebuilding", workspace: "Engineering Copilot", departments: "Engineering", access: "Engineering only", lastSync: "4 minutes ago" },
  { name: "Finance Policies", documents: "410", source: "Uploaded documents", sync: "Synced", index: "Ready", workspace: "Finance AI Desk", departments: "Finance", access: "Finance only", lastSync: "1 hour ago" }
];

const customAgents = [
  { name: "Claims Summary Agent", departments: "Claims", models: "Qwen 32B", knowledge: "Claims SOPs, Policy Documents", tools: "Claim summary generator", approval: "Required before final decision", external: "Blocked", audit: "Enabled", limit: "12k tokens/request" },
  { name: "Contract Review Agent", departments: "Legal", models: "Qwen 32B, Claude", knowledge: "Legal Contracts", tools: "Clause extraction, risk flags", approval: "Required for confidential matters", external: "Restricted", audit: "Enabled", limit: "16k tokens/request" },
  { name: "Support Triage Agent", departments: "Customer Support", models: "Llama 3.1 8B, Gemini", knowledge: "Product FAQ", tools: "Ticket classification", approval: "Not required", external: "Allowed for non-sensitive", audit: "Enabled", limit: "8k tokens/request" },
  { name: "Code Review Agent", departments: "Engineering", models: "DeepSeek Coder, Claude", knowledge: "Engineering Docs", tools: "Code review checklist", approval: "Required before merge", external: "Allowed", audit: "Enabled", limit: "24k tokens/request" },
  { name: "Finance Analysis Agent", departments: "Finance", models: "Qwen 32B", knowledge: "Finance Policies", tools: "Variance analysis", approval: "Required", external: "Blocked", audit: "Enabled", limit: "8k tokens/request" }
];

const routingSuggestions = [
  { scenario: "Confidential legal task", route: "Qwen 32B first; Claude only for non-sensitive drafting", reason: "Prevents confidential contract retrieval from leaving approved boundaries." },
  { scenario: "Claims sensitive workflow", route: "Qwen 32B only", reason: "External models are blocked for Claims policy and claims documents." },
  { scenario: "Engineering code task", route: "DeepSeek Coder, then Claude or GPT-5", reason: "Balances coding quality, latency, and approved department access." },
  { scenario: "Marketing drafting", route: "Gemini first; GPT-5 only for executive content", reason: "Simple drafting can use a cheaper model while preserving high-quality fallback." }
];

const departmentSuggestions: Record<string, { monthlyBudget: number; localGpu: number; maxConcurrent: number; fallbackPolicy: string; models: string[]; knowledgeBases: string[]; agents: string[]; status: string; reason: string; capacityAction: string; costAction: string }> = {
  Claims: {
    monthlyBudget: 14200,
    localGpu: 36,
    maxConcurrent: 28,
    fallbackPolicy: "Sensitive data local only",
    models: ["Qwen 32B", "Llama 3.1 8B"],
    knowledgeBases: ["Claims SOPs"],
    agents: ["Claims Summary Agent"],
    status: "Under-allocated",
    reason: "Claims peaks during late morning, has rising queue wait time, and should keep sensitive claims workflows local.",
    capacityAction: "Reclaim 8% local GPU from Finance before increasing Claims allocation.",
    costAction: "Keep cloud spend capped and avoid external fallback for claims documents."
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
    reason: "Legal needs Claude for drafting, but confidential contract review should use local retrieval and local models.",
    capacityAction: "Reserve enough local capacity for confidential contract workflows.",
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
    reason: "Engineering has high volume but balanced latency and strong fit for coding-specialized routing.",
    capacityAction: "Keep current local allocation and prioritize code requests during build windows.",
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
    reason: "Finance has low actual local utilization compared with reserved capacity.",
    capacityAction: "Reduce reserved local GPU from 30% to 10% and make 20% available to Claims or Legal.",
    costAction: "Keep external model access restricted for finance policies."
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
    reason: "Support has repeated questions and benefits from cheaper routing, response caching, and Product FAQ access.",
    capacityAction: "Keep local allocation small and prioritize concurrency over large-model access.",
    costAction: "Route repeated or simple support traffic to Llama 3.1 8B or Gemini."
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
    reason: "Most Marketing usage is drafting and summarization, so GPT-5 full access is expensive for the workload.",
    capacityAction: "Do not reserve local GPU for Marketing until usage justifies it.",
    costAction: "Use Gemini for standard content and keep Claude for higher-risk copy review."
  }
};

const teamUsage = [
  { department: "Claims", users: 42, requests: "31,400", tokens: "8.7M", cost: "AED 3,900", peak: "10:00-13:00", gpu: "28%", cloud: "AED 880", latency: "940 ms", status: "Under-allocated" },
  { department: "Legal", users: 18, requests: "12,700", tokens: "3.1M", cost: "AED 3,100", peak: "14:00-17:00", gpu: "10%", cloud: "AED 2,420", latency: "1,040 ms", status: "Governance risk" },
  { department: "Engineering", users: 55, requests: "38,900", tokens: "11.2M", cost: "AED 4,600", peak: "15:00-20:00", gpu: "26%", cloud: "AED 1,700", latency: "780 ms", status: "Healthy" },
  { department: "Finance", users: 11, requests: "4,200", tokens: "1.4M", cost: "AED 690", peak: "09:00-11:00", gpu: "30%", cloud: "AED 210", latency: "720 ms", status: "Over-allocated" },
  { department: "Customer Support", users: 63, requests: "24,100", tokens: "5.2M", cost: "AED 1,850", peak: "11:00-18:00", gpu: "6%", cloud: "AED 430", latency: "620 ms", status: "Healthy" },
  { department: "Marketing", users: 14, requests: "8,900", tokens: "980K", cost: "AED 4,260", peak: "13:00-16:00", gpu: "0%", cloud: "AED 3,920", latency: "1,120 ms", status: "Cost risk" }
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

const recommendations = [
  { title: "Claims under-allocated", status: "Under-allocated", text: "Peak GPU utilization is 92% and queue wait time is rising. Recommend increasing local Qwen capacity, but only by reclaiming unused Finance capacity or adding one GPU replica." },
  { title: "Marketing over-spending", status: "Cost risk", text: "72% of Marketing requests are drafting/summarization. Recommend routing most traffic to a cheaper cloud model and reducing GPT-5 budget by AED 2,000/month." },
  { title: "Finance over-allocated", status: "Over-allocated", text: "Finance has 30% reserved local capacity but only 8% utilization. Recommend reducing reserved capacity to 10%." },
  { title: "Legal governance risk", status: "Governance risk", text: "Legal is using external Claude for confidential contract review. Recommend switching confidential workflows to Qwen 32B and keeping Claude only for non-sensitive drafting." },
  { title: "Customer Support cache opportunity", status: "Healthy", text: "Repeated queries represent 35% of support traffic. Recommend enabling response caching and attaching Product FAQ knowledge base." }
];

const initialModelAccess = {
  Claims: ["Qwen 32B", "Llama 3.1 8B"],
  Legal: ["Qwen 32B", "Claude"],
  Engineering: ["Qwen 32B", "Llama 3.1 8B", "DeepSeek Coder", "GPT-5", "Claude"],
  Finance: ["Qwen 32B"],
  "Customer Support": ["Llama 3.1 8B", "Gemini"],
  Marketing: ["GPT-5", "Claude", "Gemini"]
};

const initialKbAccess = {
  Claims: ["Claims SOPs", "Product FAQ"],
  Legal: ["Legal Contracts", "HR Policies"],
  Engineering: ["Engineering Docs", "Product FAQ"],
  Finance: ["Finance Policies", "HR Policies"],
  "Customer Support": ["Product FAQ", "Claims SOPs"],
  Marketing: ["Product FAQ"]
};

const initialAgentAccess = {
  Claims: ["Claims Summary Agent"],
  Legal: ["Contract Review Agent"],
  Engineering: ["Code Review Agent"],
  Finance: ["Finance Analysis Agent"],
  "Customer Support": ["Support Triage Agent"],
  Marketing: []
};

type Matrix = Record<string, string[]>;

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
    <button type="button" aria-label={label} onClick={onClick} className={`h-6 w-11 rounded-full p-1 transition ${enabled ? "bg-cyan-600" : "bg-slate-300"}`}>
      <span className={`block h-4 w-4 rounded-full bg-white transition ${enabled ? "translate-x-5" : ""}`} />
    </button>
  );
}

export default function ResourcePlannerPage() {
  const { showToast, addAudit, modelCatalog } = useAppState();
  const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>(initialTeamMembers);
  const [memberDepartment, setMemberDepartment] = useState("Claims");
  const [memberEmail, setMemberEmail] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("Claims");
  const [monthlyBudget, setMonthlyBudget] = useState(12000);
  const [localGpu, setLocalGpu] = useState(35);
  const [maxConcurrent, setMaxConcurrent] = useState(24);
  const [fallbackPolicy, setFallbackPolicy] = useState("Local first");
  const [allowedModels, setAllowedModels] = useState(["Qwen 32B", "Claude"]);
  const [selectedKbs, setSelectedKbs] = useState(["Claims SOPs"]);
  const [assignedAgents, setAssignedAgents] = useState(["Claims Summary Agent"]);
  const [activeMatrix, setActiveMatrix] = useState<MatrixTab>("Models");
  const [modelAccess, setModelAccess] = useState<Matrix>(initialModelAccess);
  const [kbAccess, setKbAccess] = useState<Matrix>(initialKbAccess);
  const [agentAccess, setAgentAccess] = useState<Matrix>(initialAgentAccess);
  const activeModelOptions = modelCatalog.filter((model) => model.status === "Running" || model.status === "Connected").map((model) => model.name);
  const departmentSuggestion = departmentSuggestions[selectedDepartment];
  const totalReserved = Object.values(currentReservedCapacity).reduce((sum, value) => sum + value, 0);
  const currentDepartmentCapacity = currentReservedCapacity[selectedDepartment] ?? 0;
  const proposedTotalReserved = totalReserved - currentDepartmentCapacity + localGpu;
  const unassignedCapacity = Math.max(0, 100 - proposedTotalReserved);
  const overbookedCapacity = Math.max(0, proposedTotalReserved - 100);
  const donorDepartments = departments
    .filter((department) => department !== selectedDepartment)
    .map((department) => ({
      department,
      reserved: currentReservedCapacity[department] ?? 0,
      utilized: actualLocalUtilization[department] ?? 0,
      reclaimable: Math.max(0, (currentReservedCapacity[department] ?? 0) - Math.max(10, actualLocalUtilization[department] ?? 0))
    }))
    .filter((department) => department.reclaimable > 0)
    .sort((a, b) => b.reclaimable - a.reclaimable);
  const totalReclaimable = donorDepartments.reduce((sum, department) => sum + department.reclaimable, 0);
  const capacityDecision = overbookedCapacity === 0
    ? `${unassignedCapacity}% capacity remains unassigned after this change. No department needs to be reduced.`
    : totalReclaimable >= overbookedCapacity
      ? `This change overbooks local capacity by ${overbookedCapacity}%. Reclaim ${overbookedCapacity}% from over-allocated teams before applying.`
      : `This change overbooks local capacity by ${overbookedCapacity}%, but only ${totalReclaimable}% looks safely reclaimable. Add GPU capacity or move demand to cloud credits.`;

  const projected = useMemo(() => {
    const cloudHeavy = allowedModels.includes("GPT-5") || allowedModels.includes("Claude");
    const projectedCost = Math.max(900, Math.round(monthlyBudget * (cloudHeavy ? 0.82 : 0.54) + maxConcurrent * 18 - localGpu * 22));
    const expectedLatency = Math.max(520, Math.round(1180 - localGpu * 7 + maxConcurrent * 8 + (cloudHeavy ? 120 : -80)));
    const risk = selectedKbs.some((kb) => kb.includes("Contracts") || kb.includes("Finance")) && cloudHeavy ? "Governance risk" : projectedCost > monthlyBudget * 0.85 ? "Cost risk" : localGpu < 12 ? "Under-allocated" : "Healthy";
    const recommendation = risk === "Governance risk"
      ? "Move sensitive workflows to local models or restrict confidential knowledge bases from cloud routes."
      : risk === "Cost risk"
        ? "Lower GPT-5/Claude usage or select cheapest-cloud fallback for non-sensitive work."
        : risk === "Under-allocated"
          ? "Increase local GPU allocation or reduce concurrent request limits for this department."
          : "Policy looks balanced for the selected usage and access profile.";
    return { projectedCost, expectedLatency, risk, recommendation };
  }, [allowedModels, localGpu, maxConcurrent, monthlyBudget, selectedKbs]);

  function toggleSelected(list: string[], item: string, setter: (value: string[]) => void) {
    setter(list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]);
  }

  function saveSimulation() {
    showToast(`${selectedDepartment} planner policy simulated`);
    addAudit("Resource planner simulation updated", selectedDepartment, "Permission");
  }

  function applyDepartmentSuggestion() {
    const activeSuggestedModels = departmentSuggestion.models.filter((model) => activeModelOptions.includes(model));
    setMonthlyBudget(departmentSuggestion.monthlyBudget);
    setLocalGpu(departmentSuggestion.localGpu);
    setMaxConcurrent(departmentSuggestion.maxConcurrent);
    setFallbackPolicy(departmentSuggestion.fallbackPolicy);
    setAllowedModels(activeSuggestedModels.length > 0 ? activeSuggestedModels : allowedModels);
    setSelectedKbs(departmentSuggestion.knowledgeBases);
    setAssignedAgents(departmentSuggestion.agents);
    showToast(`${selectedDepartment} resource suggestion applied`);
    addAudit("Resource planner suggestion applied", selectedDepartment, "Permission");
  }

  function addTeamMember() {
    const email = memberEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      showToast("Enter a valid team member email");
      return;
    }
    setTeamMembers((current) => ({
      ...current,
      [memberDepartment]: Array.from(new Set([...(current[memberDepartment] ?? []), email]))
    }));
    setMemberEmail("");
    showToast(`${email} added to ${memberDepartment}`);
    addAudit("Department member added", memberDepartment, "Permission");
  }

  function removeTeamMember(department: string, email: string) {
    setTeamMembers((current) => ({
      ...current,
      [department]: (current[department] ?? []).filter((member) => member !== email)
    }));
    showToast(`${email} removed from ${department}`);
    addAudit("Department member removed", department, "Permission");
  }

  const matrix = activeMatrix === "Models" ? modelAccess : activeMatrix === "Knowledge Bases" ? kbAccess : agentAccess;
  const matrixColumns = activeMatrix === "Models" ? activeModelOptions : activeMatrix === "Knowledge Bases" ? knowledgeBases : agents;

  function toggleMatrixAccess(department: string, item: string) {
    if (activeMatrix === "Models") {
      setModelAccess((current) => toggleMatrix(current, department, item));
      return;
    }
    if (activeMatrix === "Knowledge Bases") {
      setKbAccess((current) => toggleMatrix(current, department, item));
      return;
    }
    setAgentAccess((current) => toggleMatrix(current, department, item));
  }

  return (
    <>
      <PageHeader
        eyebrow="Resource Planner"
        title="AI Resource Planner"
        description="The planning engine that turns usage into recommendations for cost, capacity, model mix, knowledge access, agent access, and governance improvements."
      />
      <Section>
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card className="p-4"><div className="text-xs text-slate-500">Departments optimized</div><div className="mt-2 text-2xl font-semibold">6</div><div className="mt-1 text-xs text-slate-500">All active teams analyzed</div></Card>
          <Card className="p-4"><div className="text-xs text-slate-500">Potential savings</div><div className="mt-2 text-2xl font-semibold">AED 9,400</div><div className="mt-1 text-xs text-slate-500">Monthly estimated opportunity</div></Card>
          <Card className="p-4"><div className="text-xs text-slate-500">Under-allocated teams</div><div className="mt-2 text-2xl font-semibold">1</div><div className="mt-1 text-xs text-slate-500">Claims needs capacity</div></Card>
          <Card className="p-4"><div className="text-xs text-slate-500">Over-allocated teams</div><div className="mt-2 text-2xl font-semibold">2</div><div className="mt-1 text-xs text-slate-500">Finance and Marketing</div></Card>
          <Card className="p-4"><div className="text-xs text-slate-500">Governance risks</div><div className="mt-2 text-2xl font-semibold">1</div><div className="mt-1 text-xs text-slate-500">Legal confidential workflow</div></Card>
        </div>
        <Card className="mb-6 p-5">
          <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
            <div>
              <h2 className="font-semibold">Traffic Time Machine simulation</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Replay demand against alternate routing, semantic cache, budget circuit breakers, and local-model graduation. Your AI spend becomes an owned AI asset over time.</p>
            </div>
            <StatusBadge value="Healthy" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {["Model Graduation Flywheel", "Semantic Cache", "Budget Circuit Breakers", "ISO readiness recommendations"].map((item) => (
              <div key={item} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold">{item}</div>
            ))}
          </div>
        </Card>

        <Card id="usage" className="mb-6 overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold">Team usage overview</h2>
            <p className="mt-1 text-sm text-slate-500">Department-level demand, spend, latency, allocation posture, and governance risk in one planning view.</p>
          </div>
          <DataTable
            columns={["Department", "Active users", "Requests", "Tokens", "AI cost", "Peak window", "GPU allocation", "Cloud spend", "Avg latency", "Status"]}
            rows={teamUsage.map((team) => [
              <span key="department" className="font-semibold">{team.department}</span>,
              team.users,
              team.requests,
              team.tokens,
              team.cost,
              team.peak,
              team.gpu,
              team.cloud,
              team.latency,
              <StatusBadge key="status" value={team.status} />
            ])}
          />
        </Card>

        <div id="recommendations" className="mb-6 grid gap-4 xl:grid-cols-5">
          {recommendations.map((item) => (
            <Card key={item.title} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <Lightbulb className="text-cyan-700" size={19} />
                <StatusBadge value={item.status} />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </Card>
          ))}
        </div>

        <Card className="mb-6 p-5">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><Gauge size={15} /> Capacity balancing</div>
              <h2 className="mt-2 text-lg font-semibold">Local capacity is already 100% assigned</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">If one department gets more reserved GPU capacity, the product should either reduce another department's allocation or recommend adding capacity. This prevents the planner from making impossible recommendations.</p>
            </div>
            <StatusBadge value={overbookedCapacity > 0 ? "Warning" : "Healthy"} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <div className="rounded-md border border-slate-200 p-4"><div className="text-xs text-slate-500">Current assigned</div><div className="mt-1 text-2xl font-semibold">{totalReserved}%</div></div>
            <div className="rounded-md border border-slate-200 p-4"><div className="text-xs text-slate-500">Proposed assigned</div><div className="mt-1 text-2xl font-semibold">{proposedTotalReserved}%</div></div>
            <div className="rounded-md border border-slate-200 p-4"><div className="text-xs text-slate-500">Overbooked</div><div className="mt-1 text-2xl font-semibold">{overbookedCapacity}%</div></div>
            <div className="rounded-md border border-slate-200 p-4"><div className="text-xs text-slate-500">Safely reclaimable</div><div className="mt-1 text-2xl font-semibold">{totalReclaimable}%</div></div>
          </div>
          <div className={`mt-4 rounded-md border p-4 text-sm leading-6 ${overbookedCapacity > 0 ? "border-amber-200 bg-amber-50 text-amber-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>
            {capacityDecision}
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            {donorDepartments.slice(0, 3).map((department) => (
              <div key={department.department} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="font-semibold">{department.department}</div>
                <div className="mt-1 text-xs text-slate-500">Reserved {department.reserved}% / actual {department.utilized}% / reclaimable {department.reclaimable}%</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="mb-6 grid gap-6 xl:grid-cols-[420px_1fr]">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><ShieldCheck size={15} /> Teams and departments</div>
            <h2 className="mt-2 text-lg font-semibold">Add members by email</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Department membership drives workspace access, knowledge access, agent assignment, and capacity planning.</p>
            <label className="mt-5 block text-sm font-medium text-slate-600">Department
              <select value={memberDepartment} onChange={(event) => setMemberDepartment(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900">
                {departments.map((department) => <option key={department}>{department}</option>)}
              </select>
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-600">Member email
              <input value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} placeholder="name@company.com" className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
            </label>
            <ActionButton onClick={addTeamMember}>Add member</ActionButton>
          </Card>
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold">Users by department</h2>
              <p className="mt-1 text-sm text-slate-500">Local mock membership state. In production, this connects to organization identity and invites.</p>
            </div>
            <div className="grid gap-0 divide-y divide-slate-100 md:grid-cols-2 md:divide-x xl:grid-cols-3">
              {departments.map((department) => (
                <div key={department} className="p-4">
                  <div className="font-semibold">{department}</div>
                  <div className="mt-3 space-y-2">
                    {(teamMembers[department] ?? []).map((email) => (
                      <div key={email} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                        <span className="truncate">{email}</span>
                        <button onClick={() => removeTeamMember(department, email)} className="font-semibold text-red-700">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><BrainCircuit size={15} /> Model recommendation engine</div>
            <h2 className="mt-2 text-lg font-semibold">Suggested routes by task and sensitivity</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {routingSuggestions.map((item) => (
                <div key={item.scenario} className="rounded-md border border-slate-200 p-4">
                  <div className="text-sm font-semibold">{item.scenario}</div>
                  <div className="mt-2 rounded-md bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-900">{item.route}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.reason}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><SlidersHorizontal size={15} /> Routing controls</div>
            <h2 className="mt-2 text-lg font-semibold">Admin action model</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">When a provider is degraded, the product should let admins apply a routing policy, not just read a suggestion.</p>
            <div className="mt-4 space-y-3">
              <ActionButton onClick={() => { showToast("GPT-5 critical traffic routed to Claude"); addAudit("Routing policy changed", "GPT-5 fallback to Claude", "Model"); }}>Route GPT-5 critical traffic to Claude</ActionButton>
              <ActionButton variant="secondary" onClick={() => { showToast("GPT-5 sensitive traffic routed to Qwen 32B"); addAudit("Routing policy changed", "GPT-5 fallback to Qwen 32B", "Model"); }}>Route sensitive work to Qwen 32B</ActionButton>
            </div>
            <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-600">
              <li>Confirm fallback model is enabled.</li>
              <li>Select affected departments or workspaces.</li>
              <li>Apply fallback rule from GPT-5 to Claude/Qwen.</li>
              <li>Audit the policy change.</li>
            </ol>
          </Card>
        </div>

        <div id="simulator" className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><SlidersHorizontal size={15} /> Capacity policy simulator</div>
                <h2 className="mt-2 text-lg font-semibold">Tune policy and preview tradeoffs</h2>
              </div>
              <ActionButton variant="secondary" onClick={saveSimulation}>Save simulation</ActionButton>
            </div>

            <div className="mb-5 rounded-md border border-cyan-100 bg-cyan-50/70 p-4">
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-cyan-950">{selectedDepartment} auto-suggested resource plan</span>
                    <StatusBadge value={departmentSuggestion.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-cyan-900">{departmentSuggestion.reason}</p>
                </div>
                <ActionButton onClick={applyDepartmentSuggestion}>Apply suggestion</ActionButton>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-md border border-cyan-100 bg-white p-3">
                  <div className="text-xs text-slate-500">Budget / GPU / concurrency</div>
                  <div className="mt-1 text-sm font-semibold">AED {departmentSuggestion.monthlyBudget.toLocaleString()} / {departmentSuggestion.localGpu}% / {departmentSuggestion.maxConcurrent}</div>
                </div>
                <div className="rounded-md border border-cyan-100 bg-white p-3">
                  <div className="text-xs text-slate-500">Models</div>
                  <div className="mt-1 text-sm font-semibold">{departmentSuggestion.models.join(", ")}</div>
                </div>
                <div className="rounded-md border border-cyan-100 bg-white p-3">
                  <div className="text-xs text-slate-500">Knowledge and agents</div>
                  <div className="mt-1 text-sm font-semibold">{[...departmentSuggestion.knowledgeBases, ...departmentSuggestion.agents].join(", ") || "No agent required"}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-cyan-100 bg-white p-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-950">Capacity:</span> {departmentSuggestion.capacityAction}</div>
                <div className="rounded-md border border-cyan-100 bg-white p-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-950">Cost:</span> {departmentSuggestion.costAction}</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">Department
                <select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900">
                  {departments.map((department) => <option key={department}>{department}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600">Fallback policy
                <select value={fallbackPolicy} onChange={(event) => setFallbackPolicy(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900">
                  {fallbackPolicies.map((policy) => <option key={policy}>{policy}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600">Monthly budget: AED {monthlyBudget.toLocaleString()}
                <input type="range" min={1000} max={30000} step={500} value={monthlyBudget} onChange={(event) => setMonthlyBudget(Number(event.target.value))} className="mt-3 w-full accent-cyan-700" />
              </label>
              <label className="text-sm font-medium text-slate-600">Local GPU allocation: {localGpu}%
                <input type="range" min={0} max={80} step={5} value={localGpu} onChange={(event) => setLocalGpu(Number(event.target.value))} className="mt-3 w-full accent-cyan-700" />
              </label>
              <label className="text-sm font-medium text-slate-600">Max concurrent requests: {maxConcurrent}
                <input type="range" min={2} max={80} step={2} value={maxConcurrent} onChange={(event) => setMaxConcurrent(Number(event.target.value))} className="mt-3 w-full accent-cyan-700" />
              </label>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              <Selector title="Allowed models" icon={<BrainCircuit size={16} />} options={activeModelOptions} values={allowedModels} onToggle={(item) => toggleSelected(allowedModels, item, setAllowedModels)} />
              <Selector title="Knowledge bases" icon={<Database size={16} />} options={knowledgeBases} values={selectedKbs} onToggle={(item) => toggleSelected(selectedKbs, item, setSelectedKbs)} />
              <Selector title="Assigned agents" icon={<Bot size={16} />} options={agents} values={assignedAgents} onToggle={(item) => toggleSelected(assignedAgents, item, setAssignedAgents)} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3"><Gauge className="text-cyan-700" size={20} /><h2 className="font-semibold">Projected effect</h2></div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-md border border-slate-200 p-4"><div className="text-xs text-slate-500">Projected monthly cost</div><div className="mt-1 text-2xl font-semibold">AED {projected.projectedCost.toLocaleString()}</div></div>
              <div className="rounded-md border border-slate-200 p-4"><div className="text-xs text-slate-500">Expected latency</div><div className="mt-1 text-2xl font-semibold">{projected.expectedLatency} ms</div></div>
              <div className="rounded-md border border-slate-200 p-4"><div className="text-xs text-slate-500">Risk level</div><div className="mt-2"><StatusBadge value={projected.risk} /></div></div>
              <div className="rounded-md border border-cyan-100 bg-cyan-50 p-4 text-sm leading-6 text-cyan-900">{projected.recommendation}</div>
              <div className={`rounded-md border p-4 text-sm leading-6 ${overbookedCapacity > 0 ? "border-amber-200 bg-amber-50 text-amber-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>
                <div className="font-semibold">Capacity decision</div>
                <div className="mt-1">{capacityDecision}</div>
                {overbookedCapacity > 0 && totalReclaimable < overbookedCapacity ? (
                  <div className="mt-2">Recommended next step: add an on-prem GPU replica or increase cloud model credits for Claude/GPT fallback.</div>
                ) : null}
              </div>
            </div>
          </Card>
        </div>

        <Card id="access" className="mb-6 overflow-hidden">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="font-semibold">Access control matrix</h2>
              <p className="mt-1 text-sm text-slate-500">Toggle mock access by department. Changes update local state only.</p>
            </div>
            <div role="tablist" aria-label="Resource planner access matrices" className="grid grid-cols-3 rounded-md border border-slate-200 bg-slate-50 p-1">
              {matrixTabs.map((tab) => (
                <button key={tab} role="tab" aria-selected={activeMatrix === tab} onClick={() => setActiveMatrix(tab)} className={`min-h-9 rounded px-3 text-sm font-medium ${activeMatrix === tab ? "bg-slate-950 text-white" : "text-slate-600 hover:text-slate-950"}`}>{tab}</button>
              ))}
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Department</th>
                  {matrixColumns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((department) => (
                  <tr key={department}>
                    <td className="px-4 py-4 font-semibold">{department}</td>
                    {matrixColumns.map((column) => (
                      <td key={column} className="px-4 py-4">
                        <Toggle enabled={hasAccess(matrix, department, column)} label={`Toggle ${column} for ${department}`} onClick={() => toggleMatrixAccess(department, column)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mb-6 grid gap-6 xl:grid-cols-3">
          <Card className="p-5 xl:col-span-3">
            <h2 className="font-semibold">AI workspaces</h2>
            <p className="mt-1 text-sm text-slate-500">Workspaces bind interface, models, users, departments, knowledge bases, agents, fallback policy, and audit settings.</p>
            <div className="mt-4 grid gap-4 xl:grid-cols-4">
              {workspaces.map((workspace) => (
                <div key={workspace.name} className="rounded-md border border-slate-200 p-4">
                  <div className="font-semibold">{workspace.name}</div>
                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <div><span className="font-semibold text-slate-800">Interface:</span> {workspace.interface}</div>
                    <div><span className="font-semibold text-slate-800">Models:</span> {workspace.models}</div>
                    <div><span className="font-semibold text-slate-800">Knowledge:</span> {workspace.knowledge}</div>
                    <div><span className="font-semibold text-slate-800">Users:</span> {workspace.users}</div>
                    <div><span className="font-semibold text-slate-800">External:</span> {workspace.external}</div>
                    <div><span className="font-semibold text-slate-800">Audit:</span> {workspace.audit}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold">Knowledge base governance</h2>
              <p className="mt-1 text-sm text-slate-500">Retrieval should be filtered by department, workspace, and user permissions.</p>
            </div>
            <DataTable
              columns={["Knowledge base", "Docs", "Source", "Sync", "Index", "Workspace", "Access", "Last sync"]}
              rows={knowledgeBaseDetails.map((kb) => [
                <span key="name" className="font-semibold">{kb.name}</span>,
                kb.documents,
                kb.source,
                kb.sync,
                kb.index,
                kb.workspace,
                kb.access,
                kb.lastSync
              ])}
            />
          </Card>
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold">Custom agents</h2>
              <p className="mt-1 text-sm text-slate-500">Agents inherit department, model, knowledge, tool, approval, external model, and usage policies.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {customAgents.map((agent) => (
                <div key={agent.name} className="p-4">
                  <div className="font-semibold">{agent.name}</div>
                  <div className="mt-2 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                    <div><span className="font-semibold text-slate-800">Department:</span> {agent.departments}</div>
                    <div><span className="font-semibold text-slate-800">Models:</span> {agent.models}</div>
                    <div><span className="font-semibold text-slate-800">Knowledge:</span> {agent.knowledge}</div>
                    <div><span className="font-semibold text-slate-800">Tools:</span> {agent.tools}</div>
                    <div><span className="font-semibold text-slate-800">Approval:</span> {agent.approval}</div>
                    <div><span className="font-semibold text-slate-800">External:</span> {agent.external}</div>
                    <div><span className="font-semibold text-slate-800">Audit:</span> {agent.audit}</div>
                    <div><span className="font-semibold text-slate-800">Limit:</span> {agent.limit}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Info className="mt-1 text-cyan-700" size={20} />
            <div>
              <h2 className="font-semibold">Recommendation logic</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Recommendations are based on usage, cost, latency, GPU utilization, queue wait time, model sensitivity, knowledge access, and business priority.</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Mockup only: no real billing integration, no real GPU allocation, no real enforcement, and no backend is required.</p>
            </div>
          </div>
        </Card>
      </Section>
    </>
  );
}

function Selector({ title, icon, options, values, onToggle }: { title: string; icon: ReactNode; options: string[]; values: string[]; onToggle: (item: string) => void }) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">{icon}{title}</div>
      <div className="space-y-2">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => onToggle(option)} className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs font-medium ${values.includes(option) ? "border-cyan-200 bg-cyan-50 text-cyan-900" : "border-slate-200 bg-white text-slate-600"}`}>
            {option}
            <span className={`h-2.5 w-2.5 rounded-full ${values.includes(option) ? "bg-cyan-600" : "bg-slate-300"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
