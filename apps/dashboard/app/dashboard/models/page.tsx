"use client";

import { AlertTriangle, Filter, Gauge, Plus, RefreshCw, Route, Server, Sparkles } from "lucide-react";
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
  const [providerName, setProviderName] = useState("OpenAI");
  const [modelName, setModelName] = useState("GPT-5 mini");
  const [modelType, setModelType] = useState("Cloud");
  const [endpoint, setEndpoint] = useState("https://api.openai.com/v1");
  const [secretReference, setSecretReference] = useState("OPENAI_API_KEY");
  const [inputCost, setInputCost] = useState("0.15");
  const [outputCost, setOutputCost] = useState("0.60");
  const [contextWindow, setContextWindow] = useState("128000");
  const [sensitivity, setSensitivity] = useState("Public and internal");
  const [gpuRequirement, setGpuRequirement] = useState("None");
  const [vramRequirement, setVramRequirement] = useState("0 GB");
  const [fallbackEligible, setFallbackEligible] = useState("Yes");
  const [maxConcurrency, setMaxConcurrency] = useState("100");
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
                {provider.provider === "OpenAI" ? (
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => { showToast("Critical GPT-5 traffic routed to Claude"); addAudit("Routing policy applied", "GPT-5 to Claude", "Model"); }}
                      className="w-full rounded-md bg-slate-950 px-3 py-2 text-left text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Apply routing policy
                    </button>
                    <button
                      onClick={() => { showToast("Sensitive GPT-5 traffic routed to Qwen 32B"); addAudit("Routing policy applied", "GPT-5 to Qwen 32B", "Model"); }}
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Route sensitive work to Qwen 32B
                    </button>
                    <ol className="list-decimal space-y-1 pl-4 text-xs leading-5 text-slate-500">
                      <li>Confirm Claude or Qwen 32B is enabled.</li>
                      <li>Select affected departments or workspaces.</li>
                      <li>Apply fallback from GPT-5 to the approved model.</li>
                    </ol>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
        <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><Plus size={15} /> Models and providers</div>
            <h2 className="mt-2 text-lg font-semibold">Add or integrate a model</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Admins add cloud or local models here, test connectivity, and then assign them to departments, workspaces, agents, and routing policies.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-slate-600">Provider
                <input value={providerName} onChange={(event) => setProviderName(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Model name
                <input value={modelName} onChange={(event) => setModelName(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Model type
                <select value={modelType} onChange={(event) => setModelType(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option>Cloud</option>
                  <option>Local</option>
                </select>
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">Endpoint
                <input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Secret reference
                <input value={secretReference} onChange={(event) => setSecretReference(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-slate-600">Input cost / 1M tokens
                <input value={inputCost} onChange={(event) => setInputCost(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Output cost / 1M tokens
                <input value={outputCost} onChange={(event) => setOutputCost(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">Context window
                <input value={contextWindow} onChange={(event) => setContextWindow(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-slate-600">Sensitivity fit
                <select value={sensitivity} onChange={(event) => setSensitivity(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option>Public and internal</option>
                  <option>Internal only</option>
                  <option>Confidential with approval</option>
                  <option>Confidential local-only</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600">Fallback eligible
                <select value={fallbackEligible} onChange={(event) => setFallbackEligible(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option>Yes</option>
                  <option>No</option>
                  <option>Only for non-sensitive work</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600">Max concurrency
                <input value={maxConcurrency} onChange={(event) => setMaxConcurrency(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">GPU requirement
                <input value={gpuRequirement} onChange={(event) => setGpuRequirement(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-600">VRAM requirement
                <input value={vramRequirement} onChange={(event) => setVramRequirement(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
              </label>
            </div>
            <div className="mt-4 rounded-md border border-cyan-100 bg-cyan-50 p-3 text-sm leading-6 text-cyan-950">
              Secrets stay server-side. The frontend stores only secret references, routing metadata, cost assumptions, and policy settings.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton onClick={() => { showToast(`${modelName} connection test passed`); addAudit("Model connection tested", modelName, "Model"); }}><Sparkles size={14} /> Test connection</ActionButton>
              <ActionButton variant="secondary" onClick={() => { showToast(`${modelName} added as ${modelType} model`); addAudit("Model/provider added", `${providerName} ${modelName} via ${endpoint}`, "Model"); }}><Plus size={14} /> Add model</ActionButton>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><Route size={15} /> Routing recommendations</div>
            <h2 className="mt-2 text-lg font-semibold">Suggest the best allowed model</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-md border border-slate-200 p-3"><span className="font-semibold">Legal confidential:</span> Qwen Local first; Claude only for non-sensitive drafting.</div>
              <div className="rounded-md border border-slate-200 p-3"><span className="font-semibold">Claims sensitive:</span> Qwen Local only; external models blocked.</div>
              <div className="rounded-md border border-slate-200 p-3"><span className="font-semibold">Engineering code:</span> DeepSeek Coder, then Claude or GPT-5 if available.</div>
              <div className="rounded-md border border-slate-200 p-3"><span className="font-semibold">Marketing drafting:</span> Gemini first; GPT-5 only for executive content.</div>
            </div>
          </Card>
        </div>
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
