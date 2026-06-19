"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  ChevronRight,
  CircleDollarSign,
  Plus,
  Route,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react";
import { ActionButton, Card, DataBoundaryChip, Modal, Section, StatusBadge, useAppState } from "@/components/ui";

type Policy = {
  name: string;
  scope: string;
  task: string;
  sensitivity: string;
  primary: string;
  fallback: string;
  blocked: string;
  status: string;
};

const policySeed: Policy[] = [
  { name: "Sovereignty Router", scope: "Legal and Claims", task: "Confidential retrieval", sensitivity: "Restricted", primary: "Qwen 32B", fallback: "No external fallback", blocked: "GPT-5, Claude, Gemini", status: "Healthy" },
  { name: "Marketing Cost Ladder", scope: "Marketing Studio", task: "Drafting and summarization", sensitivity: "Public", primary: "Gemini", fallback: "Claude, then GPT-5", blocked: "GPT-5 full", status: "Cost risk" },
  { name: "Provider Degradation", scope: "All external workspaces", task: "Provider incident routing", sensitivity: "Internal", primary: "Claude", fallback: "Qwen 32B for sensitive work", blocked: "Degraded provider", status: "Warning" },
  { name: "Budget Circuit Breaker", scope: "Marketing and Engineering", task: "Budget protection", sensitivity: "Internal", primary: "Cheapest approved model", fallback: "Approval, then hard stop", blocked: "Premium model over budget", status: "Healthy" },
  { name: "Prompt Firewall", scope: "All workspaces", task: "Sensitive prompt inspection", sensitivity: "Confidential", primary: "Local-safe model", fallback: "Human approval", blocked: "Unsafe external route", status: "Healthy" },
  { name: "Legal confidential review", scope: "Legal AI Assistant", task: "Contract review", sensitivity: "Confidential", primary: "Qwen 32B", fallback: "Claude for non-sensitive drafting", blocked: "GPT-5, Gemini", status: "Governance risk" },
  { name: "Claims sensitive workflow", scope: "Claims AI Assistant", task: "Claim summarization", sensitivity: "Restricted", primary: "Qwen 32B", fallback: "No external fallback", blocked: "GPT-5, Claude, Gemini", status: "Healthy" },
  { name: "Engineering code assist", scope: "Engineering Copilot", task: "Code review", sensitivity: "Internal", primary: "DeepSeek Coder", fallback: "Claude, then GPT-5", blocked: "None", status: "Healthy" },
  { name: "Marketing drafting economy", scope: "Marketing Studio", task: "Drafting and summarization", sensitivity: "Public", primary: "Gemini", fallback: "GPT-5 mini for executive content", blocked: "GPT-5 full", status: "Cost risk" }
];

const modules = [
  { name: "Sovereignty Router", control: "Sensitive data routes to local models", status: "Active", affected: "2 teams", icon: ShieldCheck },
  { name: "Marketing Cost Ladder", control: "Drafting uses the lowest approved model tier", status: "Active", affected: "1 workspace", icon: CircleDollarSign },
  { name: "Provider Degradation", control: "Traffic reroutes when provider health declines", status: "Warning", affected: "4 workspaces", icon: ArrowRightLeft },
  { name: "Budget Circuit Breaker", control: "Premium routes stop at configured limits", status: "Active", affected: "2 teams", icon: WalletCards },
  { name: "Prompt Firewall", control: "Sensitive prompts are inspected before routing", status: "Active", affected: "5 workspaces", icon: ShieldCheck }
];

const suggestions = [
  { workload: "Legal confidential", route: "Qwen 32B first", rule: "Claude only for non-sensitive drafting" },
  { workload: "Claims sensitive", route: "Qwen 32B only", rule: "No external fallback" },
  { workload: "Engineering code", route: "DeepSeek Coder", rule: "Then Claude or GPT-5" },
  { workload: "Marketing drafting", route: "Gemini first", rule: "GPT-5 only for executive content" }
];

const filters = ["All", "Sensitive", "Cost risk", "Provider issue", "Local-only", "External allowed"] as const;

const emptyPolicy: Policy = {
  name: "",
  scope: "All workspaces",
  task: "",
  sensitivity: "Internal",
  primary: "Qwen 32B",
  fallback: "No fallback",
  blocked: "None",
  status: "Healthy"
};

export default function RoutingPoliciesPage() {
  const [policies, setPolicies] = useState(policySeed);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<Policy>(emptyPolicy);
  const { showToast, addAudit, modelCatalog } = useAppState();
  const activeModelOptions = modelCatalog
    .filter((model) => model.status === "Running" || model.status === "Connected")
    .map((model) => model.name);

  useEffect(() => {
    function syncCreateAction() {
      if (window.location.hash === "#routing-form") {
        setDraft({ ...emptyPolicy, primary: "Qwen 32B" });
        setEditorOpen(true);
      }
    }
    syncCreateAction();
    window.addEventListener("hashchange", syncCreateAction);
    return () => window.removeEventListener("hashchange", syncCreateAction);
  }, []);

  const visiblePolicies = useMemo(() => policies.filter((policy) => {
    if (filter === "Sensitive") return policy.sensitivity === "Confidential" || policy.sensitivity === "Restricted";
    if (filter === "Cost risk") return policy.status === "Cost risk" || policy.name.includes("Budget") || policy.name.includes("Cost");
    if (filter === "Provider issue") return policy.name === "Provider Degradation" || policy.status === "Warning";
    if (filter === "Local-only") return policy.primary.includes("Qwen") || policy.primary.includes("Local") || policy.fallback.includes("No external");
    if (filter === "External allowed") return policy.primary === "Claude" || policy.primary === "Gemini" || policy.primary.includes("GPT");
    return true;
  }), [filter, policies]);

  function openCreate() {
    setDraft({ ...emptyPolicy, primary: activeModelOptions[0] ?? "Qwen 32B" });
    setEditorOpen(true);
  }

  function openEdit(policy: Policy) {
    setDraft(policy);
    setEditorOpen(true);
    addAudit("Routing policy opened", policy.name, "Model");
  }

  function savePolicy() {
    if (!draft.name.trim()) {
      showToast("Enter a policy name");
      return;
    }
    const saved = {
      ...draft,
      status: draft.sensitivity === "Confidential" ? "Governance risk" : draft.status
    };
    setPolicies((current) => [saved, ...current.filter((item) => item.name !== saved.name)]);
    showToast(`${saved.name} routing policy saved`);
    addAudit("Routing policy saved", saved.name, "Model");
    setEditorOpen(false);
    window.history.replaceState(null, "", window.location.pathname);
  }

  function reviewModule(name: string) {
    const policy = policies.find((item) => item.name === name);
    if (policy) openEdit(policy);
    else showToast(`${name} rules opened`);
  }

  return (
    <>
      <Section>
        <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">AI Platform</p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Routing Policies</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Govern sensitive routes, provider fallback, model blocks, cost controls, and prompt inspection.
            </p>
          </div>
          <ActionButton onClick={openCreate}><Plus size={15} /> Create Policy</ActionButton>
        </div>

        <Card className="overflow-hidden border-l-4 border-l-[var(--status-warning)]">
          <div className="flex flex-col justify-between gap-4 px-4 py-3 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[rgba(245,158,11,0.12)] text-[var(--status-warning)]">
                <AlertTriangle size={18} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-[var(--text-primary)]">OpenAI degraded</h2>
                  <StatusBadge value="Degraded" />
                  <span className="text-xs text-[var(--text-secondary)]">48 seconds ago</span>
                </div>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Elevated latency on GPT-5 requests. Active response lives in Incidents; production route changes go through Approval Inbox.</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href="/dashboard/incidents" className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-muted)]">
                View incident
              </Link>
              <Link href="/dashboard/monitoring" className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-muted)]">
                Open monitoring
              </Link>
              <Link href="/dashboard/approval-inbox" className="inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--brand-primary-dark)]">
                Request approval
              </Link>
            </div>
          </div>
        </Card>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.name} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-[rgba(91,61,255,0.10)] text-[var(--brand-primary)]"><Icon size={16} /></span>
                  <StatusBadge value={module.status} />
                </div>
                <h2 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{module.name}</h2>
                <p className="mt-1 min-h-10 text-xs leading-5 text-[var(--text-secondary)]">{module.control}</p>
                <div className="mt-3"><DataBoundaryChip value={module.name === "Sovereignty Router" || module.name === "Prompt Firewall" ? "Private GPU Runtime" : module.name === "Provider Degradation" ? "External AI Provider" : "Customer Cloud"} /></div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--text-secondary)]">{module.affected}</span>
                  <button type="button" onClick={() => reviewModule(module.name)} className="text-xs font-semibold text-[var(--brand-primary)]">Review rules</button>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-3 overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 md:flex-row md:items-center">
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Active Policy Registry</h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{visiblePolicies.length} policies in the selected scope</p>
            </div>
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1">
              {filters.map((item) => (
                <button key={item} type="button" onClick={() => setFilter(item)} className={`shrink-0 rounded px-3 py-1.5 text-xs font-medium transition ${filter === item ? "bg-[var(--brand-primary)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:bg-white hover:text-[var(--text-primary)]"}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-secondary)]">
                <tr>{["Policy", "Scope", "Boundary", "Sensitivity", "Primary Route", "Fallback", "Blocked", "Status", "Action"].map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 font-semibold">{column}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {visiblePolicies.map((policy) => (
                  <tr key={policy.name} className="hover:bg-[var(--surface-muted)]">
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <p className="font-semibold text-[var(--text-primary)]">{policy.name}</p>
                      <details className="mt-1">
                        <summary className="cursor-pointer list-none text-xs text-[var(--brand-primary)]">Task details <ChevronRight className="inline" size={12} /></summary>
                        <p className="mt-1 max-w-xs text-xs text-[var(--text-secondary)]">{policy.task}</p>
                      </details>
                    </td>
                    <td className="max-w-[190px] px-4 py-3.5 text-[var(--text-secondary)]">{policy.scope}</td>
                    <td className="whitespace-nowrap px-4 py-3.5"><DataBoundaryChip value={policy.primary.includes("Qwen") || policy.fallback.includes("No external") || policy.primary.includes("Local") ? "Private GPU Runtime" : "External AI Provider"} /></td>
                    <td className="whitespace-nowrap px-4 py-3.5"><span className="text-xs font-semibold text-[var(--brand-primary-dark)]">{policy.sensitivity}</span></td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-[var(--text-primary)]">{policy.primary}</td>
                    <td className="max-w-[210px] px-4 py-3.5 text-xs leading-5 text-[var(--text-secondary)]">{policy.fallback}</td>
                    <td className="max-w-[190px] px-4 py-3.5 text-xs text-[var(--text-secondary)]">{policy.blocked}</td>
                    <td className="whitespace-nowrap px-4 py-3.5"><StatusBadge value={policy.status} /></td>
                    <td className="px-4 py-3.5"><ActionButton variant="secondary" onClick={() => openEdit(policy)}>Edit</ActionButton></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="mt-3 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Model Suggestions</h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Recommended route based on workload sensitivity and cost.</p>
            </div>
            <Sparkles size={17} className="text-[var(--brand-accent)]" />
          </div>
          <div className="grid gap-px bg-[var(--border-subtle)] md:grid-cols-2 xl:grid-cols-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.workload} className="bg-white p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{suggestion.workload}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--brand-primary-dark)]">{suggestion.route}</p>
                <p className="mt-1 min-h-8 text-xs leading-4 text-[var(--text-secondary)]">{suggestion.rule}</p>
                <button type="button" onClick={() => setFilter(suggestion.workload.includes("Legal") || suggestion.workload.includes("Claims") ? "Sensitive" : suggestion.workload.includes("Marketing") ? "Cost risk" : "All")} className="mt-2 inline-flex text-xs font-semibold text-[var(--brand-primary)] hover:underline">Review matching policies</button>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {editorOpen ? (
        <Modal title={policies.some((policy) => policy.name === draft.name) ? "Edit routing policy" : "Create routing policy"} onClose={() => setEditorOpen(false)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Policy name"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
            <Field label="Workspace / team scope"><input value={draft.scope} onChange={(event) => setDraft({ ...draft, scope: event.target.value })} /></Field>
            <Field label="Task type"><input value={draft.task} onChange={(event) => setDraft({ ...draft, task: event.target.value })} /></Field>
            <Field label="Sensitivity">
              <select value={draft.sensitivity} onChange={(event) => setDraft({ ...draft, sensitivity: event.target.value })}>
                <option>Public</option><option>Internal</option><option>Confidential</option><option>Restricted</option>
              </select>
            </Field>
            <Field label="Primary model">
              <select value={draft.primary} onChange={(event) => setDraft({ ...draft, primary: event.target.value })}>
                {activeModelOptions.map((model) => <option key={model}>{model}</option>)}
                {!activeModelOptions.includes(draft.primary) ? <option>{draft.primary}</option> : null}
              </select>
            </Field>
            <Field label="Fallback policy"><input value={draft.fallback} onChange={(event) => setDraft({ ...draft, fallback: event.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Blocked models"><input value={draft.blocked} onChange={(event) => setDraft({ ...draft, blocked: event.target.value })} /></Field></div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <ActionButton variant="secondary" onClick={() => setEditorOpen(false)}>Cancel</ActionButton>
            <ActionButton onClick={savePolicy}><Route size={15} /> Save routing policy</ActionButton>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-xs font-medium text-[var(--text-secondary)]">
      {label}
      <span className="mt-1.5 block [&>input]:h-10 [&>input]:w-full [&>input]:rounded-md [&>input]:border [&>input]:border-[var(--border-subtle)] [&>input]:px-3 [&>input]:text-sm [&>select]:h-10 [&>select]:w-full [&>select]:rounded-md [&>select]:border [&>select]:border-[var(--border-subtle)] [&>select]:bg-white [&>select]:px-3 [&>select]:text-sm">
        {children}
      </span>
    </label>
  );
}
