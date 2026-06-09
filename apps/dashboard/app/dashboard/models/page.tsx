"use client";

import { AlertTriangle, Filter, Gauge, RefreshCw, Server, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { ActionButton, Card, DataTable, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { models, providerHealth } from "@/lib/mock-data";

const filters = ["All", "Local", "External", "Provider issue", "Running", "Department"];

function getProviderHealth(model: (typeof models)[number]) {
  if (model.hosting === "Local") return providerHealth.find((provider) => provider.provider === "Ollama/vLLM");
  return providerHealth.find((provider) => provider.provider === model.provider);
}

export default function ModelsPage() {
  const [filter, setFilter] = useState("All");
  const { showToast, addAudit } = useAppState();
  const providerIssues = providerHealth.filter((provider) => provider.status === "Degraded" || provider.status === "Down");
  const visible = useMemo(() => models.filter((model) => {
    const health = getProviderHealth(model);
    if (filter === "Provider issue") return health?.status === "Degraded" || health?.status === "Down";
    return filter === "All" || filter === "Department" || model.hosting === filter || model.status === filter;
  }), [filter]);

  return (
    <>
      <PageHeader eyebrow="Model catalog" title="Unified model catalog" description="A single inventory of local models, hosted provider models, provider status, access policies, latency, and request volume." />
      <Section>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center gap-3"><Server className="text-cyan-700" size={20} /><div><div className="text-sm font-semibold">3 local models</div><div className="text-xs text-slate-500">Private infrastructure</div></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><Sparkles className="text-indigo-600" size={20} /><div><div className="text-sm font-semibold">3 external providers</div><div className="text-xs text-slate-500">OpenAI, Anthropic, Google</div></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><Gauge className="text-emerald-600" size={20} /><div><div className="text-sm font-semibold">128k monthly requests</div><div className="text-xs text-slate-500">Governed by department policy</div></div></div>
          </Card>
        </div>
        <Card className="mb-6 p-5">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold">External provider health</h2>
              <p className="mt-1 text-sm text-slate-500">Provider incidents are tracked separately from on-prem server health so admins can reroute work quickly.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {providerIssues.length ? <span className="text-sm font-medium text-amber-700">{providerIssues.length} provider issue</span> : null}
              <StatusBadge value={providerIssues.length ? "Warning" : "Operational"} />
              <ActionButton variant="secondary" onClick={() => showToast("Provider status refreshed")}>
                <RefreshCw size={14} /> Refresh
              </ActionButton>
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            {providerHealth.map((provider) => (
              <div key={provider.provider} className="rounded-md border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{provider.provider}</div>
                    <div className="mt-1 text-xs text-slate-500">{provider.lastChecked}</div>
                  </div>
                  <StatusBadge value={provider.status} />
                </div>
                <div className="mt-3 text-sm text-slate-600">{provider.impact}</div>
                <div className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">Action</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{provider.action}</div>
              </div>
            ))}
          </div>
        </Card>
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-md px-3 py-2 text-sm font-medium ${filter === item ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}><Filter className="mr-2 inline" size={14} />{item}</button>)}
        </div>
        <Card>
          <DataTable
            columns={["Model", "Hosting", "Runtime", "Provider health", "Target", "Monthly requests", "Avg latency", "Access", "Action"]}
            rows={visible.map((model) => {
              const health = getProviderHealth(model);
              return [
                <span key="name" className="font-semibold">{model.name}</span>,
                model.hosting,
                <StatusBadge key="runtime" value={model.status} />,
                <div key="provider" className="flex min-w-40 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {health?.status === "Degraded" || health?.status === "Down" ? <AlertTriangle className="text-amber-600" size={14} /> : null}
                    <span className="font-medium">{model.provider}</span>
                  </div>
                  <div><StatusBadge value={health?.status ?? "Unknown"} /></div>
                </div>,
                model.target,
                model.requests,
                model.latency,
                model.access,
                <ActionButton key="action" variant="secondary" onClick={() => { showToast(`${model.name} policy opened`); addAudit(`${model.name} model policy viewed`, model.name, "Model"); }}><Sparkles size={14} /> Manage</ActionButton>
              ];
            })}
          />
        </Card>
      </Section>
    </>
  );
}
