"use client";

import { useState } from "react";
import { Bot, Boxes, CheckCircle2, LockKeyhole, Plus, ShieldCheck } from "lucide-react";
import { ActionButton, Card, DataTable, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

const agentSeed = [
  {
    name: "Claims Summary Agent",
    owner: "Claims Ops",
    department: "Claims",
    models: "Qwen 32B",
    knowledge: "Claims SOPs, Policy Documents",
    tools: "Claim summary generator",
    approval: "Required before final decision",
    external: "Blocked",
    usage: "25 concurrent requests",
    budget: "1.2M tokens/mo",
    mcp: "Claims tools MCP",
    killSwitch: "Armed",
    status: "Healthy"
  },
  {
    name: "Contract Review Agent",
    owner: "Legal Ops",
    department: "Legal",
    models: "Claude, Qwen 32B",
    knowledge: "Legal Contracts",
    tools: "Clause risk extractor, redline assistant",
    approval: "Required for confidential matters",
    external: "Restricted",
    usage: "8 concurrent requests",
    budget: "900K tokens/mo",
    mcp: "Legal review MCP",
    killSwitch: "Armed",
    status: "Governance risk"
  },
  {
    name: "Support Triage Agent",
    owner: "Support Ops",
    department: "Customer Support",
    models: "Llama 3.1 8B, Gemini",
    knowledge: "Product FAQ",
    tools: "Ticket classifier, response draft",
    approval: "Optional",
    external: "Allowed for non-sensitive tickets",
    usage: "40 concurrent requests",
    budget: "1.8M tokens/mo",
    mcp: "Ticketing MCP",
    killSwitch: "Armed",
    status: "Healthy"
  },
  {
    name: "Code Review Agent",
    owner: "Engineering",
    department: "Engineering",
    models: "DeepSeek Coder, Claude",
    knowledge: "Engineering Docs, Codebase Docs",
    tools: "Pull request reviewer",
    approval: "Required before merge",
    external: "Allowed",
    usage: "12 concurrent requests",
    budget: "2.4M tokens/mo",
    mcp: "Code review MCP",
    killSwitch: "Armed",
    status: "Healthy"
  },
  {
    name: "Finance Analysis Agent",
    owner: "Finance Ops",
    department: "Finance",
    models: "Qwen 32B",
    knowledge: "Finance Policies",
    tools: "Variance analysis",
    approval: "Required",
    external: "Approval required",
    usage: "6 concurrent requests",
    budget: "500K tokens/mo",
    mcp: "Finance tools MCP",
    killSwitch: "Armed",
    status: "Healthy"
  }
];

export default function AgentsPage() {
  const [agents, setAgents] = useState(agentSeed);
  const [name, setName] = useState("Claims Summary Agent");
  const [department, setDepartment] = useState("Claims");
  const [selectedModels, setSelectedModels] = useState(["Qwen 32B"]);
  const [knowledge, setKnowledge] = useState("Claims SOPs, Policy Documents");
  const [tools, setTools] = useState("Claim summary generator");
  const [approval, setApproval] = useState("Required before final decision");
  const [external, setExternal] = useState("Blocked");
  const [usage, setUsage] = useState("25 concurrent requests");
  const { showToast, addAudit, modelCatalog } = useAppState();
  const activeModelOptions = modelCatalog.filter((model) => model.status === "Running" || model.status === "Connected").map((model) => model.name);

  function saveAgent() {
    const row = { name, owner: department, department, models: selectedModels.join(", "), knowledge, tools, approval, external, usage, budget: "Mock budget", mcp: "Allowlisted MCP", killSwitch: "Armed", status: external === "Blocked" ? "Healthy" : external === "Restricted" ? "Governance risk" : "Healthy" };
    setAgents((current) => [row, ...current.filter((item) => item.name !== name)]);
    showToast(`${name} agent saved`);
    addAudit("Custom agent saved", name, "Permission");
  }

  return (
    <>
      <PageHeader eyebrow="Agents" title="Governed AI workers" description="Agents are controlled identities with owners, budgets, allowed models, knowledge, tools, approval rules, audit logs, and kill switches." />
      <Section>
        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <Card className="p-5"><div className="flex items-center gap-3"><Bot className="text-cyan-700" size={20} /><div><div className="text-sm font-semibold">{agents.length} governed identities</div><div className="text-xs text-slate-500">Owners and limits assigned</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><Boxes className="text-[var(--brand-primary)]" size={20} /><div><div className="text-sm font-semibold">5 tool/MCP groups</div><div className="text-xs text-slate-500">Allowlisted actions only</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={20} /><div><div className="text-sm font-semibold">Human approval</div><div className="text-xs text-slate-500">Per agent rule</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><ShieldCheck className="text-slate-700" size={20} /><div><div className="text-sm font-semibold">Audit enforced</div><div className="text-xs text-slate-500">Agent changes and usage</div></div></div></Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Card id="agent-form" className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><Plus size={15} /> Create or assign</div>
            <h2 className="mt-2 text-lg font-semibold">Agent command boundary</h2>
            <p className="mt-1 text-sm text-slate-600">Configure what the agent identity can know, which tools it can call, who owns it, and when a human must approve output.</p>
            <div className="mt-5 space-y-4">
              <label className="text-sm font-medium text-slate-600">Agent name
                <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-600">Department
                  <select value={department} onChange={(event) => setDepartment(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                    {["Claims", "Legal", "Engineering", "Finance", "Customer Support", "Marketing"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-600">Usage limit
                  <input value={usage} onChange={(event) => setUsage(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
                </label>
              </div>
              <ModelChecklist options={activeModelOptions} values={selectedModels} onToggle={(item) => setSelectedModels((current) => current.includes(item) ? current.filter((model) => model !== item) : [...current, item])} />
              <label className="text-sm font-medium text-slate-600">Allowed knowledge bases
                <input value={knowledge} onChange={(event) => setKnowledge(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Allowed tools
                <input value={tools} onChange={(event) => setTools(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Human approval rule
                <input value={approval} onChange={(event) => setApproval(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">External model restriction
                <select value={external} onChange={(event) => setExternal(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option>Blocked</option>
                  <option>Restricted</option>
                  <option>Allowed</option>
                  <option>Approval required</option>
                </select>
              </label>
              <ActionButton onClick={saveAgent}><Plus size={14} /> Save governed agent</ActionButton>
            </div>
          </Card>

          <div className="space-y-6">
            <Card id="agent-list" className="overflow-hidden">
              <DataTable
                columns={["Agent", "Owner", "Department", "Models", "Knowledge bases", "Tools/MCP", "Budget", "Human approval", "External models", "Usage", "Kill switch", "Risk", "Audit", "Action"]}
                rows={agents.map((agent) => [
                  <span key="name" className="font-semibold">{agent.name}</span>,
                  agent.owner,
                  agent.department,
                  agent.models,
                  agent.knowledge,
                  <span key="tools">{agent.tools}<span className="block text-xs text-slate-500">{agent.mcp}</span></span>,
                  agent.budget,
                  agent.approval,
                  agent.external,
                  agent.usage,
                  <StatusBadge key="kill" value={agent.killSwitch} />,
                  <StatusBadge key="status" value={agent.status} />,
                  <StatusBadge key="audit" value="Enabled" />,
                  <ActionButton key="action" variant="secondary" onClick={() => {
                    setName(agent.name);
                    setDepartment(agent.department);
                    setSelectedModels(agent.models.split(",").map((item) => item.trim()).filter(Boolean));
                    setKnowledge(agent.knowledge);
                    setTools(agent.tools);
                    setApproval(agent.approval);
                    setExternal(agent.external);
                    setUsage(agent.usage);
                    showToast(`${agent.name} loaded for editing`);
                    addAudit("Custom agent opened", agent.name, "Permission");
                  }}>Edit</ActionButton>
                ])}
              />
            </Card>
            <Card id="agent-safety" className="p-5">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-1 text-cyan-700" size={20} />
                <div>
                  <h2 className="font-semibold">Agent safety boundary</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Agents are never free-form automation. They inherit department policy, use allowlisted tools/MCP servers, respect budgets, and can be stopped with a kill switch.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Assigned users and departments</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Allowed models and knowledge</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Human approval rules</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Usage limits and audit logs</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm">MCP/tool governance</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Agent Command Center kill switch</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}

function ModelChecklist({ options, values, onToggle }: { options: string[]; values: string[]; onToggle: (item: string) => void }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-slate-600">Allowed models</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => onToggle(option)} className={`rounded-md border px-3 py-2 text-left text-sm ${values.includes(option) ? "border-cyan-200 bg-cyan-50 text-cyan-900" : "border-slate-200 bg-white text-slate-700"}`}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
