"use client";

import { useMemo, useState } from "react";
import { Bot, BrainCircuit, Database, Gauge, Info, Lightbulb, SlidersHorizontal } from "lucide-react";
import { ActionButton, Card, DataTable, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

const departments = ["Claims", "Legal", "Engineering", "Finance", "Customer Support", "Marketing"];
const models = ["Qwen Local", "Llama Local", "DeepSeek Coder", "GPT-5", "Claude", "Gemini"];
const knowledgeBases = ["Claims SOPs", "Legal Contracts", "HR Policies", "Finance Policies", "Product FAQ", "Engineering Docs"];
const agents = ["Claims Summary Agent", "Contract Review Agent", "Support Triage Agent", "Code Review Agent", "Finance Analysis Agent"];
const fallbackPolicies = ["Local first", "Cheapest cloud", "Best quality", "Sensitive data local only"];

const teamUsage = [
  { department: "Claims", users: 42, requests: "31,400", tokens: "8.7M", cost: "AED 3,900", peak: "10:00-13:00", gpu: "38%", cloud: "AED 880", latency: "940 ms", status: "Under-allocated" },
  { department: "Legal", users: 18, requests: "12,700", tokens: "3.1M", cost: "AED 3,100", peak: "14:00-17:00", gpu: "12%", cloud: "AED 2,420", latency: "1,040 ms", status: "Governance risk" },
  { department: "Engineering", users: 55, requests: "38,900", tokens: "11.2M", cost: "AED 4,600", peak: "15:00-20:00", gpu: "34%", cloud: "AED 1,700", latency: "780 ms", status: "Healthy" },
  { department: "Finance", users: 11, requests: "4,200", tokens: "1.4M", cost: "AED 690", peak: "09:00-11:00", gpu: "30%", cloud: "AED 210", latency: "720 ms", status: "Over-allocated" },
  { department: "Customer Support", users: 63, requests: "24,100", tokens: "5.2M", cost: "AED 1,850", peak: "11:00-18:00", gpu: "18%", cloud: "AED 430", latency: "620 ms", status: "Healthy" },
  { department: "Marketing", users: 14, requests: "8,900", tokens: "980K", cost: "AED 4,260", peak: "13:00-16:00", gpu: "4%", cloud: "AED 3,920", latency: "1,120 ms", status: "Cost risk" }
];

const recommendations = [
  { title: "Claims under-allocated", status: "Under-allocated", text: "Peak GPU utilization is 92% and queue wait time is rising. Recommend increasing local Qwen capacity by 25% or adding one additional replica." },
  { title: "Marketing over-spending", status: "Cost risk", text: "72% of Marketing requests are drafting/summarization. Recommend routing most traffic to a cheaper cloud model and reducing GPT-5 budget by AED 2,000/month." },
  { title: "Finance over-allocated", status: "Over-allocated", text: "Finance has 30% reserved local capacity but only 8% utilization. Recommend reducing reserved capacity to 10%." },
  { title: "Legal governance risk", status: "Governance risk", text: "Legal is using external Claude for confidential contract review. Recommend switching confidential workflows to Qwen Local and keeping Claude only for non-sensitive drafting." },
  { title: "Customer Support cache opportunity", status: "Healthy", text: "Repeated queries represent 35% of support traffic. Recommend enabling response caching and attaching Product FAQ knowledge base." }
];

const initialModelAccess = {
  Claims: ["Qwen Local", "Llama Local"],
  Legal: ["Qwen Local", "Claude"],
  Engineering: ["Qwen Local", "Llama Local", "DeepSeek Coder", "GPT-5", "Claude"],
  Finance: ["Qwen Local"],
  "Customer Support": ["Llama Local", "Gemini"],
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
  const { showToast, addAudit } = useAppState();
  const [selectedDepartment, setSelectedDepartment] = useState("Claims");
  const [monthlyBudget, setMonthlyBudget] = useState(12000);
  const [localGpu, setLocalGpu] = useState(35);
  const [maxConcurrent, setMaxConcurrent] = useState(24);
  const [fallbackPolicy, setFallbackPolicy] = useState("Local first");
  const [allowedModels, setAllowedModels] = useState(["Qwen Local", "Claude"]);
  const [selectedKbs, setSelectedKbs] = useState(["Claims SOPs"]);
  const [assignedAgents, setAssignedAgents] = useState(["Claims Summary Agent"]);
  const [activeMatrix, setActiveMatrix] = useState("Models");
  const [modelAccess, setModelAccess] = useState<Matrix>(initialModelAccess);
  const [kbAccess, setKbAccess] = useState<Matrix>(initialKbAccess);
  const [agentAccess, setAgentAccess] = useState<Matrix>(initialAgentAccess);

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

  const matrix = activeMatrix === "Models" ? modelAccess : activeMatrix === "Knowledge Bases" ? kbAccess : agentAccess;
  const matrixColumns = activeMatrix === "Models" ? models : activeMatrix === "Knowledge Bases" ? knowledgeBases : agents;
  const setMatrix = activeMatrix === "Models" ? setModelAccess : activeMatrix === "Knowledge Bases" ? setKbAccess : setAgentAccess;

  return (
    <>
      <PageHeader
        eyebrow="Resource Planner"
        title="Department AI capacity planner"
        description="Recommend AI capacity, budget, model access, knowledge access, and agent access by department based on usage, cost, latency, GPU utilization, and governance risk."
      />
      <Section>
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card className="p-4"><div className="text-xs text-slate-500">Departments optimized</div><div className="mt-2 text-2xl font-semibold">6</div><div className="mt-1 text-xs text-slate-500">All active teams analyzed</div></Card>
          <Card className="p-4"><div className="text-xs text-slate-500">Potential savings</div><div className="mt-2 text-2xl font-semibold">AED 9,400</div><div className="mt-1 text-xs text-slate-500">Monthly estimated opportunity</div></Card>
          <Card className="p-4"><div className="text-xs text-slate-500">Under-allocated teams</div><div className="mt-2 text-2xl font-semibold">1</div><div className="mt-1 text-xs text-slate-500">Claims needs capacity</div></Card>
          <Card className="p-4"><div className="text-xs text-slate-500">Over-allocated teams</div><div className="mt-2 text-2xl font-semibold">2</div><div className="mt-1 text-xs text-slate-500">Finance and Marketing</div></Card>
          <Card className="p-4"><div className="text-xs text-slate-500">Governance risks</div><div className="mt-2 text-2xl font-semibold">1</div><div className="mt-1 text-xs text-slate-500">Legal confidential workflow</div></Card>
        </div>

        <Card className="mb-6 overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold">Team usage overview</h2>
            <p className="mt-1 text-sm text-slate-500">Department-level demand, spend, latency, and allocation posture.</p>
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

        <div className="mb-6 grid gap-4 xl:grid-cols-5">
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

        <div className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><SlidersHorizontal size={15} /> Capacity policy simulator</div>
                <h2 className="mt-2 text-lg font-semibold">Tune department policy and preview impact</h2>
              </div>
              <ActionButton variant="secondary" onClick={saveSimulation}>Save simulation</ActionButton>
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
              <Selector title="Allowed models" icon={<BrainCircuit size={16} />} options={models} values={allowedModels} onToggle={(item) => toggleSelected(allowedModels, item, setAllowedModels)} />
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
            </div>
          </Card>
        </div>

        <Card className="mb-6 overflow-hidden">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="font-semibold">Access control matrix</h2>
              <p className="mt-1 text-sm text-slate-500">Toggle mock access by department. Changes update local state only.</p>
            </div>
            <div role="tablist" aria-label="Resource planner access matrices" className="grid grid-cols-3 rounded-md border border-slate-200 bg-slate-50 p-1">
              {["Models", "Knowledge Bases", "Agents"].map((tab) => (
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
                        <Toggle enabled={hasAccess(matrix, department, column)} label={`Toggle ${column} for ${department}`} onClick={() => setMatrix(toggleMatrix(matrix, department, column))} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

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
