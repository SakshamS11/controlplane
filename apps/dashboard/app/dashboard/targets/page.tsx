"use client";

import Link from "next/link";
import { Activity, AlertTriangle, CheckCircle2, Gauge, Plus, ShieldCheck, TerminalSquare, Zap } from "lucide-react";
import { useState } from "react";
import { ActionButton, Card, DataTable, Modal, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { targets } from "@/lib/mock-data";

const installCommand = "curl -fsSL https://controlplane.example.com/install-agent.sh | sudo bash -s -- --token TARGET_TOKEN --url https://api.controlplane.example.com";
const serverCapacity = {
  acme: { gpuLoad: "71%", vram: "34 / 48 GB", recommendation: "Keep serving Qwen 32B and Open WebUI" },
  claims: { gpuLoad: "92%", vram: "22 / 24 GB", recommendation: "Increase Qwen capacity or reclaim Finance GPU" },
  aws: { gpuLoad: "54%", vram: "16 / 24 GB", recommendation: "Good fit for support cache and RAG" },
  legal: { gpuLoad: "n/a", vram: "n/a", recommendation: "Reconnect agent before any deployment" }
};

export default function DeploymentTargetsPage() {
  const [open, setOpen] = useState(false);
  const { showToast } = useAppState();

  return (
    <>
      <PageHeader
        eyebrow="Servers"
        title="Servers"
        description="Servers are the places where AI infrastructure runs: cloud VMs, on-prem GPU machines, local workstations, and provider environments."
        action={<ActionButton onClick={() => setOpen(true)}><Plus size={16} /> Add server</ActionButton>}
      />
      <Section>
        <div id="server-summary" className="mb-6 grid scroll-mt-24 gap-4 md:grid-cols-5">
          <Card className="p-5">
            <div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={20} /><div><div className="text-sm font-semibold">3 servers online</div><div className="text-xs text-slate-500">Ready for stack operations</div></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><AlertTriangle className="text-amber-600" size={20} /><div><div className="text-sm font-semibold">1 server warning</div><div className="text-xs text-slate-500">Claims GPU memory review</div></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><Activity className="text-cyan-700" size={20} /><div><div className="text-sm font-semibold">Fast path</div><div className="text-xs text-slate-500">Click Acme to run the demo</div></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><Zap className="text-[var(--brand-primary)]" size={20} /><div><div className="text-sm font-semibold">GPU watch</div><div className="text-xs text-slate-500">Claims peak is 92%</div></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" size={20} /><div><div className="text-sm font-semibold">Agent safe mode</div><div className="text-xs text-slate-500">Allowlisted commands only</div></div></div>
          </Card>
        </div>
        <Card className="mb-6 p-5">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-semibold">Top recommendation</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Claims On-Prem Node is near VRAM pressure. Reclaim underused Finance capacity first; if capacity is fully assigned, add one on-prem replica or increase approved Claude/GPT credits for non-sensitive fallback.</p>
            </div>
            <StatusBadge value="Warning" />
          </div>
        </Card>
        <Card id="server-list">
          <DataTable
            columns={["Server", "Type", "Region", "Agent", "Stack", "GPU", "GPU load", "VRAM", "Health", "Next step"]}
            rows={targets.map((target) => [
              <Link key="target" href={target.id === "acme" ? "/dashboard/targets/acme" : "/dashboard/targets"} className="font-semibold text-[var(--brand-primary)]">{target.name}</Link>,
              target.type,
              target.region,
              <StatusBadge key="agent" value={target.agent} />,
              target.stack,
              target.gpu,
              <span key="load" className="inline-flex items-center gap-2"><Gauge size={13} /> {serverCapacity[target.id as keyof typeof serverCapacity].gpuLoad}</span>,
              serverCapacity[target.id as keyof typeof serverCapacity].vram,
              <StatusBadge key="health" value={target.health} />,
              target.id === "acme" ? <Link key="next" href="/dashboard/targets/acme" className="font-semibold text-[var(--brand-primary)]">View server details</Link> : <span key="next" className="text-slate-500">{serverCapacity[target.id as keyof typeof serverCapacity].recommendation}</span>
            ])}
          />
        </Card>
      </Section>
      {open ? (
        <Modal title="Mock agent install command" onClose={() => setOpen(false)}>
          <p className="text-sm leading-6 text-slate-600">This mock command illustrates the eventual onboarding flow. It does not call a real backend.</p>
          <pre className="mt-4 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-cyan-100">{installCommand}</pre>
          <div className="mt-4 flex justify-end">
            <ActionButton variant="secondary" onClick={() => { navigator.clipboard?.writeText(installCommand); showToast("Install command copied"); }}><TerminalSquare size={16} /> Copy command</ActionButton>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
