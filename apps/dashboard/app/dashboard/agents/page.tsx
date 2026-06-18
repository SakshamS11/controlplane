"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bot, Boxes, CheckCircle2, LockKeyhole, Plus, ShieldCheck } from "lucide-react";
import { ActionButton, Card, DataBoundaryChip, DataTable, Modal, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

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

function boundaryForAgent(agent: { external: string; models: string }) {
  if (agent.external === "Blocked") return "On-Prem / Sovereign" as const;
  if (agent.models.includes("Qwen") || agent.models.includes("Llama") || agent.models.includes("DeepSeek")) return "Private GPU Runtime" as const;
  return "External AI Provider" as const;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState(agentSeed);
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"agents" | "safety">("agents");
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

  useEffect(() => {
    function syncCreateAction() {
      if (window.location.hash === "#agent-form") setEditorOpen(true);
    }
    syncCreateAction();
    window.addEventListener("hashchange", syncCreateAction);
    return () => window.removeEventListener("hashchange", syncCreateAction);
  }, []);

  function saveAgent() {
    const row = { name, owner: department, department, models: selectedModels.join(", "), knowledge, tools, approval, external, usage, budget: "750K tokens/mo", mcp: "Allowlisted MCP", killSwitch: "Armed", status: external === "Blocked" ? "Healthy" : external === "Restricted" ? "Governance risk" : "Healthy" };
    setAgents((current) => [row, ...current.filter((item) => item.name !== name)]);
    showToast(`${name} agent saved`);
    addAudit("Custom agent saved", name, "Permission");
    setEditorOpen(false);
    window.history.replaceState(null, "", window.location.pathname);
  }

  function editAgent(agent: (typeof agentSeed)[number]) {
    setName(agent.name);
    setDepartment(agent.department);
    setSelectedModels(agent.models.split(",").map((item) => item.trim()).filter(Boolean));
    setKnowledge(agent.knowledge);
    setTools(agent.tools);
    setApproval(agent.approval);
    setExternal(agent.external);
    setUsage(agent.usage);
    setEditorOpen(true);
    showToast(`${agent.name} loaded for editing`);
    addAudit("Custom agent opened", agent.name, "Permission");
  }

  return (
    <>
      <PageHeader
        eyebrow="Agents"
        title="Governed AI workers"
        description="Control each agent's owner, access, tools, budget, approvals, and kill switch."
        action={<ActionButton onClick={() => setEditorOpen(true)}><Plus size={15} /> Create Agent</ActionButton>}
      />
      <Section>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-4"><div className="flex items-center gap-3"><Bot className="text-[var(--brand-accent)]" size={18} /><div><div className="text-sm font-semibold">{agents.length} governed identities</div><div className="text-xs text-slate-500">Owners and limits assigned</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><Boxes className="text-[var(--brand-primary)]" size={18} /><div><div className="text-sm font-semibold">5 tool/MCP groups</div><div className="text-xs text-slate-500">Allowlisted actions only</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={18} /><div><div className="text-sm font-semibold">Human approval</div><div className="text-xs text-slate-500">Per-agent rules</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><ShieldCheck className="text-slate-700" size={18} /><div><div className="text-sm font-semibold">Audit enforced</div><div className="text-xs text-slate-500">Changes and usage</div></div></div></Card>
        </div>

        <Card className="overflow-hidden">
          <div className="flex border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1.5">
            <button type="button" onClick={() => setActiveTab("agents")} className={`rounded-md px-3 py-2 text-xs font-medium ${activeTab === "agents" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-white"}`}>Agents</button>
            <button type="button" onClick={() => setActiveTab("safety")} className={`rounded-md px-3 py-2 text-xs font-medium ${activeTab === "safety" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-white"}`}>Safety &amp; Controls</button>
          </div>
          {activeTab === "agents" ? (
            <div id="agent-list">
              <DataTable
                columns={["Agent", "Owner / Team", "Models", "Data Boundary", "Human approval", "Kill switch", "Risk", "Action"]}
                rows={agents.map((agent) => [
                  <span key="name" className="font-semibold">{agent.name}</span>,
                  <span key="owner">{agent.owner}<span className="block text-xs text-slate-500">{agent.department}</span></span>,
                  agent.models,
                  <DataBoundaryChip key="boundary" value={boundaryForAgent(agent)} />,
                  agent.approval,
                  <StatusBadge key="kill" value={agent.killSwitch} />,
                  <StatusBadge key="status" value={agent.status} />,
                  <div key="action" className="flex flex-wrap gap-2">
                    <ActionButton variant="secondary" onClick={() => editAgent(agent)}>Edit</ActionButton>
                    {agent.status === "Governance risk" || agent.external.includes("Approval") ? <Link href="/dashboard/approval-inbox" className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 hover:bg-slate-50">Open approval</Link> : null}
                    {agent.status === "Governance risk" ? <Link href="/dashboard/recommendations" className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 hover:bg-slate-50">Open recommendation</Link> : null}
                  </div>
                ])}
              />
            </div>
          ) : (
            <div id="agent-safety" className="p-5">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-1 text-[var(--brand-primary)]" size={20} />
                <div>
                  <h2 className="font-semibold">Agent safety boundary</h2>
                  <p className="mt-2 text-sm text-slate-600">Agents use allowlisted tools, enforced budgets, approvals, and kill switches.</p>
                  <p className="mt-1 text-xs text-slate-500">External tool actions require approval, payload review, and audit recording before execution.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Assigned users and teams</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Allowed models and knowledge</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Human approval rules</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Usage limits and audit logs</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm">MCP/tool governance</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm">Agent Command Center kill switch</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </Section>
      {editorOpen ? (
        <Modal title="Create or edit governed agent" onClose={() => setEditorOpen(false)}>
          <div id="agent-form" className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <label className="text-sm font-medium text-slate-600">Agent name
              <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">Team
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
            <label className="text-sm font-medium text-slate-600">Allowed tools / MCP servers
              <input value={tools} onChange={(event) => setTools(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
            </label>
            <label className="text-sm font-medium text-slate-600">Human approval rule
              <input value={approval} onChange={(event) => setApproval(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
            </label>
            <label className="text-sm font-medium text-slate-600">External model restriction
              <select value={external} onChange={(event) => setExternal(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                <option>Blocked</option><option>Restricted</option><option>Allowed</option><option>Approval required</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <ActionButton variant="secondary" onClick={() => setEditorOpen(false)}>Cancel</ActionButton>
            <ActionButton onClick={saveAgent}><Plus size={14} /> Save agent</ActionButton>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function ModelChecklist({ options, values, onToggle }: { options: string[]; values: string[]; onToggle: (item: string) => void }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-slate-600">Allowed models</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => onToggle(option)} className={`rounded-md border px-3 py-2 text-left text-sm ${values.includes(option) ? "border-[rgba(91,61,255,0.24)] bg-[rgba(91,61,255,0.07)] text-[var(--brand-primary-dark)]" : "border-slate-200 bg-white text-slate-700"}`}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
