"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRightLeft, CheckCircle2, Plus, Route, ShieldCheck, Sparkles } from "lucide-react";
import { ActionButton, Card, DataTable, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

const policySeed = [
  { name: "Legal confidential review", scope: "Legal AI Assistant", task: "Contract review", sensitivity: "Confidential", primary: "Qwen Local", fallback: "Claude for non-sensitive drafting", blocked: "GPT-5, Gemini", status: "Governance risk" },
  { name: "Claims sensitive workflow", scope: "Claims AI Assistant", task: "Claim summarization", sensitivity: "Restricted", primary: "Qwen Local", fallback: "No external fallback", blocked: "GPT-5, Claude, Gemini", status: "Healthy" },
  { name: "Engineering code assist", scope: "Engineering Copilot", task: "Code review", sensitivity: "Internal", primary: "DeepSeek Coder", fallback: "Claude, then GPT-5", blocked: "None", status: "Healthy" },
  { name: "Marketing drafting economy", scope: "Marketing Studio", task: "Drafting and summarization", sensitivity: "Public", primary: "Gemini", fallback: "GPT-5 mini for executive content", blocked: "GPT-5 full by default", status: "Cost risk" }
];

export default function RoutingPoliciesPage() {
  const [policies, setPolicies] = useState(policySeed);
  const [name, setName] = useState("OpenAI degradation fallback");
  const [scope, setScope] = useState("Engineering Copilot");
  const [task, setTask] = useState("Critical GPT-5 work");
  const [sensitivity, setSensitivity] = useState("Internal");
  const [primary, setPrimary] = useState("Claude");
  const [fallback, setFallback] = useState("Qwen Local for sensitive prompts");
  const [blocked, setBlocked] = useState("None");
  const { showToast, addAudit } = useAppState();

  function savePolicy() {
    const row = { name, scope, task, sensitivity, primary, fallback, blocked, status: sensitivity === "Confidential" ? "Governance risk" : "Healthy" };
    setPolicies((current) => [row, ...current.filter((item) => item.name !== name)]);
    showToast(`${name} routing policy saved`);
    addAudit("Routing policy saved", name, "Model");
  }

  function applyIncidentRoute(target: string) {
    showToast(target);
    addAudit("Provider incident routing applied", target, "Model");
  }

  return (
    <>
      <PageHeader eyebrow="Routing" title="Routing policies" description="Define how work moves between local and cloud models based on department, workspace, sensitivity, provider health, cost, latency, and fallback eligibility." />
      <Section>
        <Card id="incident-action" className="mb-6 overflow-hidden border-amber-200">
          <div className="grid gap-4 bg-amber-50 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 text-amber-700" size={20} />
              <div>
                <div className="text-sm font-semibold text-amber-950">OpenAI degraded 48 seconds ago</div>
                <p className="mt-1 text-sm text-amber-900">Elevated latency on GPT-5 requests. Route critical work to Claude or Qwen 32B while the provider recovers.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={() => applyIncidentRoute("Critical GPT-5 traffic routed to Claude")}><ArrowRightLeft size={14} /> Route to Claude</ActionButton>
              <ActionButton variant="secondary" onClick={() => applyIncidentRoute("Sensitive GPT-5 traffic routed to Qwen Local")}><ShieldCheck size={14} /> Route to Qwen</ActionButton>
            </div>
          </div>
        </Card>

        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <Card className="p-5"><div className="flex items-center gap-3"><Route className="text-cyan-700" size={20} /><div><div className="text-sm font-semibold">{policies.length} policies</div><div className="text-xs text-slate-500">Workspace aware</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><Sparkles className="text-indigo-600" size={20} /><div><div className="text-sm font-semibold">Model suggestions</div><div className="text-xs text-slate-500">Based on task and sensitivity</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" size={20} /><div><div className="text-sm font-semibold">Confidential safe</div><div className="text-xs text-slate-500">Local-only options</div></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><CheckCircle2 className="text-slate-700" size={20} /><div><div className="text-sm font-semibold">Audit covered</div><div className="text-xs text-slate-500">Every route change</div></div></div></Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <Card id="routing-form" className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><Plus size={15} /> Create or edit</div>
            <h2 className="mt-2 text-lg font-semibold">Routing rule</h2>
            <div className="mt-5 space-y-4">
              <label className="text-sm font-medium text-slate-600">Policy name
                <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-600">Workspace / department
                  <input value={scope} onChange={(event) => setScope(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
                </label>
                <label className="text-sm font-medium text-slate-600">Task type
                  <input value={task} onChange={(event) => setTask(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
                </label>
              </div>
              <label className="text-sm font-medium text-slate-600">Sensitivity
                <select value={sensitivity} onChange={(event) => setSensitivity(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option>Public</option>
                  <option>Internal</option>
                  <option>Confidential</option>
                  <option>Restricted</option>
                </select>
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-600">Primary model
                  <input value={primary} onChange={(event) => setPrimary(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
                </label>
                <label className="text-sm font-medium text-slate-600">Fallback policy
                  <input value={fallback} onChange={(event) => setFallback(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
                </label>
              </div>
              <label className="text-sm font-medium text-slate-600">Blocked models
                <input value={blocked} onChange={(event) => setBlocked(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <ActionButton onClick={savePolicy}><Plus size={14} /> Save routing policy</ActionButton>
            </div>
          </Card>

          <div className="space-y-6">
            <Card id="routing-list" className="overflow-hidden">
              <DataTable
                columns={["Policy", "Scope", "Task", "Sensitivity", "Primary", "Fallback", "Blocked", "Status", "Action"]}
                rows={policies.map((policy) => [
                  <span key="name" className="font-semibold">{policy.name}</span>,
                  policy.scope,
                  policy.task,
                  policy.sensitivity,
                  policy.primary,
                  policy.fallback,
                  policy.blocked,
                  <StatusBadge key="status" value={policy.status} />,
                  <ActionButton key="edit" variant="secondary" onClick={() => {
                    setName(policy.name);
                    setScope(policy.scope);
                    setTask(policy.task);
                    setSensitivity(policy.sensitivity);
                    setPrimary(policy.primary);
                    setFallback(policy.fallback);
                    setBlocked(policy.blocked);
                    showToast(`${policy.name} loaded for editing`);
                    addAudit("Routing policy opened", policy.name, "Model");
                  }}>Edit</ActionButton>
                ])}
              />
            </Card>
            <Card id="model-suggestions" className="p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 text-cyan-700" size={20} />
                <div>
                  <h2 className="font-semibold">Model suggestions</h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Legal confidential:</span> Qwen Local first, Claude only for non-sensitive drafting.</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Claims sensitive:</span> Qwen Local only, no external fallback.</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Engineering code:</span> DeepSeek Coder, then Claude or GPT-5.</div>
                    <div className="rounded-md border border-slate-200 p-3 text-sm"><span className="font-semibold">Marketing drafting:</span> Gemini first, GPT-5 for executive content only.</div>
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
