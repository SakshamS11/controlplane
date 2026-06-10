"use client";

import { Download, FileCheck2, ShieldCheck, TriangleAlert } from "lucide-react";
import { ActionButton, Card, DataTable, MetricCard, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

const registry = [
  ["Legal AI Assistant", "Legal", "Completed", "Human review configured"],
  ["Claims AI Assistant", "Claims", "In progress", "Decision support only"],
  ["Engineering Copilot", "Engineering", "Completed", "Merge approval required"],
  ["Finance AI Desk", "Finance", "Open gap", "Retention policy pending"]
];

const evidence = [
  ["Policy change", "Legal model access changed", "ISO/IEC 42001 evidence", "Collected"],
  ["Routing decision", "Claims external model blocked", "Sovereignty route", "Collected"],
  ["Human approval", "Contract Review Agent requires approval", "Oversight control", "Collected"],
  ["Governance gap", "Finance retention policy pending", "Open gap", "Open"]
];

export default function ComplianceReadinessPage() {
  const { showToast, addAudit } = useAppState();

  function exportPack() {
    showToast("Evidence pack export simulated");
    addAudit("Evidence pack export simulated", "Compliance readiness", "Permission");
  }

  return (
    <>
      <PageHeader
        eyebrow="Compliance readiness"
        title="Compliance Readiness"
        description="Organize AI system evidence, risk assessments, human oversight, audit logs, and governance gaps. This supports readiness work only; it does not guarantee certification."
        action={<ActionButton onClick={exportPack}><Download size={16} /> Export readiness evidence</ActionButton>}
      />
      <Section>
        <Card className="mb-6 p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="font-semibold">ISO/IEC 42001 readiness support</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">This page helps prepare evidence for review. Certification requires an independent formal audit and is not guaranteed by the product.</p>
            </div>
            <StatusBadge value="Warning" />
          </div>
        </Card>
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Readiness support score" value="72%" detail="Not a certification score" status="Warning" icon={<ShieldCheck size={18} />} />
          <MetricCard label="AI systems registered" value="14" detail="Across teams and workspaces" status="Healthy" icon={<FileCheck2 size={18} />} />
          <MetricCard label="Risk assessments" value="9/14" detail="5 still require review" status="Warning" icon={<TriangleAlert size={18} />} />
          <MetricCard label="Human oversight" value="11/14" detail="Configured controls" status="Healthy" icon={<ShieldCheck size={18} />} />
          <MetricCard label="Evidence collected" value="286" detail="Mock evidence items" status="Healthy" icon={<FileCheck2 size={18} />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card className="overflow-hidden">
            <div className="border-b border-[var(--border-subtle)] px-5 py-4">
              <h2 className="font-semibold">AI system registry</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Registered mock AI systems and oversight posture.</p>
            </div>
            <DataTable
              columns={["AI system", "Owner", "Risk assessment", "Human oversight"]}
              rows={registry.map((row) => [row[0], row[1], <StatusBadge key="risk" value={row[2]} />, row[3]])}
            />
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold">Governance gaps</h2>
            <div className="mt-4 space-y-3">
              {["Finance retention policy pending", "5 risk assessments incomplete", "Provider drift response needs owner", "Evidence export needs review approver", "Agent tool registry incomplete"].map((gap) => (
                <div key={gap} className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900">{gap}</div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="mt-6 overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="font-semibold">Evidence vault</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Evidence-oriented audit labels for readiness support.</p>
          </div>
          <DataTable
            columns={["Category", "Event", "Evidence label", "Status"]}
            rows={evidence.map((row) => [row[0], row[1], row[2], <StatusBadge key="status" value={row[3]} />])}
          />
        </Card>
      </Section>
    </>
  );
}
