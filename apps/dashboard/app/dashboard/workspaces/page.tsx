"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, ExternalLink, Layers, LockKeyhole, Plus, Power, Save, Server, ShieldCheck } from "lucide-react";
import { ActionButton, Card, DataTable, Modal, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { departments as departmentOptions, targets, workspaces as initialWorkspaces } from "@/lib/mock-data";

type Workspace = (typeof initialWorkspaces)[number];

const knowledgeOptions = ["Legal Contracts", "Claims SOPs", "Finance Policies", "Product FAQ", "Engineering Docs", "HR Policies", "Policy Documents", "Codebase Docs"];
const agentOptions = ["Claims Summary Agent", "Contract Review Agent", "Support Triage Agent", "Code Review Agent", "Finance Analysis Agent"];
const companyDomain = "acme.ai";

function slugFromWorkspaceName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-assistant$/, "")
    .slice(0, 48) || "workspace";
}

function subdomainFromWorkspace(workspace: Workspace) {
  try {
    const host = new URL(workspace.launchUrl).hostname;
    if (host.startsWith("chat.")) return host.split(".")[1] ?? slugFromWorkspaceName(workspace.name);
  } catch {
    // Fall back to workspace name when old mock URLs are present.
  }
  return slugFromWorkspaceName(workspace.name);
}

function workspaceUrl(subdomain: string) {
  return `https://chat.${subdomain}.${companyDomain}`;
}

function displayUrl(subdomain: string) {
  return `chat.${subdomain}.${companyDomain}`;
}

function workspaceDisplayStatus(workspace: Workspace) {
  if (workspace.publishStatus === "Disabled" || workspace.status === "Offline") return "Disabled";
  if (workspace.publishStatus === "Draft") return "Draft";
  if (workspace.publishStatus === "Deployment Pending" || workspace.publishStatus === "Pending approval" || workspace.status === "Deploying") return "Deploying";
  if (workspace.publishStatus === "Published") return "Live";
  return workspace.publishStatus;
}

function deploymentStatusFor(status: string) {
  if (status === "Live") return "Live";
  if (status === "Disabled" || status === "Draft") return "Pending";
  if (status === "Deploying") return "In Progress";
  return "Pending";
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [disableWorkspace, setDisableWorkspace] = useState<Workspace | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"workspaces" | "boundary">("workspaces");
  const [managementTab, setManagementTab] = useState<"Configuration" | "Deployment" | "Usage">("Configuration");
  const [name, setName] = useState("Legal AI Assistant");
  const [interfaceType, setInterfaceType] = useState("Open WebUI");
  const [subdomain, setSubdomain] = useState("legal-ai");
  const [targetServer, setTargetServer] = useState("Acme Azure GPU Server");
  const [publishStatus, setPublishStatus] = useState("Published");
  const [selectedModels, setSelectedModels] = useState(["Claude", "Qwen 32B"]);
  const [knowledge, setKnowledge] = useState(["Legal Contracts"]);
  const [departments, setDepartments] = useState(["Legal"]);
  const [agents, setAgents] = useState(["Contract Review Agent"]);
  const [routingPolicy, setRoutingPolicy] = useState("Legal confidential review");
  const [tokenBudget, setTokenBudget] = useState("2M tokens / month");
  const [externalRule, setExternalRule] = useState("Restricted for confidential matters");
  const [targetServers, setTargetServers] = useState<Record<string, string>>({
    "Legal AI Assistant": "Acme Azure GPU Server",
    "Claims AI Assistant": "Claims On-Prem Node",
    "Engineering Copilot": "AWS Private AI Node",
    "Finance AI Desk": "Acme Azure GPU Server"
  });
  const { showToast, addAudit, modelCatalog } = useAppState();
  const activeModelOptions = modelCatalog.filter((model) => model.status === "Running" || model.status === "Connected").map((model) => model.name);
  const onlineTargets = targets.filter((target) => target.agent === "Online");

  useEffect(() => {
    function syncCreateAction() {
      if (window.location.hash === "#workspace-form") setEditorOpen(true);
    }
    syncCreateAction();
    window.addEventListener("hashchange", syncCreateAction);
    return () => window.removeEventListener("hashchange", syncCreateAction);
  }, []);

  function toggleValue(value: string, list: string[], setter: (items: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function copyCurrentWorkspaceUrl() {
    navigator.clipboard?.writeText(workspaceUrl(subdomain));
    showToast(`${displayUrl(subdomain)} copied`);
    addAudit("Workspace employee link copied", name, "Permission");
  }

  function loadWorkspace(workspace: Workspace) {
    setName(workspace.name);
    setInterfaceType(workspace.interface);
    setSubdomain(subdomainFromWorkspace(workspace));
    setTargetServer(targetServers[workspace.name] ?? onlineTargets[0]?.name ?? "No online server");
    setPublishStatus(workspace.publishStatus);
    setSelectedModels(workspace.allowedModels);
    setKnowledge(workspace.knowledgeBases);
    setDepartments([workspace.department]);
    setAgents(workspace.agents);
    setRoutingPolicy(workspace.routingPolicy);
    setTokenBudget(workspace.tokenBudget);
    setExternalRule(workspace.externalRule);
    setManagementTab("Configuration");
    setEditorOpen(true);
    showToast(`${workspace.name} loaded for editing`);
    addAudit("AI workspace opened", workspace.name, "Permission");
  }

  function saveWorkspace() {
    const savedPublishStatus = interfaceType === "Open WebUI" ? "Deployment Pending" : publishStatus;
    const row: Workspace = {
      name,
      department: departments[0] ?? "Unassigned",
      interface: interfaceType,
      launchUrl: workspaceUrl(subdomain),
      publishStatus: savedPublishStatus,
      assignedUsers: departments.join(", "),
      allowedModels: selectedModels.filter((model) => activeModelOptions.includes(model)),
      knowledgeBases: knowledge,
      agents,
      routingPolicy,
      tokenBudget,
      externalRule,
      audit: "Enabled",
      status: interfaceType === "Open WebUI" ? "Deploying" : externalRule.includes("Restricted") ? "Governance risk" : "Healthy"
    };
    setWorkspaces((current) => [row, ...current.filter((item) => item.name !== name)]);
    setTargetServers((current) => ({ ...current, [name]: targetServer }));
    showToast(interfaceType === "Open WebUI" ? `${name} Open WebUI deployment pending` : `${name} workspace saved`);
    addAudit("AI workspace saved", name, "Permission");
    setEditorOpen(false);
    window.history.replaceState(null, "", window.location.pathname);
  }

  function openCreateWorkspace() {
    setName("New AI Workspace");
    setSubdomain(slugFromWorkspaceName("New AI Workspace"));
    setTargetServer(onlineTargets[0]?.name ?? "No online server");
    setInterfaceType("Open WebUI");
    setPublishStatus("Draft");
    setSelectedModels(activeModelOptions.slice(0, 1));
    setKnowledge([]);
    setDepartments([]);
    setAgents([]);
    setManagementTab("Configuration");
    setEditorOpen(true);
  }

  function updateWorkspaceName(value: string) {
    setName(value);
    setSubdomain(slugFromWorkspaceName(value));
  }

  function togglePublish(workspace: Workspace) {
    const next = workspace.publishStatus === "Published" ? "Disabled" : "Published";
    if (next === "Disabled") {
      setDisableWorkspace(workspace);
      return;
    }
    if (next === "Published") {
      setWorkspaces((current) => current.map((item) => item.name === workspace.name ? { ...item, publishStatus: "Pending approval", status: "Pending approval" } : item));
      showToast(`Approval requested for ${workspace.name}`);
      addAudit("Workspace publishing approval requested", workspace.name, "Permission");
    }
  }

  function confirmDisableWorkspace() {
    if (!disableWorkspace) return;
    setWorkspaces((current) => current.map((item) => item.name === disableWorkspace.name ? { ...item, publishStatus: "Disabled", status: "Offline" } : item));
    showToast(`${disableWorkspace.name} disabled`);
    addAudit("Workspace disabled", disableWorkspace.name, "Permission");
    setDisableWorkspace(null);
  }

  function redeployWorkspace() {
    setPublishStatus("Deployment Pending");
    showToast(`${name} redeploy requested`);
    addAudit("Workspace redeploy requested", name, "Deployment");
  }

  return (
    <>
      <PageHeader
        eyebrow="Workspaces"
        title="AI Workspaces"
        description="Publish governed Open WebUI, custom chat, or API interfaces for teams."
        action={<ActionButton onClick={openCreateWorkspace}><Plus size={15} /> Create Workspace</ActionButton>}
      />
      <Section>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-4"><div className="flex items-center gap-3"><Layers className="text-[var(--brand-accent)]" size={18} /><div><div className="text-sm font-semibold">{workspaces.length} interfaces</div><div className="text-xs text-slate-500">Governed workspaces</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><ExternalLink className="text-[var(--brand-primary)]" size={18} /><div><div className="text-sm font-semibold">3 published</div><div className="text-xs text-slate-500">Ready for users</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><LockKeyhole className="text-slate-700" size={18} /><div><div className="text-sm font-semibold">Knowledge scoped</div><div className="text-xs text-slate-500">Authorization enforced</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" size={18} /><div><div className="text-sm font-semibold">Audit enabled</div><div className="text-xs text-slate-500">All workspace changes</div></div></div></Card>
        </div>

        <Card className="overflow-hidden">
          <div className="flex overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1.5">
            {[
              ["workspaces", "Published Workspaces"],
              ["boundary", "Access Boundary"]
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => setActiveTab(id as "workspaces" | "boundary")} className={`rounded-md px-3 py-2 text-xs font-medium ${activeTab === id ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-white"}`}>{label}</button>
            ))}
          </div>
          {activeTab === "workspaces" ? (
            <div id="workspace-list">
              <DataTable
                columns={["Workspace name", "Team", "Interface", "Subdomain URL", "Status", "Models", "Action"]}
                rows={workspaces.map((workspace) => {
                  const workspaceSubdomain = subdomainFromWorkspace(workspace);
                  const url = workspaceUrl(workspaceSubdomain);
                  const status = workspaceDisplayStatus(workspace);
                  const isLive = status === "Live";
                  return [
                  <span key="name" className="font-semibold">{workspace.name}</span>,
                  workspace.department,
                  workspace.interface,
                  isLive ? (
                    <a key="url" href={url} target="_blank" rel="noreferrer" className="font-semibold text-[var(--brand-primary)] hover:underline">{displayUrl(workspaceSubdomain)}</a>
                  ) : (
                    <button key="url" type="button" onClick={() => showToast(`${workspace.name} chat URL is available after deployment`)} className="text-left font-medium text-slate-400">{displayUrl(workspaceSubdomain)}</button>
                  ),
                  <StatusBadge key="status" value={status} />,
                  `${workspace.allowedModels.length} models`,
                  <div key="manage" className="flex flex-wrap gap-2">
                    <ActionButton variant="secondary" onClick={() => loadWorkspace(workspace)}>Manage</ActionButton>
                    {workspace.publishStatus !== "Published" ? <Link href="/dashboard/approval-inbox" className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 hover:bg-slate-50">Open approval</Link> : null}
                    <button type="button" onClick={() => togglePublish(workspace)} className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 hover:bg-slate-50" aria-label={`Toggle ${workspace.name}`}><Power size={14} /></button>
                  </div>
                ];})}
              />
            </div>
          ) : (
            <div id="workspace-auth" className="p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 text-[var(--brand-primary)]" size={20} />
                <div>
                  <h2 className="font-semibold">Workspace access boundary</h2>
                  <p className="mt-1 text-sm text-slate-600">Users must pass team, model, knowledge, and routing checks.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Users:</span> team and invite list</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Models:</span> active catalog models only</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Knowledge:</span> workspace-approved KBs only</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </Section>
      {editorOpen ? (
        <Modal title="Workspace Management" onClose={() => setEditorOpen(false)}>
          <div className="mb-4 flex overflow-x-auto rounded-md bg-[var(--surface-muted)] p-1">
            {(["Configuration", "Deployment", "Usage"] as const).map((tab) => (
              <button key={tab} type="button" onClick={() => setManagementTab(tab)} className={`rounded px-3 py-2 text-xs font-medium ${managementTab === tab ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-white"}`}>{tab}</button>
            ))}
          </div>
          {managementTab === "Configuration" ? <div id="workspace-form" className="max-h-[64vh] space-y-4 overflow-y-auto pr-1">
            <label className="text-sm font-medium text-slate-600">Workspace name
              <input value={name} onChange={(event) => updateWorkspaceName(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">Chat Interface Type
                <select value={interfaceType} onChange={(event) => setInterfaceType(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option>Open WebUI</option><option>Open WebUI / custom chat</option><option>Custom Chat</option><option>API Only</option>
                </select>
                {interfaceType === "Open WebUI" ? <p className="mt-2 text-xs text-[var(--text-secondary)]">Deploys a governed Open WebUI instance at your workspace subdomain.</p> : null}
              </label>
              <label className="text-sm font-medium text-slate-600">Publish status
                <select value={publishStatus} onChange={(event) => setPublishStatus(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option>Published</option><option>Deployment Pending</option><option>Draft</option><option>Disabled</option>
                </select>
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">Subdomain
                <input value={subdomain} onChange={(event) => setSubdomain(slugFromWorkspaceName(event.target.value))} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
                <p className="mt-2 text-xs text-[var(--text-secondary)]">Preview: {displayUrl(subdomain)}</p>
              </label>
              <label className="text-sm font-medium text-slate-600">Target Server
                <select value={targetServer} onChange={(event) => setTargetServer(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  {onlineTargets.map((target) => <option key={target.id}>{target.name}</option>)}
                </select>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">Only connected online agent servers are shown.</p>
              </label>
            </div>
            <Checklist title="Allowed models" options={activeModelOptions} values={selectedModels} onToggle={(item) => toggleValue(item, selectedModels, setSelectedModels)} />
            <Checklist title="Knowledge bases" options={knowledgeOptions} values={knowledge} onToggle={(item) => toggleValue(item, knowledge, setKnowledge)} />
            <Checklist title="Teams" options={departmentOptions} values={departments} onToggle={(item) => toggleValue(item, departments, setDepartments)} />
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
                <option>Restricted for confidential matters</option><option>Blocked</option><option>Allowed</option><option>Approval required</option>
              </select>
            </label>
          </div> : null}
          {managementTab === "Deployment" ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <InfoRow label="Deployment status" value={deploymentStatusFor(workspaceDisplayStatus({ name, department: departments[0] ?? "Unassigned", interface: interfaceType, launchUrl: workspaceUrl(subdomain), publishStatus, assignedUsers: departments.join(", "), allowedModels: selectedModels, knowledgeBases: knowledge, agents, routingPolicy, tokenBudget, externalRule, audit: "Enabled", status: publishStatus === "Published" ? "Healthy" : "Deploying" }))} />
                <InfoRow label="Target server" value={targetServer} />
                <InfoRow label="Subdomain URL" value={displayUrl(subdomain)} />
                <InfoRow label="Last deployed" value={publishStatus === "Published" ? "Jun 20, 2026 09:42 GST" : "Not deployed yet"} />
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                <span className="font-semibold">Open WebUI deployment:</span> Switchboard AI deploys and configures the employee chat instance. Admins configure policy, models, knowledge, and routing here.
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionButton variant="secondary" onClick={copyCurrentWorkspaceUrl}><Copy size={14} /> Copy employee link</ActionButton>
                <a href={workspaceUrl(subdomain)} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--brand-primary-dark)]"><ExternalLink size={14} /> Open chat interface</a>
                <ActionButton variant="secondary" onClick={redeployWorkspace}><Server size={14} /> Redeploy</ActionButton>
              </div>
            </div>
          ) : null}
          {managementTab === "Usage" ? (
            <div className="grid gap-3 md:grid-cols-3">
              <InfoRow label="Active users" value={departments[0] === "Legal" ? "18 users" : departments[0] === "Claims" ? "72 users" : "24 users"} />
              <InfoRow label="Requests this month" value={departments[0] === "Claims" ? "38,120" : departments[0] === "Legal" ? "16,300" : "12,400"} />
              <InfoRow label="Tokens used vs budget" value={`1.4M / ${tokenBudget}`} />
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm md:col-span-3">Usage data will come from the backend once Open WebUI telemetry is connected.</div>
            </div>
          ) : null}
          <div className="mt-5 flex justify-end gap-2">
            <ActionButton variant="secondary" onClick={() => setEditorOpen(false)}>Cancel</ActionButton>
            <ActionButton onClick={saveWorkspace}><Save size={14} /> Save workspace</ActionButton>
          </div>
        </Modal>
      ) : null}
      {disableWorkspace ? (
        <Modal title={`Disable ${disableWorkspace.name}?`} onClose={() => setDisableWorkspace(null)}>
          <div className="rounded-md border border-[rgba(225,29,72,0.22)] bg-[rgba(225,29,72,0.06)] p-4">
            <p className="text-sm font-medium text-[var(--text-primary)]">Users will lose access to this governed AI interface.</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">The workspace remains in the catalog and can be republished through the approval workflow.</p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <ActionButton variant="secondary" onClick={() => setDisableWorkspace(null)}>Cancel</ActionButton>
            <ActionButton variant="danger" onClick={confirmDisableWorkspace}>Disable workspace</ActionButton>
          </div>
        </Modal>
      ) : null}
    </>
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
          <button key={option} type="button" onClick={() => onToggle(option)} className={`rounded-md border px-3 py-2 text-left text-sm ${values.includes(option) ? "border-[rgba(91,61,255,0.24)] bg-[rgba(91,61,255,0.07)] text-[var(--brand-primary-dark)]" : "border-slate-200 bg-white text-slate-700"}`}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
