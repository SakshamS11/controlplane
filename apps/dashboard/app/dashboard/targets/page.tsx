"use client";

import Link from "next/link";
import { Activity, AlertTriangle, CheckCircle2, Plus, TerminalSquare } from "lucide-react";
import { useState } from "react";
import { ActionButton, Card, DataTable, Modal, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { targets } from "@/lib/mock-data";

const installCommand = "curl -fsSL https://controlplane.example.com/install-agent.sh | sudo bash -s -- --token TARGET_TOKEN --url https://api.controlplane.example.com";

export default function DeploymentTargetsPage() {
  const [open, setOpen] = useState(false);
  const { showToast } = useAppState();

  return (
    <>
      <PageHeader
        eyebrow="Servers"
        title="Manage connected AI infrastructure"
        description="Servers are the places where AI infrastructure runs: cloud VMs, on-prem GPU machines, local workstations, and provider environments."
        action={<ActionButton onClick={() => setOpen(true)}><Plus size={16} /> Add server</ActionButton>}
      />
      <Section>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={20} /><div><div className="text-sm font-semibold">3 servers online</div><div className="text-xs text-slate-500">Ready for stack operations</div></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><AlertTriangle className="text-amber-600" size={20} /><div><div className="text-sm font-semibold">1 server warning</div><div className="text-xs text-slate-500">Claims GPU memory review</div></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><Activity className="text-cyan-700" size={20} /><div><div className="text-sm font-semibold">Fast path</div><div className="text-xs text-slate-500">Click Acme to run the demo</div></div></div>
          </Card>
        </div>
        <Card>
          <DataTable
            columns={["Server", "Type", "Region", "Agent", "Stack", "GPU", "Health", "Next step"]}
            rows={targets.map((target) => [
              <Link key="target" href={target.id === "acme" ? "/dashboard/targets/acme" : "#"} className="font-semibold text-cyan-700">{target.name}</Link>,
              target.type,
              target.region,
              <StatusBadge key="agent" value={target.agent} />,
              target.stack,
              target.gpu,
              <StatusBadge key="health" value={target.health} />,
              target.id === "acme" ? <Link key="next" href="/dashboard/targets/acme" className="font-semibold text-cyan-700">View server details</Link> : <span key="next" className="text-slate-500">Review status</span>
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
