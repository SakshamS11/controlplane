"use client";

import { useState } from "react";
import { Layers, LockKeyhole, Plus, Save, ShieldCheck, Users } from "lucide-react";
import { ActionButton, Card, DataTable, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

const workspaceSeed = [
  {
    name: "Legal AI Assistant",
    interface: "Open WebUI",
    models: "Claude, Qwen Local",
    knowledge: "Legal Contracts",
    users: "Legal team",
    external: "Restricted for confidential matters",
    audit: "Enabled",
    status: "Governance risk"
  },
  {
    name: "Claims AI Assistant",
    interface: "Open WebUI",
    models: "Qwen Local, Llama Local",
    knowledge: "Claims SOPs, Policy Documents",
    users: "Claims department",
    external: "Blocked",
    audit: "Enabled",
    status: "Healthy"
  },
  {
    name: "Engineering Copilot",
    interface: "Open WebUI / custom chat",
    models: "GPT-5, Claude, DeepSeek Coder",
    knowledge: "Engineering Docs, Codebase Docs",
    users: "Engineering team",
    external: "Allowed",
    audit: "Enabled",
    status: "Healthy"
  },
  {
    name: "Finance AI Desk",
    interface: "Custom chat",
    models: "Qwen Local, Claude",
    knowledge: "Finance Policies",
    users: "Finance team",
    external: "Approval required",
    audit: "Enabled",
    status: "Healthy"
  }
];

const modelOptions = ["Qwen Local", "Llama Local", "DeepSeek Coder", "GPT-5", "Claude", "Gemini"];
const knowledgeOptions = ["Legal Contracts", "Claims SOPs", "Finance Policies", "Product FAQ", "Engineering Docs", "HR Policies"];
const departmentOptions = ["Legal", "Claims", "Engineering", "Finance", "Customer Support", "Marketing"];

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState(workspaceSeed);
  const [name, setName] = useState("Legal AI Assistant");
  const [interfaceType, setInterfaceType] = useState("Open WebUI");
  const [models, setModels] = useState(["Claude", "Qwen Local"]);
  const [knowledge, setKnowledge] = useState(["Legal Contracts"]);
  const [departments, setDepartments] = useState(["Legal"]);
  const [externalRule, setExternalRule] = useState("Restricted for confidential matters");
  const [usageLimit, setUsageLimit] = useState("2M tokens / month");
  const [fallbackPolicy, setFallbackPolicy] = useState("Qwen Local for confidential prompts");
  const { showToast, addAudit } = useAppState();

  function toggleValue(value: string, list: string[], setter: (items: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function saveWorkspace() {
    const row = {
      name,
      interface: interfaceType,
      models: models.join(", "),
      knowledge: knowledge.join(", "),
      users: departments.join(", "),
      external: externalRule,
      audit: "Enabled",
      status: externalRule.includes("Restricted") ? "Governance risk" : "Healthy"
    };
    setWorkspaces((current) => [row, ...current.filter((item) => item.name !== name)]);
    showToast(`${name} workspace saved`);
    addAudit("AI workspace saved", name, "Permission");
  }

  return (
    <>
      <PageHeader eyebrow="Workspaces" title="AI workspaces" description="Create team-specific AI experiences with approved interfaces, models, knowledge bases, users, external model rules, and audit logging." />
      <Section>
        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <Card className="p-5"><div className="flex items-center gap-3"><Layers className="text-cyan-700" size={20} /><div><div className="text-sm font-semibold">{workspaces.length} workspaces</div><div className="text-xs text-slate-500">Team AI surfaces</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><Users className="text-indigo-600" size={20} /><div><div className="text-sm font-semibold">6 departments</div><div className="text-xs text-slate-500">Mapped to access</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><LockKeyhole className="text-slate-700" size={20} /><div><div className="text-sm font-semibold">Knowledge scoped</div><div className="text-xs text-slate-500">Workspace and department</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" size={20} /><div><div className="text-sm font-semibold">Audit enabled</div><div className="text-xs text-slate-500">For every workspace change</div></div></div></Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><Plus size={15} /> Create or edit</div>
            <h2 className="mt-2 text-lg font-semibold">Workspace configuration</h2>
            <div className="mt-5 space-y-4">
              <label className="text-sm font-medium text-slate-600">Workspace name
                <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Interface
                <select value={interfaceType} onChange={(event) => setInterfaceType(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option>Open WebUI</option>
                  <option>Open WebUI / custom chat</option>
                  <option>Custom chat</option>
                  <option>API only</option>
                </select>
              </label>
              <Checklist title="Allowed models" options={modelOptions} values={models} onToggle={(item) => toggleValue(item, models, setModels)} />
              <Checklist title="Knowledge bases" options={knowledgeOptions} values={knowledge} onToggle={(item) => toggleValue(item, knowledge, setKnowledge)} />
              <Checklist title="Departments" options={departmentOptions} values={departments} onToggle={(item) => toggleValue(item, departments, setDepartments)} />
              <label className="text-sm font-medium text-slate-600">External model rule
                <select value={externalRule} onChange={(event) => setExternalRule(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option>Restricted for confidential matters</option>
                  <option>Blocked</option>
                  <option>Allowed</option>
                  <option>Approval required</option>
                </select>
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-600">Usage limit
                  <input value={usageLimit} onChange={(event) => setUsageLimit(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
                </label>
                <label className="text-sm font-medium text-slate-600">Fallback policy
                  <input value={fallbackPolicy} onChange={(event) => setFallbackPolicy(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
                </label>
              </div>
              <ActionButton onClick={saveWorkspace}><Save size={14} /> Save workspace</ActionButton>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <DataTable
                columns={["Workspace", "Interface", "Allowed models", "Knowledge", "Users", "External rules", "Status", "Action"]}
                rows={workspaces.map((workspace) => [
                  <span key="name" className="font-semibold">{workspace.name}</span>,
                  workspace.interface,
                  workspace.models,
                  workspace.knowledge,
                  workspace.users,
                  workspace.external,
                  <StatusBadge key="status" value={workspace.status} />,
                  <ActionButton key="edit" variant="secondary" onClick={() => {
                    setName(workspace.name);
                    setInterfaceType(workspace.interface);
                    setExternalRule(workspace.external);
                    showToast(`${workspace.name} loaded for editing`);
                    addAudit("AI workspace opened", workspace.name, "Permission");
                  }}>Edit</ActionButton>
                ])}
              />
            </Card>
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 text-cyan-700" size={20} />
                <div>
                  <h2 className="font-semibold">Authorized knowledge retrieval</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Each workspace resolves the user, department, allowed models, assigned knowledge bases, assigned agents, external model restrictions, and audit setting before any AI response is generated.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">User check:</span> member of assigned department</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Knowledge check:</span> workspace-approved KB only</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Audit:</span> every prompt, route, and admin change</div>
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

function Checklist({ title, options, values, onToggle }: { title: string; options: string[]; values: string[]; onToggle: (item: string) => void }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-slate-600">{title}</div>
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
