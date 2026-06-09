"use client";

import { useState } from "react";
import { Bot, Boxes, CheckCircle2, LockKeyhole, Plus, ShieldCheck } from "lucide-react";
import { ActionButton, Card, DataTable, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

const agentSeed = [
  {
    name: "Claims Summary Agent",
    department: "Claims",
    models: "Qwen Local",
    knowledge: "Claims SOPs, Policy Documents",
    tools: "Claim summary generator",
    approval: "Required before final decision",
    external: "Blocked",
    usage: "25 concurrent requests",
    status: "Healthy"
  },
  {
    name: "Contract Review Agent",
    department: "Legal",
    models: "Claude, Qwen Local",
    knowledge: "Legal Contracts",
    tools: "Clause risk extractor, redline assistant",
    approval: "Required for confidential matters",
    external: "Restricted",
    usage: "8 concurrent requests",
    status: "Governance risk"
  },
  {
    name: "Support Triage Agent",
    department: "Customer Support",
    models: "Llama Local, Gemini",
    knowledge: "Product FAQ",
    tools: "Ticket classifier, response draft",
    approval: "Optional",
    external: "Allowed for non-sensitive tickets",
    usage: "40 concurrent requests",
    status: "Healthy"
  },
  {
    name: "Code Review Agent",
    department: "Engineering",
    models: "DeepSeek Coder, Claude",
    knowledge: "Engineering Docs, Codebase Docs",
    tools: "Pull request reviewer",
    approval: "Required before merge",
    external: "Allowed",
    usage: "12 concurrent requests",
    status: "Healthy"
  },
  {
    name: "Finance Analysis Agent",
    department: "Finance",
    models: "Qwen Local",
    knowledge: "Finance Policies",
    tools: "Variance analysis",
    approval: "Required",
    external: "Approval required",
    usage: "6 concurrent requests",
    status: "Healthy"
  }
];

export default function AgentsPage() {
  const [agents, setAgents] = useState(agentSeed);
  const [name, setName] = useState("Claims Summary Agent");
  const [department, setDepartment] = useState("Claims");
  const [models, setModels] = useState("Qwen Local");
  const [knowledge, setKnowledge] = useState("Claims SOPs, Policy Documents");
  const [tools, setTools] = useState("Claim summary generator");
  const [approval, setApproval] = useState("Required before final decision");
  const [external, setExternal] = useState("Blocked");
  const [usage, setUsage] = useState("25 concurrent requests");
  const { showToast, addAudit } = useAppState();

  function saveAgent() {
    const row = { name, department, models, knowledge, tools, approval, external, usage, status: external === "Blocked" ? "Healthy" : external === "Restricted" ? "Governance risk" : "Healthy" };
    setAgents((current) => [row, ...current.filter((item) => item.name !== name)]);
    showToast(`${name} agent saved`);
    addAudit("Custom agent saved", name, "Permission");
  }

  return (
    <>
      <PageHeader eyebrow="Agents" title="Custom agent assignment" description="Create or assign agents to departments with allowed models, knowledge bases, tools, human approval, external model restrictions, audit logging, and usage limits." />
      <Section>
        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <Card className="p-5"><div className="flex items-center gap-3"><Bot className="text-cyan-700" size={20} /><div><div className="text-sm font-semibold">{agents.length} agents</div><div className="text-xs text-slate-500">Assigned by department</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><Boxes className="text-indigo-600" size={20} /><div><div className="text-sm font-semibold">5 tool groups</div><div className="text-xs text-slate-500">Allowlisted actions</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={20} /><div><div className="text-sm font-semibold">Human approval</div><div className="text-xs text-slate-500">Per agent rule</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><ShieldCheck className="text-slate-700" size={20} /><div><div className="text-sm font-semibold">Audit enforced</div><div className="text-xs text-slate-500">Agent changes and usage</div></div></div></Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Card id="agent-form" className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><Plus size={15} /> Create or assign</div>
            <h2 className="mt-2 text-lg font-semibold">Agent configuration</h2>
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
              <label className="text-sm font-medium text-slate-600">Allowed models
                <input value={models} onChange={(event) => setModels(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
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
              <ActionButton onClick={saveAgent}><Plus size={14} /> Save agent</ActionButton>
            </div>
          </Card>

          <div className="space-y-6">
            <Card id="agent-list" className="overflow-hidden">
              <DataTable
                columns={["Agent", "Department", "Models", "Knowledge bases", "Tools", "Human approval", "External models", "Usage", "Status", "Action"]}
                rows={agents.map((agent) => [
                  <span key="name" className="font-semibold">{agent.name}</span>,
                  agent.department,
                  agent.models,
                  agent.knowledge,
                  agent.tools,
                  agent.approval,
                  agent.external,
                  agent.usage,
                  <StatusBadge key="status" value={agent.status} />,
                  <ActionButton key="action" variant="secondary" onClick={() => {
                    setName(agent.name);
                    setDepartment(agent.department);
                    setModels(agent.models);
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
                  <p className="mt-2 text-sm leading-6 text-slate-600">Agents inherit the same model, knowledge, budget, and audit boundaries as their assigned department. Tools are allowlisted and sensitive outcomes can require human approval before final action.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Assigned users and departments</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Allowed models and knowledge</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Human approval rules</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Usage limits and audit logs</div>
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
