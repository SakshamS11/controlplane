"use client";

import { useState } from "react";
import { Copy, ExternalLink, Layers, LockKeyhole, MailPlus, Plus, Power, Save, ShieldCheck, Users } from "lucide-react";
import { ActionButton, Card, DataTable, Modal, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { departments as departmentOptions, workspaces as initialWorkspaces } from "@/lib/mock-data";

type Workspace = (typeof initialWorkspaces)[number];

const knowledgeOptions = ["Legal Contracts", "Claims SOPs", "Finance Policies", "Product FAQ", "Engineering Docs", "HR Policies", "Policy Documents", "Codebase Docs"];
const agentOptions = ["Claims Summary Agent", "Contract Review Agent", "Support Triage Agent", "Code Review Agent", "Finance Analysis Agent"];

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [name, setName] = useState("Legal AI Assistant");
  const [interfaceType, setInterfaceType] = useState("Open WebUI");
  const [launchUrl, setLaunchUrl] = useState("https://legal-ai.controlplane.example.com");
  const [publishStatus, setPublishStatus] = useState("Published");
  const [selectedModels, setSelectedModels] = useState(["Claude", "Qwen 32B"]);
  const [knowledge, setKnowledge] = useState(["Legal Contracts"]);
  const [departments, setDepartments] = useState(["Legal"]);
  const [agents, setAgents] = useState(["Contract Review Agent"]);
  const [routingPolicy, setRoutingPolicy] = useState("Legal confidential review");
  const [tokenBudget, setTokenBudget] = useState("2M tokens / month");
  const [externalRule, setExternalRule] = useState("Restricted for confidential matters");
  const { showToast, addAudit, modelCatalog } = useAppState();
  const activeModelOptions = modelCatalog.filter((model) => model.status === "Running" || model.status === "Connected").map((model) => model.name);

  function toggleValue(value: string, list: string[], setter: (items: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function copyWorkspaceUrl(workspace: Workspace) {
    navigator.clipboard?.writeText(workspace.launchUrl);
    showToast(`${workspace.name} URL copied`);
    addAudit("Workspace URL copied", workspace.name, "Permission");
  }

  function inviteWorkspace(workspace: Workspace) {
    showToast(`Invite flow opened for ${workspace.name}`);
    addAudit("Workspace invite opened", workspace.name, "Permission");
  }

  function loadWorkspace(workspace: Workspace) {
    setName(workspace.name);
    setInterfaceType(workspace.interface);
    setLaunchUrl(workspace.launchUrl);
    setPublishStatus(workspace.publishStatus);
    setSelectedModels(workspace.allowedModels);
    setKnowledge(workspace.knowledgeBases);
    setDepartments([workspace.department]);
    setAgents(workspace.agents);
    setRoutingPolicy(workspace.routingPolicy);
    setTokenBudget(workspace.tokenBudget);
    setExternalRule(workspace.externalRule);
    showToast(`${workspace.name} loaded for editing`);
    addAudit("AI workspace opened", workspace.name, "Permission");
  }

  function saveWorkspace() {
    const row: Workspace = {
      name,
      department: departments[0] ?? "Unassigned",
      interface: interfaceType,
      launchUrl,
      publishStatus,
      assignedUsers: departments.join(", "),
      allowedModels: selectedModels.filter((model) => activeModelOptions.includes(model)),
      knowledgeBases: knowledge,
      agents,
      routingPolicy,
      tokenBudget,
      externalRule,
      audit: "Enabled",
      status: externalRule.includes("Restricted") ? "Governance risk" : "Healthy"
    };
    setWorkspaces((current) => [row, ...current.filter((item) => item.name !== name)]);
    showToast(`${name} workspace saved`);
    addAudit("AI workspace saved", name, "Permission");
  }

  function togglePublish(workspace: Workspace) {
    const next = workspace.publishStatus === "Published" ? "Disabled" : "Published";
    if (next === "Disabled" && !window.confirm(`Disable ${workspace.name}? Users will lose access to this governed AI interface in the demo.`)) return;
    setWorkspaces((current) => current.map((item) => item.name === workspace.name ? { ...item, publishStatus: next, status: next === "Disabled" ? "Offline" : item.status } : item));
    showToast(`${workspace.name} ${next.toLowerCase()}`);
    addAudit("Workspace publish state changed", workspace.name, "Permission");
  }

  return (
    <>
      <PageHeader eyebrow="Workspaces" title="AI Workspaces" description="Create the interface users actually open, then govern its models, knowledge, agents, budget, routing, audit, and launch URL from the control plane." />
      <Section>
        <Card className="mb-5 p-5">
          <div className="grid gap-3 md:grid-cols-4">
            {["Create workspace", "Select interface", "Attach policy", "Publish to users"].map((step, index) => (
              <div key={step} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm">
                <span className="font-semibold text-[var(--brand-primary)]">{index + 1}. </span>{step}
              </div>
            ))}
          </div>
        </Card>
        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <Card className="p-5"><div className="flex items-center gap-3"><Layers className="text-cyan-700" size={20} /><div><div className="text-sm font-semibold">{workspaces.length} governed interfaces</div><div className="text-xs text-slate-500">Open WebUI, chat, or API</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><ExternalLink className="text-[var(--brand-primary)]" size={20} /><div><div className="text-sm font-semibold">3 published</div><div className="text-xs text-slate-500">Ready for users</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><LockKeyhole className="text-slate-700" size={20} /><div><div className="text-sm font-semibold">Knowledge scoped</div><div className="text-xs text-slate-500">Workspace and department</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" size={20} /><div><div className="text-sm font-semibold">Audit enabled</div><div className="text-xs text-slate-500">For launch and admin changes</div></div></div></Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Card id="workspace-form" className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><Plus size={15} /> Create or edit</div>
            <h2 className="mt-2 text-lg font-semibold">Workspace publishing workflow</h2>
            <p className="mt-1 text-sm text-slate-600">A workspace is the governed front door into Open WebUI, custom chat, or API-only access.</p>
            <div className="mt-5 space-y-4">
              <label className="text-sm font-medium text-slate-600">Workspace name
                <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-600">Interface
                  <select value={interfaceType} onChange={(event) => setInterfaceType(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                    <option>Open WebUI</option>
                    <option>Open WebUI / custom chat</option>
                    <option>Custom chat</option>
                    <option>API only</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-600">Publish status
                  <select value={publishStatus} onChange={(event) => setPublishStatus(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                    <option>Published</option>
                    <option>Draft</option>
                    <option>Disabled</option>
                  </select>
                </label>
              </div>
              <label className="text-sm font-medium text-slate-600">Launch URL
                <input value={launchUrl} onChange={(event) => setLaunchUrl(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <Checklist title="Allowed models" options={activeModelOptions} values={selectedModels} onToggle={(item) => toggleValue(item, selectedModels, setSelectedModels)} />
              <Checklist title="Knowledge bases" options={knowledgeOptions} values={knowledge} onToggle={(item) => toggleValue(item, knowledge, setKnowledge)} />
              <Checklist title="Departments" options={departmentOptions} values={departments} onToggle={(item) => toggleValue(item, departments, setDepartments)} />
              <Checklist title="Assigned agents" options={agentOptions} values={agents} onToggle={(item) => toggleValue(item, agents, setAgents)} />
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-600">Routing policy
                  <input value={routingPolicy} onChange={(event) => setRoutingPolicy(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
                </label>
                <label className="text-sm font-medium text-slate-600">Token budget
                  <input value={tokenBudget} onChange={(event) => setTokenBudget(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
                </label>
              </div>
              <label className="text-sm font-medium text-slate-600">External model rule
                <select value={externalRule} onChange={(event) => setExternalRule(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option>Restricted for confidential matters</option>
                  <option>Blocked</option>
                  <option>Allowed</option>
                  <option>Approval required</option>
                </select>
              </label>
              <ActionButton onClick={saveWorkspace}><Save size={14} /> Save and stage workspace</ActionButton>
            </div>
          </Card>

          <div className="space-y-6">
            <Card id="workspace-list" className="overflow-hidden">
              <DataTable
                columns={["Workspace", "Department", "Run location", "Interface", "Status", "Allowed models", "Knowledge", "Agents", "Budget", "Routing", "Audit/evidence", "Launch", "Invite", "Manage"]}
                rows={workspaces.map((workspace) => [
                  <span key="name" className="font-semibold">{workspace.name}</span>,
                  workspace.department,
                  workspace.interface.includes("Open WebUI") ? "Open WebUI URL" : workspace.interface === "API only" ? "API gateway" : "Custom chat URL",
                  workspace.interface,
                  <div key="status" className="space-y-1"><StatusBadge value={workspace.publishStatus} /><div><StatusBadge value={workspace.status} /></div></div>,
                  workspace.allowedModels.join(", "),
                  workspace.knowledgeBases.join(", "),
                  workspace.agents.join(", "),
                  workspace.tokenBudget,
                  workspace.routingPolicy,
                  <div key="audit" className="space-y-1"><StatusBadge value={workspace.audit} /><div className="text-xs text-slate-500">ISO evidence ready</div></div>,
                  <div key="launch" className="flex flex-wrap gap-2">
                    <ActionButton variant="secondary" onClick={() => setSelectedWorkspace(workspace)}><ExternalLink size={14} /> Launch</ActionButton>
                    <button onClick={() => copyWorkspaceUrl(workspace)} className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 hover:bg-slate-50" aria-label={`Copy ${workspace.name} URL`}><Copy size={14} /></button>
                  </div>,
                  <ActionButton key="invite" variant="secondary" onClick={() => inviteWorkspace(workspace)}><MailPlus size={14} /> Invite</ActionButton>,
                  <div key="manage" className="flex flex-wrap gap-2">
                    <ActionButton variant="secondary" onClick={() => loadWorkspace(workspace)}>Edit</ActionButton>
                    <button onClick={() => togglePublish(workspace)} className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 hover:bg-slate-50" aria-label={`Toggle ${workspace.name}`}><Power size={14} /></button>
                  </div>
                ])}
              />
            </Card>
            <Card id="workspace-auth" className="p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 text-cyan-700" size={20} />
                <div>
                  <h2 className="font-semibold">Workspace access boundary</h2>
                  <p className="mt-1 text-sm text-slate-600">The launch URL is not enough by itself. Access is decided by user, department, model, knowledge base, routing policy, and audit setting.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Users:</span> department and invite list</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Models:</span> active catalog models only</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Knowledge:</span> workspace-approved KBs only</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>
      {selectedWorkspace ? (
        <WorkspaceLaunchModal
          workspace={selectedWorkspace}
          onClose={() => setSelectedWorkspace(null)}
          onCopy={() => copyWorkspaceUrl(selectedWorkspace)}
          onInvite={() => inviteWorkspace(selectedWorkspace)}
          onPolicy={() => {
            showToast(`${selectedWorkspace.name} policy opened`);
            addAudit("Workspace policy opened", selectedWorkspace.name, "Permission");
          }}
        />
      ) : null}
    </>
  );
}

function WorkspaceLaunchModal({ workspace, onClose, onCopy, onInvite, onPolicy }: { workspace: Workspace; onClose: () => void; onCopy: () => void; onInvite: () => void; onPolicy: () => void }) {
  return (
    <Modal title={`Launch ${workspace.name}`} onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <div>
          <div className="text-xs font-semibold uppercase text-cyan-700">{workspace.interface}</div>
          <div className="mt-2 break-all rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">{workspace.launchUrl}</div>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <div className="text-xs text-slate-500">Status</div>
          <div className="mt-2 flex flex-wrap gap-2"><StatusBadge value={workspace.publishStatus} /><StatusBadge value={workspace.status} /></div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <InfoRow label="Users" value={workspace.assignedUsers} />
        <InfoRow label="Departments" value={workspace.department} />
        <InfoRow label="Allowed models" value={workspace.allowedModels.join(", ")} />
        <InfoRow label="Knowledge bases" value={workspace.knowledgeBases.join(", ")} />
        <InfoRow label="Agents" value={workspace.agents.join(", ")} />
        <InfoRow label="External rule" value={workspace.externalRule} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <a href={workspace.launchUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--brand-primary-dark)]"><ExternalLink size={14} /> Open workspace</a>
        <ActionButton variant="secondary" onClick={onCopy}><Copy size={14} /> Copy URL</ActionButton>
        <ActionButton variant="secondary" onClick={onInvite}><MailPlus size={14} /> Invite users</ActionButton>
        <ActionButton variant="secondary" onClick={onPolicy}><ShieldCheck size={14} /> Manage governance policy</ActionButton>
      </div>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-slate-200 p-3 text-sm"><div className="text-xs font-semibold uppercase text-slate-400">{label}</div><div className="mt-1 font-medium text-slate-900">{value}</div></div>;
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
