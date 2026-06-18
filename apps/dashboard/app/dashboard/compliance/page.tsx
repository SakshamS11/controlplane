"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<"systems" | "evidence" | "gaps">("systems");

  function exportPack() {
    showToast("Evidence pack export simulated");
    addAudit("Evidence pack export simulated", "Compliance readiness", "Permission");
  }

  return (
    <>
      <PageHeader
        eyebrow="Compliance readiness"
        title="Compliance Readiness"
        description="Track evidence, risk, oversight, and gaps for ISO/IEC 42001 readiness support."
        action={<ActionButton onClick={exportPack}><Download size={16} /> Export readiness evidence</ActionButton>}
      />
      <Section>
        <Card className="mb-4 p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="font-semibold">ISO/IEC 42001 readiness support</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Evidence readiness supports preparation; it does not mean certification.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge value="Warning" />
              <Link href="/dashboard/recommendations" className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">Open governance recommendations</Link>
            </div>
          </div>
        </Card>
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Evidence readiness" value="72%" detail="Preparation coverage" status="Warning" icon={<ShieldCheck size={18} />} />
          <MetricCard label="AI systems registered" value="14" detail="Across teams and workspaces" status="Healthy" icon={<FileCheck2 size={18} />} />
          <MetricCard label="Risk assessments" value="9/14" detail="5 still require review" status="Warning" icon={<TriangleAlert size={18} />} />
          <MetricCard label="Human oversight" value="11/14" detail="Configured controls" status="Healthy" icon={<ShieldCheck size={18} />} />
          <MetricCard label="Evidence collected" value="286" detail="Mock evidence items" status="Healthy" icon={<FileCheck2 size={18} />} />
        </div>

        <Card className="overflow-hidden">
          <div className="flex overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1.5">
            {[
              ["systems", "AI System Registry"],
              ["evidence", "Evidence Vault"],
              ["gaps", "Governance Gaps"]
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => setActiveTab(id as "systems" | "evidence" | "gaps")} className={`rounded-md px-3 py-2 text-xs font-medium ${activeTab === id ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-white"}`}>{label}</button>
            ))}
          </div>
          {activeTab === "systems" ? (
            <DataTable
              columns={["AI system", "Owner", "Risk assessment", "Human oversight"]}
              rows={registry.map((row) => [row[0], row[1], <StatusBadge key="risk" value={row[2]} />, row[3]])}
            />
          ) : null}
          {activeTab === "evidence" ? (
            <DataTable
              columns={["Category", "Event", "Evidence label", "Status"]}
              rows={evidence.map((row) => [row[0], row[1], row[2], <StatusBadge key="status" value={row[3]} />])}
            />
          ) : null}
          {activeTab === "gaps" ? (
            <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
              {["Finance retention policy pending", "5 risk assessments incomplete", "Provider drift response needs owner", "Evidence export needs review approver", "Agent tool registry incomplete"].map((gap) => (
                <div key={gap} className="rounded-md border border-amber-100 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                  <div>{gap}</div>
                  <Link href="/dashboard/recommendations" className="mt-2 inline-flex text-xs font-semibold text-amber-950 underline">Open in Recommendations</Link>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      </Section>
    </>
  );
}
