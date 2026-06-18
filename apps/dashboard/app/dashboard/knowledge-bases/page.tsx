"use client";

import { useEffect, useState } from "react";
import { Database, FileCheck2, LockKeyhole, Plus, RefreshCw, ShieldCheck } from "lucide-react";
import { ActionButton, Card, DataBoundaryChip, DataTable, Modal, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

const knowledgeSeed = [
  { name: "Legal Contracts", documents: "1,240", source: "SharePoint folder", sensitivity: "Confidential", sync: "Synced", vector: "Indexed", workspace: "Legal AI Assistant", departments: "Legal", access: "Legal only", lastSync: "12 minutes ago" },
  { name: "Claims SOPs", documents: "850", source: "Uploaded documents", sensitivity: "Restricted", sync: "Synced", vector: "Indexed", workspace: "Claims AI Assistant", departments: "Claims", access: "Claims only", lastSync: "18 minutes ago" },
  { name: "Engineering Docs", documents: "2,100", source: "Google Drive folder", sensitivity: "Internal", sync: "Syncing", vector: "Indexing", workspace: "Engineering Copilot", departments: "Engineering", access: "Engineering only", lastSync: "Running now" },
  { name: "Finance Policies", documents: "410", source: "S3 bucket", sensitivity: "Confidential", sync: "Synced", vector: "Indexed", workspace: "Finance AI Desk", departments: "Finance", access: "Finance only", lastSync: "34 minutes ago" },
  { name: "Product FAQ", documents: "620", source: "Internal wiki", sensitivity: "Internal", sync: "Synced", vector: "Indexed", workspace: "Support Desk", departments: "Customer Support, Marketing", access: "Support and Marketing", lastSync: "51 minutes ago" }
];

const sourceTypes = ["Uploaded documents", "SharePoint folder", "Google Drive folder", "S3 bucket", "Internal policies", "SOPs", "Contracts", "Claims documents", "HR policies", "Finance policies", "Product FAQ", "Engineering docs"];

const sourceConnectionCopy: Record<string, { locationLabel: string; credentialLabel: string; placeholder: string; credentialPlaceholder: string; action: string; note: string }> = {
  "Uploaded documents": {
    locationLabel: "Upload batch",
    credentialLabel: "Credential",
    placeholder: "legal-contracts-q2-upload",
    credentialPlaceholder: "Not required for manual uploads",
    action: "Select files",
    note: "Upload files, assign access, then run indexing."
  },
  "SharePoint folder": {
    locationLabel: "SharePoint folder URL",
    credentialLabel: "Microsoft credential reference",
    placeholder: "https://company.sharepoint.com/sites/legal/contracts",
    credentialPlaceholder: "secret:sharepoint-legal-readonly",
    action: "Connect Microsoft",
    note: "Connect with a read-only app permission or delegated admin consent."
  },
  "Google Drive folder": {
    locationLabel: "Google Drive folder URL",
    credentialLabel: "Google credential reference",
    placeholder: "https://drive.google.com/drive/folders/...",
    credentialPlaceholder: "secret:google-drive-engineering",
    action: "Connect Google",
    note: "Connect with a scoped service account or OAuth app."
  },
  "S3 bucket": {
    locationLabel: "S3 bucket URI",
    credentialLabel: "AWS access reference",
    placeholder: "s3://acme-finance-policies/prod",
    credentialPlaceholder: "secret:aws-role-finance-kb",
    action: "Validate S3 access",
    note: "Use a read-only IAM role or access key reference."
  }
};

const defaultSourceConnection = {
  locationLabel: "Source location",
  credentialLabel: "Credential reference",
  placeholder: "https://internal.company.com/source-or-folder",
  credentialPlaceholder: "secret:source-readonly",
  action: "Connect source",
  note: "Connect the source, test access, then sync and index documents."
};

function boundaryForSource(source: string) {
  if (source.includes("S3") || source.includes("SharePoint") || source.includes("Google Drive")) return "Customer Cloud" as const;
  if (source.includes("Uploaded") || source.includes("Internal") || source.includes("SOP") || source.includes("Contracts")) return "On-Prem / Sovereign" as const;
  return "Customer Cloud" as const;
}

export default function KnowledgeBasesPage() {
  const [rows, setRows] = useState(knowledgeSeed);
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"sources" | "authorization">("sources");
  const [name, setName] = useState("Legal Contracts");
  const [source, setSource] = useState("SharePoint folder");
  const [documents, setDocuments] = useState("1240");
  const [workspace, setWorkspace] = useState("Legal AI Assistant");
  const [departments, setDepartments] = useState("Legal");
  const [access, setAccess] = useState("Legal only");
  const [sourceLocation, setSourceLocation] = useState("https://company.sharepoint.com/sites/legal/contracts");
  const [credentialReference, setCredentialReference] = useState("secret:sharepoint-legal-readonly");
  const [syncCadence, setSyncCadence] = useState("Every 6 hours");
  const [connectionStatus, setConnectionStatus] = useState("Not connected");
  const { showToast, addAudit } = useAppState();
  const connection = sourceConnectionCopy[source] ?? defaultSourceConnection;

  useEffect(() => {
    function syncCreateAction() {
      if (window.location.hash === "#kb-form") setEditorOpen(true);
    }
    syncCreateAction();
    window.addEventListener("hashchange", syncCreateAction);
    return () => window.removeEventListener("hashchange", syncCreateAction);
  }, []);

  function saveKnowledgeBase() {
    const row = {
      name,
      documents,
      source,
      sensitivity: access.includes("only") ? "Confidential" : "Internal",
      sync: "Synced",
      vector: "Indexed",
      workspace,
      departments,
      access,
      lastSync: "Just now"
    };
    setRows((current) => [row, ...current.filter((item) => item.name !== name)]);
    showToast(`${name} knowledge base saved`);
    addAudit("Knowledge base saved", name, "Permission");
    setEditorOpen(false);
    window.history.replaceState(null, "", window.location.pathname);
  }

  function editKnowledgeBase(item: (typeof knowledgeSeed)[number]) {
    setName(item.name);
    setDocuments(item.documents);
    setSource(item.source);
    setWorkspace(item.workspace);
    setDepartments(item.departments);
    setAccess(item.access);
    setConnectionStatus(item.sync === "Synced" ? "Connected" : "Not connected");
    setEditorOpen(true);
    addAudit("Knowledge base opened", item.name, "Permission");
  }

  function connectSource() {
    setConnectionStatus("Connected");
    showToast(`${source} connected for ${name}`);
    addAudit("Knowledge source connected", name, "Permission");
  }

  function testConnection() {
    setConnectionStatus("Validated");
    showToast(`${source} access validated`);
    addAudit("Knowledge source validated", name, "Permission");
  }

  function changeSource(nextSource: string) {
    setSource(nextSource);
    setSourceLocation("");
    setCredentialReference("");
    setConnectionStatus("Not connected");
  }

  return (
    <>
      <PageHeader
        eyebrow="Knowledge"
        title="Knowledge Bases"
        description="Connect sources and authorize retrieval by team, workspace, user, and agent."
        action={<ActionButton onClick={() => setEditorOpen(true)}><Plus size={15} /> Add Source</ActionButton>}
      />
      <Section>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-4"><div className="flex items-center gap-3"><Database className="text-[var(--brand-accent)]" size={18} /><div><div className="text-sm font-semibold">{rows.length} knowledge bases</div><div className="text-xs text-slate-500">Connected sources</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><FileCheck2 className="text-emerald-600" size={18} /><div><div className="text-sm font-semibold">5,220 documents</div><div className="text-xs text-slate-500">Indexed or syncing</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><LockKeyhole className="text-slate-700" size={18} /><div><div className="text-sm font-semibold">Retrieval gated</div><div className="text-xs text-slate-500">Authorization enforced</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><ShieldCheck className="text-[var(--brand-primary)]" size={18} /><div><div className="text-sm font-semibold">Audit covered</div><div className="text-xs text-slate-500">Source and access changes</div></div></div></Card>
        </div>

        <Card className="overflow-hidden">
          <div className="flex border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1.5">
            <button type="button" onClick={() => setActiveTab("sources")} className={`rounded-md px-3 py-2 text-xs font-medium ${activeTab === "sources" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-white"}`}>Sources</button>
            <button type="button" onClick={() => setActiveTab("authorization")} className={`rounded-md px-3 py-2 text-xs font-medium ${activeTab === "authorization" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-white"}`}>Authorization Boundary</button>
          </div>
          {activeTab === "sources" ? (
            <div id="kb-list">
              <DataTable
                columns={["Knowledge base", "Docs", "Source", "Data Boundary", "Sensitivity", "Sync", "Workspace", "Access", "Action"]}
                rows={rows.map((item) => [
                  <span key="name" className="font-semibold">{item.name}</span>,
                  item.documents,
                  item.source,
                  <DataBoundaryChip key="boundary" value={boundaryForSource(item.source)} />,
                  <StatusBadge key="sensitivity" value={item.sensitivity === "Restricted" || item.sensitivity === "Confidential" ? "Governance risk" : "Healthy"} />,
                  <StatusBadge key="sync" value={item.sync} />,
                  item.workspace,
                  item.access,
                  <ActionButton key="action" variant="secondary" onClick={() => editKnowledgeBase(item)}>Manage</ActionButton>
                ])}
              />
            </div>
          ) : (
            <div id="kb-auth" className="p-5">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-1 text-[var(--brand-primary)]" size={20} />
                <div>
                  <h2 className="font-semibold">Permission-aware retrieval boundary</h2>
                  <p className="mt-2 text-sm text-slate-600">Users retrieve only from authorized team or workspace sources.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Before search:</span> user and workspace are checked</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">During RAG:</span> unauthorized chunks are excluded</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">After response:</span> source usage is audited</div>
                  </div>
                  <p className="mt-4 text-xs text-slate-500">Private GPU workspaces do not send prompts or documents to third-party LLM providers unless an approved external route is configured.</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </Section>
      {editorOpen ? (
        <Modal title="Connect knowledge source" onClose={() => setEditorOpen(false)}>
          <div id="kb-form" className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">Name
                <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Source type
                <select value={source} onChange={(event) => changeSource(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  {sourceTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
            <div className="rounded-md border border-[rgba(22,199,232,0.22)] bg-[rgba(22,199,232,0.07)] p-4">
              <div className="flex items-center justify-between gap-3"><div className="text-sm font-semibold">Connect selected source</div><StatusBadge value={connectionStatus} /></div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-600">{connection.locationLabel}
                  <input value={sourceLocation} onChange={(event) => setSourceLocation(event.target.value)} placeholder={connection.placeholder} className="mt-2 min-h-10 w-full rounded-md border border-[var(--border-subtle)] bg-white px-3 text-sm" />
                </label>
                <label className="text-sm font-medium text-slate-600">{connection.credentialLabel}
                  <input value={credentialReference} onChange={(event) => setCredentialReference(event.target.value)} placeholder={connection.credentialPlaceholder} className="mt-2 min-h-10 w-full rounded-md border border-[var(--border-subtle)] bg-white px-3 text-sm" />
                </label>
                <label className="text-sm font-medium text-slate-600">Sync cadence
                  <select value={syncCadence} onChange={(event) => setSyncCadence(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-[var(--border-subtle)] bg-white px-3 text-sm">
                    {["Manual only", "Hourly", "Every 6 hours", "Daily"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>
              <div className="mt-3 flex flex-wrap gap-2"><ActionButton onClick={connectSource}>{connection.action}</ActionButton><ActionButton variant="secondary" onClick={testConnection}>Test connection</ActionButton></div>
              <div className="mt-2 text-xs text-slate-600">{connection.note}</div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">Document count
                <input value={documents} onChange={(event) => setDocuments(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Assigned workspace
                <input value={workspace} onChange={(event) => setWorkspace(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Assigned teams
                <input value={departments} onChange={(event) => setDepartments(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Access permissions
                <input value={access} onChange={(event) => setAccess(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <ActionButton variant="secondary" onClick={() => { showToast(`${name} sync started`); addAudit("Knowledge sync started", name, "Permission"); }}><RefreshCw size={14} /> Sync now</ActionButton>
            <ActionButton onClick={saveKnowledgeBase}><Plus size={14} /> Save source</ActionButton>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
