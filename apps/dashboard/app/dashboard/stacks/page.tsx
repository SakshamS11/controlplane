"use client";

import { Code2, Rocket } from "lucide-react";
import { ActionButton, Card, PageHeader, Section, useAppState } from "@/components/ui";
import { stacks } from "@/lib/mock-data";

export default function StacksPage() {
  const { showToast, addAudit } = useAppState();
  return (
    <>
      <PageHeader eyebrow="Stack templates" title="Deployable AI stack templates" description="Mock templates show how the platform packages model serving, gateways, UIs, vector databases, monitoring, and audit controls." />
      <Section>
        <div id="stack-templates" className="grid scroll-mt-24 gap-5 xl:grid-cols-2">
          {stacks.map((stack) => (
            <Card key={stack.name} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{stack.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{stack.useCase}</p>
                </div>
                <div className="rounded-md bg-cyan-50 p-2 text-cyan-700"><Rocket size={18} /></div>
              </div>
              <div className="mt-5">
                <div className="text-xs font-semibold uppercase text-slate-500">Services included</div>
                <div className="mt-2 flex flex-wrap gap-2">{stack.includes.map((item) => <span key={item} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{item}</span>)}</div>
              </div>
              <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"><span className="font-medium text-slate-900">Recommended infrastructure:</span> {stack.infra}</div>
              <div className="mt-5 flex flex-wrap gap-2">
                <ActionButton onClick={() => { showToast(`${stack.name} deployment simulated`); addAudit(`${stack.name} deployment requested`, stack.name); }}><Rocket size={15} /> Deploy</ActionButton>
                <ActionButton variant="secondary" onClick={() => showToast(`${stack.name} template preview opened`)}><Code2 size={15} /> View template</ActionButton>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
