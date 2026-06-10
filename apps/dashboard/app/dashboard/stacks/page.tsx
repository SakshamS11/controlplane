"use client";

import { Code2, LockKeyhole, Rocket, Server, ShieldCheck, Sparkles } from "lucide-react";
import { ActionButton, Card, MetricCard, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { stacks } from "@/lib/mock-data";

const stackTemplates = [
  ...stacks,
  { name: "Secure Local-Only Stack", includes: ["vLLM", "LiteLLM", "Open WebUI", "Qdrant", "Audit exporter", "Prompt Firewall"], useCase: "Confidential workspaces with no external model fallback", infra: "1-2 GPU servers, private document store, strict egress controls" }
];

export default function StacksPage() {
  const { showToast, addAudit } = useAppState();
  return (
    <>
      <PageHeader eyebrow="Stack templates" title="Stacks" description="Deployable AI stack templates package model serving, gateways, UIs, vector databases, monitoring, and audit controls." />
      <Section>
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Templates" value="5" detail="Compose-based deployment packs" status="Healthy" icon={<Rocket size={18} />} />
          <MetricCard label="Private stacks" value="3" detail="Local and sovereignty-first" status="Healthy" icon={<LockKeyhole size={18} />} />
          <MetricCard label="Target fit" value="GPU server" detail="Docker Compose agent operation" status="Running" icon={<Server size={18} />} />
          <MetricCard label="Governance" value="Audit ready" detail="Prompt firewall and evidence hooks" status="Healthy" icon={<ShieldCheck size={18} />} />
        </div>
        <Card className="mb-6 p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="font-semibold">Recommended deployment path</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Use Private AI Basic for first server validation, then graduate regulated teams to Secure Local-Only or Claims AI Stack.</p>
            </div>
            <StatusBadge value="Healthy" />
          </div>
        </Card>
        <div id="stack-templates" className="grid scroll-mt-24 gap-5 xl:grid-cols-2">
          {stackTemplates.map((stack) => (
            <Card key={stack.name} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{stack.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{stack.useCase}</p>
                </div>
                <div className="rounded-md bg-[rgba(91,61,255,0.10)] p-2 text-[var(--brand-primary)]"><Rocket size={18} /></div>
              </div>
              <div className="mt-5">
                <div className="text-xs font-semibold uppercase text-slate-500">Services included</div>
                <div className="mt-2 flex flex-wrap gap-2">{stack.includes.map((item) => <span key={item} className="rounded-md bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">{item}</span>)}</div>
              </div>
              <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"><span className="font-medium text-slate-900">Recommended infrastructure:</span> {stack.infra}</div>
              <div className="mt-3 rounded-md border border-[rgba(22,199,232,0.18)] bg-[rgba(22,199,232,0.08)] p-3 text-sm text-cyan-900"><Sparkles className="mr-2 inline" size={14} /> Includes simulated deployment events, service health, and rollback evidence.</div>
              <div className="mt-5 flex flex-wrap gap-2">
                <ActionButton onClick={() => { showToast(`${stack.name} deployment simulated`); addAudit(`${stack.name} deployment requested`, stack.name); }}><Rocket size={15} /> Simulate deploy</ActionButton>
                <ActionButton variant="secondary" onClick={() => showToast(`${stack.name} template preview opened`)}><Code2 size={15} /> View template</ActionButton>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
