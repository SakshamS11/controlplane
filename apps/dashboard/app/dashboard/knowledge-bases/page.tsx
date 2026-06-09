"use client";

import { useState } from "react";
import { Database, FileCheck2, LockKeyhole, Plus, RefreshCw, ShieldCheck } from "lucide-react";
import { ActionButton, Card, DataTable, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

const knowledgeSeed = [
  { name: "Legal Contracts", documents: "1,240", source: "SharePoint folder", sync: "Synced", vector: "Indexed", workspace: "Legal AI Assistant", departments: "Legal", access: "Legal only", lastSync: "12 minutes ago" },
  { name: "Claims SOPs", documents: "850", source: "Uploaded documents", sync: "Synced", vector: "Indexed", workspace: "Claims AI Assistant", departments: "Claims", access: "Claims only", lastSync: "18 minutes ago" },
  { name: "Engineering Docs", documents: "2,100", source: "Google Drive folder", sync: "Syncing", vector: "Indexing", workspace: "Engineering Copilot", departments: "Engineering", access: "Engineering only", lastSync: "Running now" },
  { name: "Finance Policies", documents: "410", source: "S3 bucket", sync: "Synced", vector: "Indexed", workspace: "Finance AI Desk", departments: "Finance", access: "Finance only", lastSync: "34 minutes ago" },
  { name: "Product FAQ", documents: "620", source: "Internal wiki", sync: "Synced", vector: "Indexed", workspace: "Support Desk", departments: "Customer Support, Marketing", access: "Support and Marketing", lastSync: "51 minutes ago" }
];

const sourceTypes = ["Uploaded documents", "SharePoint folder", "Google Drive folder", "S3 bucket", "Internal policies", "SOPs", "Contracts", "Claims documents", "HR policies", "Finance policies", "Product FAQ", "Engineering docs"];

export default function KnowledgeBasesPage() {
  const [rows, setRows] = useState(knowledgeSeed);
  const [name, setName] = useState("Legal Contracts");
  const [source, setSource] = useState("SharePoint folder");
  const [documents, setDocuments] = useState("1240");
  const [workspace, setWorkspace] = useState("Legal AI Assistant");
  const [departments, setDepartments] = useState("Legal");
  const [access, setAccess] = useState("Legal only");
  const { showToast, addAudit } = useAppState();

  function saveKnowledgeBase() {
    const row = {
      name,
      documents,
      source,
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
  }

  return (
    <>
      <PageHeader eyebrow="Knowledge" title="Knowledge bases" description="Connect documents, folders, buckets, policies, SOPs, contracts, and product information with strict workspace and department authorization." />
      <Section>
        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <Card className="p-5"><div className="flex items-center gap-3"><Database className="text-cyan-700" size={20} /><div><div className="text-sm font-semibold">{rows.length} knowledge bases</div><div className="text-xs text-slate-500">Connected sources</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><FileCheck2 className="text-emerald-600" size={20} /><div><div className="text-sm font-semibold">5,220 documents</div><div className="text-xs text-slate-500">Indexed or syncing</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><LockKeyhole className="text-slate-700" size={20} /><div><div className="text-sm font-semibold">Department scoped</div><div className="text-xs text-slate-500">Retrieval is authorized</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><ShieldCheck className="text-indigo-600" size={20} /><div><div className="text-sm font-semibold">Audit covered</div><div className="text-xs text-slate-500">Source and access changes</div></div></div></Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><Plus size={15} /> Create or edit</div>
            <h2 className="mt-2 text-lg font-semibold">Knowledge source setup</h2>
            <div className="mt-5 space-y-4">
              <label className="text-sm font-medium text-slate-600">Name
                <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Source type
                <select value={source} onChange={(event) => setSource(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  {sourceTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-600">Document count
                  <input value={documents} onChange={(event) => setDocuments(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
                </label>
                <label className="text-sm font-medium text-slate-600">Assigned workspace
                  <input value={workspace} onChange={(event) => setWorkspace(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
                </label>
              </div>
              <label className="text-sm font-medium text-slate-600">Assigned departments
                <input value={departments} onChange={(event) => setDepartments(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Access permissions
                <input value={access} onChange={(event) => setAccess(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <div className="flex flex-wrap gap-2">
                <ActionButton onClick={saveKnowledgeBase}><Plus size={14} /> Save knowledge base</ActionButton>
                <ActionButton variant="secondary" onClick={() => { showToast(`${name} sync started`); addAudit("Knowledge sync started", name, "Permission"); }}><RefreshCw size={14} /> Sync now</ActionButton>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <DataTable
                columns={["Knowledge base", "Docs", "Source", "Sync", "Vector index", "Workspace", "Departments", "Access", "Last sync", "Action"]}
                rows={rows.map((item) => [
                  <span key="name" className="font-semibold">{item.name}</span>,
                  item.documents,
                  item.source,
                  <StatusBadge key="sync" value={item.sync} />,
                  <StatusBadge key="vector" value={item.vector} />,
                  item.workspace,
                  item.departments,
                  item.access,
                  item.lastSync,
                  <ActionButton key="action" variant="secondary" onClick={() => { showToast(`${item.name} access policy opened`); addAudit("Knowledge base policy viewed", item.name, "Permission"); }}>Manage</ActionButton>
                ])}
              />
            </Card>
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-1 text-cyan-700" size={20} />
                <div>
                  <h2 className="font-semibold">Retrieval authorization boundary</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Users can only retrieve knowledge from sources assigned to their department or workspace. The same policy is intended to apply across Open WebUI, custom chat, APIs, internal applications, agents, and workflows.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Before search:</span> user and workspace are checked</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">During RAG:</span> unauthorized chunks are excluded</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">After response:</span> source usage is audited</div>
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
