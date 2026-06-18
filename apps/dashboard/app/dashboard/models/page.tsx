"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Cloud,
  Gauge,
  PiggyBank,
  Plus,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { ActionButton, Card, DataBoundaryChip, Modal, Section, StatusBadge, useAppState } from "@/components/ui";
import { providerHealth } from "@/lib/mock-data";

const filters = ["All", "Local", "External", "Provider issue", "Running"] as const;

type ModelRow = {
  name: string;
  hosting: string;
  provider: string;
  status: string;
  target: string;
  requests: string;
  latency: string;
  access: string;
};

const modelGovernance: Record<string, {
  sensitivity: string;
  fallback: string;
  cost: string;
  workspaces: string;
  graduation: string;
}> = {
  "Qwen 32B": { sensitivity: "Restricted", fallback: "Local fallback", cost: "Owned capacity", workspaces: "Claims, Legal", graduation: "Primary graduation target" },
  "Llama 3.1 8B": { sensitivity: "Confidential", fallback: "Local fallback", cost: "Owned capacity", workspaces: "Support Desk", graduation: "Support traffic candidate" },
  "DeepSeek Coder": { sensitivity: "Internal", fallback: "Claude / GPT-5", cost: "Owned capacity", workspaces: "Engineering Copilot", graduation: "Code workloads local" },
  "GPT-5": { sensitivity: "Internal", fallback: "Claude / Qwen 32B", cost: "AED 7,200/mo", workspaces: "Engineering, Marketing", graduation: "Drafting can move cheaper/local" },
  Claude: { sensitivity: "Confidential with policy", fallback: "Qwen 32B", cost: "AED 3,100/mo", workspaces: "Legal, Engineering", graduation: "Confidential review can move local" },
  Gemini: { sensitivity: "Internal", fallback: "GPT-5 mini", cost: "AED 1,200/mo", workspaces: "Marketing Studio", graduation: "Keep for low-cost drafting" }
};

const routingRecommendations = [
  { workload: "Legal confidential", route: "Qwen 32B first", rule: "Claude only for non-sensitive drafting", status: "Governance risk" },
  { workload: "Claims sensitive", route: "Qwen 32B only", rule: "External models blocked", status: "Enforced" },
  { workload: "Engineering code", route: "DeepSeek Coder", rule: "Claude or GPT-5 fallback when healthy", status: "Healthy" },
  { workload: "Marketing drafting", route: "Gemini first", rule: "GPT-5 only for executive content", status: "Cost risk" }
];

function getProviderHealth(model: ModelRow) {
  if (model.hosting === "Local") {
    return providerHealth.find((provider) => provider.provider === "Ollama/vLLM");
  }
  return providerHealth.find((provider) => provider.provider === model.provider);
}

function boundaryForModel(model: ModelRow) {
  if (model.hosting === "Local" && model.target.includes("On-Prem")) return "On-Prem / Sovereign" as const;
  if (model.hosting === "Local") return "Private GPU Runtime" as const;
  return "External AI Provider" as const;
}

export default function ModelsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [addOpen, setAddOpen] = useState(false);
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
  const { showToast, addAudit, modelCatalog, addModelToCatalog } = useAppState();

  useEffect(() => {
    function syncCreateAction() {
      if (window.location.hash === "#integrate-model") setAddOpen(true);
    }
    syncCreateAction();
    window.addEventListener("hashchange", syncCreateAction);
    return () => window.removeEventListener("hashchange", syncCreateAction);
  }, []);

  const visible = useMemo(() => modelCatalog.filter((model) => {
    const health = getProviderHealth(model);
    if (filter === "Provider issue") return health?.status === "Degraded" || health?.status === "Down";
    return filter === "All" || model.hosting === filter || model.status === filter;
  }), [filter, modelCatalog]);

  function requestRoutingApproval(target: string) {
    showToast(`Approval request simulated for ${target}`);
    addAudit("Model routing approval requested", target, "Permission");
  }

  function addModel() {
    addModelToCatalog({
      name: modelName,
      hosting: modelType === "Local" ? "Local" : "External",
      provider: providerName,
      status: modelType === "Local" ? "Running" : "Connected",
      target: modelType === "Local" ? "Acme Azure GPU Server" : "External Provider",
      requests: "0",
      latency: "Not measured",
      access: "Unassigned"
    });
    addAudit("Model/provider configured", `${providerName} ${modelName} via ${endpoint}`, "Model");
    setAddOpen(false);
    window.history.replaceState(null, "", window.location.pathname);
  }

  return (
    <>
      <Section>
        <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">AI Platform</p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Models &amp; Providers</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Govern local and external models, provider health, sensitivity, fallback eligibility, and routing.
            </p>
          </div>
          <ActionButton onClick={() => setAddOpen(true)}><Plus size={15} /> Add Model</ActionButton>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Available models", value: String(modelCatalog.length), detail: "Governed catalog", icon: <Sparkles size={16} /> },
            { label: "Local models", value: "3", detail: "Owned infrastructure", icon: <Server size={16} /> },
            { label: "External providers", value: "3", detail: "One degraded", icon: <Cloud size={16} /> },
            { label: "Fallback-ready", value: "4", detail: "Policy alternatives", icon: <ShieldCheck size={16} /> },
            { label: "Graduation fit", value: "61%", detail: "Support can move local", icon: <PiggyBank size={16} /> }
          ].map((metric) => (
            <Card key={metric.label} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="text-xs text-[var(--text-secondary)]">{metric.label}</p><p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{metric.value}</p><p className="mt-0.5 text-xs text-[var(--text-secondary)]">{metric.detail}</p></div>
                <span className="grid h-8 w-8 place-items-center rounded-md bg-[rgba(91,61,255,0.10)] text-[var(--brand-primary)]">{metric.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-3 overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-[rgba(245,158,11,0.12)] text-[var(--status-warning)]"><AlertTriangle size={17} /></span>
              <div><h2 className="font-semibold text-[var(--text-primary)]">Provider Health: Warning</h2><p className="text-xs text-[var(--text-secondary)]">OpenAI GPT-5 latency is elevated. Approved fallbacks are ready.</p></div>
            </div>
            <div className="flex gap-2">
              <ActionButton variant="secondary" onClick={() => showToast("Provider status refreshed")}><RefreshCw size={14} /> Refresh</ActionButton>
              <Link href="/dashboard/approval-inbox" className="inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--brand-primary-dark)]">Request approval</Link>
            </div>
          </div>
          <div className="grid gap-px bg-[var(--border-subtle)] md:grid-cols-2 xl:grid-cols-4">
            {providerHealth.map((provider) => (
              <div key={provider.provider} className="bg-white p-4">
                <div className="flex items-center justify-between gap-2"><p className="font-semibold">{provider.provider}</p><StatusBadge value={provider.status} /></div>
                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{provider.impact}</p>
                <button type="button" onClick={() => provider.provider === "OpenAI" ? requestRoutingApproval(provider.provider) : showToast(`${provider.provider} provider details opened`)} className="mt-2 text-xs font-semibold text-[var(--brand-primary)]">
                  {provider.provider === "OpenAI" ? "Request approval" : provider.status === "Self-hosted" ? "Open server telemetry" : "Review provider"} <ChevronRight className="inline" size={13} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card id="model-catalog" className="mt-3 overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 md:flex-row md:items-center">
            <div><h2 className="font-semibold text-[var(--text-primary)]">Governed Model Catalog</h2><p className="mt-0.5 text-xs text-[var(--text-secondary)]">{visible.length} models in the selected scope</p></div>
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1">
              {filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`shrink-0 rounded px-3 py-1.5 text-xs font-medium ${filter === item ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-white"}`}>{item}</button>)}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-secondary)]">
                <tr>{["Model", "Hosting", "Data Boundary", "Provider Health", "Target", "Sensitivity Fit", "Status", "Action"].map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {visible.map((model) => {
                  const health = getProviderHealth(model);
                  const governance = modelGovernance[model.name] ?? { sensitivity: "Unassigned", fallback: "Not configured", cost: "Not configured", workspaces: "Unassigned", graduation: "Assess after usage" };
                  return (
                    <tr key={model.name} className="align-top hover:bg-[var(--surface-muted)]">
                      <td className="px-4 py-3.5"><p className="font-semibold text-[var(--text-primary)]">{model.name}</p><p className="mt-0.5 text-xs text-[var(--text-secondary)]">{model.provider}</p></td>
                      <td className="px-4 py-3.5">{model.hosting}</td>
                      <td className="px-4 py-3.5"><DataBoundaryChip value={boundaryForModel(model)} /></td>
                      <td className="px-4 py-3.5"><StatusBadge value={health?.status ?? "Unknown"} /></td>
                      <td className="max-w-[170px] px-4 py-3.5 text-[var(--text-secondary)]">{model.target}</td>
                      <td className="px-4 py-3.5"><span className="text-xs font-semibold text-[var(--brand-primary-dark)]">{governance.sensitivity}</span></td>
                      <td className="px-4 py-3.5"><StatusBadge value={model.status} /></td>
                      <td className="px-4 py-3.5">
                        <details className="group">
                          <summary className="cursor-pointer list-none whitespace-nowrap text-xs font-semibold text-[var(--brand-primary)]">View details <ChevronRight className="inline transition group-open:rotate-90" size={13} /></summary>
                          <div className="mt-3 w-72 rounded-md border border-[var(--border-subtle)] bg-white p-3 text-xs shadow-lg">
                            <div className="grid grid-cols-2 gap-2 text-[var(--text-secondary)]">
                              <span>Monthly requests</span><strong className="text-right text-[var(--text-primary)]">{model.requests}</strong>
                              <span>Average latency</span><strong className="text-right text-[var(--text-primary)]">{model.latency}</strong>
                              <span>Fallback</span><strong className="text-right text-[var(--text-primary)]">{governance.fallback}</strong>
                              <span>Cost</span><strong className="text-right text-[var(--text-primary)]">{governance.cost}</strong>
                              <span>Allowed teams</span><strong className="text-right text-[var(--text-primary)]">{model.access}</strong>
                              <span>Workspace access</span><strong className="text-right text-[var(--text-primary)]">{governance.workspaces}</strong>
                            </div>
                            <p className="mt-3 rounded bg-[var(--surface-muted)] p-2 font-medium text-[var(--brand-primary-dark)]">{governance.graduation}</p>
                            <button type="button" onClick={() => { showToast(`${model.name} policy opened`); addAudit("Model policy reviewed", model.name, "Model"); }} className="mt-3 font-semibold text-[var(--brand-primary)]">Manage policy</button>
                          </div>
                        </details>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-3 grid gap-3 xl:grid-cols-[0.8fr_1.2fr]">
          <Card className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Model Graduation Flywheel</p><h2 className="mt-1 text-lg font-semibold">61% graduation fit</h2></div>
              <Gauge size={20} className="text-[var(--brand-accent)]" />
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Repeated Support workloads can move from cloud spend to governed local capacity over time.</p>
            <div className="mt-3 rounded-md bg-[var(--surface-muted)] p-3"><p className="text-xs text-[var(--text-secondary)]">Projected annual savings</p><p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">AED 420,000</p></div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/dashboard/recommendations" className="inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--brand-primary-dark)]">Open in Recommendations</Link>
              <Link href="/dashboard/cost-capacity" className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-muted)]">Review savings</Link>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <div><h2 className="font-semibold">Routing Recommendations</h2><p className="mt-0.5 text-xs text-[var(--text-secondary)]">Best approved route by workload and sensitivity.</p></div>
              <Link href="/dashboard/routing-policies" className="text-xs font-semibold text-[var(--brand-primary)]">Open routing policies</Link>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {routingRecommendations.map((recommendation) => (
                <div key={recommendation.workload} className="grid gap-2 px-4 py-3 md:grid-cols-[150px_150px_1fr_auto] md:items-center">
                  <p className="text-sm font-semibold">{recommendation.workload}</p>
                  <p className="text-xs font-semibold text-[var(--brand-primary-dark)]">{recommendation.route}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{recommendation.rule}</p>
                  <Link href="/dashboard/recommendations" className="text-xs font-semibold text-[var(--brand-primary)] hover:underline">Open in Recommendations</Link>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {addOpen ? (
        <Modal title="Register a governed model" onClose={() => setAddOpen(false)}>
          <div className="max-h-[68vh] overflow-y-auto pr-1">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Provider"><input value={providerName} onChange={(event) => setProviderName(event.target.value)} className="field" /></Field>
              <Field label="Model name"><input value={modelName} onChange={(event) => setModelName(event.target.value)} className="field" /></Field>
              <Field label="Model type"><select value={modelType} onChange={(event) => setModelType(event.target.value)} className="field"><option>Cloud</option><option>Local</option></select></Field>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Endpoint"><input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} className="field" /></Field>
              <Field label="Secret reference"><input value={secretReference} onChange={(event) => setSecretReference(event.target.value)} className="field" /></Field>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Field label="Input cost / 1M tokens"><input value={inputCost} onChange={(event) => setInputCost(event.target.value)} className="field" /></Field>
              <Field label="Output cost / 1M tokens"><input value={outputCost} onChange={(event) => setOutputCost(event.target.value)} className="field" /></Field>
              <Field label="Context window"><input value={contextWindow} onChange={(event) => setContextWindow(event.target.value)} className="field" /></Field>
              <Field label="Sensitivity fit"><select value={sensitivity} onChange={(event) => setSensitivity(event.target.value)} className="field"><option>Public and internal</option><option>Internal only</option><option>Confidential with approval</option><option>Confidential local-only</option></select></Field>
              <Field label="Fallback eligible"><select value={fallbackEligible} onChange={(event) => setFallbackEligible(event.target.value)} className="field"><option>Yes</option><option>No</option><option>Only for non-sensitive work</option></select></Field>
              <Field label="Max concurrency"><input value={maxConcurrency} onChange={(event) => setMaxConcurrency(event.target.value)} className="field" /></Field>
              <Field label="GPU requirement"><input value={gpuRequirement} onChange={(event) => setGpuRequirement(event.target.value)} className="field" /></Field>
              <Field label="VRAM requirement"><input value={vramRequirement} onChange={(event) => setVramRequirement(event.target.value)} className="field" /></Field>
            </div>
            <p className="mt-4 rounded-md bg-[var(--surface-muted)] p-3 text-xs leading-5 text-[var(--text-secondary)]">Secrets stay server-side. The frontend stores only secret references, routing metadata, cost assumptions, and policy settings.</p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <ActionButton variant="secondary" onClick={() => { showToast(`${modelName} connection test passed`); addAudit("Model connection tested", modelName, "Model"); }}><Sparkles size={14} /> Test connection</ActionButton>
            <ActionButton onClick={addModel}><Plus size={14} /> Add to governed catalog</ActionButton>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="text-xs font-medium text-[var(--text-secondary)]">{label}<span className="mt-1.5 block [&_.field]:h-10 [&_.field]:w-full [&_.field]:rounded-md [&_.field]:border [&_.field]:border-[var(--border-subtle)] [&_.field]:bg-white [&_.field]:px-3 [&_.field]:text-sm [&_.field]:text-[var(--text-primary)]">{children}</span></label>;
}
