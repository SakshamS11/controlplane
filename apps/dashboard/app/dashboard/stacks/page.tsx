"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  Code2,
  Cpu,
  FileCheck2,
  Layers3,
  LockKeyhole,
  Rocket,
  Server,
  ShieldCheck
} from "lucide-react";
import { ActionButton, Card, Modal, Section, useAppState } from "@/components/ui";
import { stacks } from "@/lib/mock-data";

const stackTemplates = [
  ...stacks,
  {
    name: "Secure Local-Only Stack",
    includes: ["vLLM", "LiteLLM", "Open WebUI", "Qdrant", "Audit exporter", "Prompt Firewall"],
    useCase: "Confidential workspaces with no external model fallback",
    infra: "1-2 GPU servers, private document store, strict egress controls"
  }
];

const stackDecisions = {
  "Private AI Basic": {
    bestFor: "First private AI deployment",
    sensitivity: "Internal",
    complexity: "Low",
    privateStack: true,
    evidenceHooks: false
  },
  "Private RAG Stack": {
    bestFor: "Knowledge assistants and document search",
    sensitivity: "Confidential",
    complexity: "Medium",
    privateStack: true,
    evidenceHooks: false
  },
  "Claims AI Stack": {
    bestFor: "Regulated claims operations",
    sensitivity: "Restricted",
    complexity: "High",
    privateStack: true,
    evidenceHooks: true
  },
  "Developer AI Stack": {
    bestFor: "Engineering copilots and code workflows",
    sensitivity: "Internal",
    complexity: "Medium",
    privateStack: false,
    evidenceHooks: false
  },
  "Secure Local-Only Stack": {
    bestFor: "Sovereign and highly sensitive workloads",
    sensitivity: "Restricted",
    complexity: "High",
    privateStack: true,
    evidenceHooks: true
  }
} as const;

type StackTemplate = (typeof stackTemplates)[number];

function DecisionBadge({ label, value }: { label: string; value: string }) {
  const valueClass = value === "Restricted" || value === "High"
    ? "text-[var(--status-critical)]"
    : value === "Confidential" || value === "Medium"
      ? "text-[var(--status-warning)]"
      : "text-[var(--status-healthy)]";

  return (
    <div className="min-w-0 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">{label}</p>
      <p className={`mt-0.5 truncate text-xs font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

export default function StacksPage() {
  const { showToast, addAudit } = useAppState();
  const [selectedStack, setSelectedStack] = useState<StackTemplate | null>(null);

  function simulateDeploy(stack: StackTemplate) {
    showToast(`${stack.name} deployment simulated`);
    addAudit("Stack deployment simulated", stack.name, "Deployment");
  }

  function requestDeploymentApproval(stack: StackTemplate) {
    showToast(`Deployment approval request simulated for ${stack.name}`);
    addAudit("Stack deployment approval requested", stack.name, "Permission");
  }

  return (
    <>
      <Section>
        <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Operate</p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Stacks</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Compare deployable AI infrastructure templates by workload, sensitivity, and operating complexity.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <CheckCircle2 size={15} className="text-[var(--status-healthy)]" />
            Docker Compose templates ready
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Templates", value: "5", detail: "Deployment-ready catalog", icon: <Layers3 size={17} /> },
            { label: "Private stacks", value: "3", detail: "Sovereignty-first options", icon: <LockKeyhole size={17} /> },
            { label: "Target fit", value: "GPU server", detail: "Agent-managed Compose", icon: <Server size={17} /> },
            { label: "Governance", value: "Audit ready", detail: "Evidence hooks available", icon: <ShieldCheck size={17} /> }
          ].map((metric) => (
            <Card key={metric.label} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--text-secondary)]">{metric.label}</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{metric.value}</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{metric.detail}</p>
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[rgba(91,61,255,0.10)] text-[var(--brand-primary)]">
                  {metric.icon}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-3 flex flex-col justify-between gap-3 rounded-lg border border-[rgba(91,61,255,0.18)] bg-[rgba(91,61,255,0.05)] px-4 py-3 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <Rocket size={17} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Recommended deployment path</p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                Validate the first server with Private AI Basic, then use Claims AI or Secure Local-Only for regulated workloads.
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-semibold text-[var(--brand-primary-dark)]">Start simple, graduate by sensitivity</span>
        </div>

        <div id="stack-templates" className="mt-4 grid scroll-mt-24 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {stackTemplates.map((stack) => {
            const decision = stackDecisions[stack.name as keyof typeof stackDecisions];

            return (
              <Card key={stack.name} className="flex min-h-[370px] flex-col overflow-hidden">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-4 py-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[var(--text-primary)]">{stack.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--text-secondary)]">{stack.useCase}</p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[rgba(91,61,255,0.10)] text-[var(--brand-primary)]">
                    <Rocket size={17} />
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">Best for</p>
                      <p className="mt-0.5 text-xs font-semibold text-[var(--text-primary)]">{decision.bestFor}</p>
                    </div>
                    <DecisionBadge label="Sensitivity fit" value={decision.sensitivity} />
                    <DecisionBadge label="Complexity" value={decision.complexity} />
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">Services included</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {stack.includes.map((item) => (
                        <span key={item} className="rounded bg-[var(--surface-muted)] px-2 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--text-secondary)]">
                    <Cpu size={14} className="mt-0.5 shrink-0 text-[var(--brand-accent)]" />
                    <span><strong className="font-semibold text-[var(--text-primary)]">Infrastructure:</strong> {stack.infra}</span>
                  </div>

                  <div className="mt-3 min-h-9">
                    {decision.evidenceHooks ? (
                      <div className="flex items-start gap-2 rounded-md bg-[rgba(16,185,129,0.08)] px-2.5 py-2 text-xs text-[var(--status-healthy)]">
                        <FileCheck2 size={14} className="mt-0.5 shrink-0" />
                        <span>ISO/IEC 42001 readiness support · Audit/evidence hooks included</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <FileCheck2 size={14} />
                        Simulated deployment events and rollback evidence
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <ActionButton onClick={() => simulateDeploy(stack)}>
                      <Rocket size={15} /> Simulate deploy
                    </ActionButton>
                    <Link href="/dashboard/approval-inbox" onClick={() => requestDeploymentApproval(stack)} className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-muted)]">
                      Request approval
                    </Link>
                    <ActionButton variant="secondary" onClick={() => setSelectedStack(stack)}>
                      <Code2 size={15} /> View template
                    </ActionButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {selectedStack ? (
        <Modal title={selectedStack.name} onClose={() => setSelectedStack(null)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Use case</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-primary)]">{selectedStack.useCase}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Recommended infrastructure</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-primary)]">{selectedStack.infra}</p>
            </div>
          </div>
          <div className="mt-4 rounded-md bg-[var(--surface-dark)] p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Template services</p>
            <pre className="mt-2 whitespace-pre-wrap text-xs leading-6 text-cyan-100">
              {`services:\n${selectedStack.includes.map((service) => `  ${service.toLowerCase().replaceAll(" ", "-")}:\n    enabled: true`).join("\n")}`}
            </pre>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Link href="/dashboard/approval-inbox" onClick={() => requestDeploymentApproval(selectedStack)} className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-muted)]">
              Request deployment approval
            </Link>
            <ActionButton onClick={() => simulateDeploy(selectedStack)}>
              <Rocket size={15} /> Simulate deploy
            </ActionButton>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
