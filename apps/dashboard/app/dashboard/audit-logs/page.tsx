"use client";

import { useState } from "react";
import { Filter, ScrollText, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import { Card, DataTable, MetricCard, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

const filters = ["All", "Deployment", "Permission", "Model", "Routing", "Knowledge", "Workspace", "Agent", "Alert", "Compliance evidence"];

export default function AuditLogsPage() {
  const { auditRows } = useAppState();
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<"events" | "coverage">("events");
  const rows = auditRows.filter((row) => filter === "All" || row.type === filter);
  return (
    <>
      <PageHeader eyebrow="Audit trail" title="Enterprise audit logs" description="Review infrastructure, model, access, alert, and agent events." />
      <Section>
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Events captured" value={String(auditRows.length)} detail="Admin, agent, model, and alert events" status="Healthy" icon={<ScrollText size={18} />} />
          <MetricCard label="Open severity" value="2" detail="Budget and agent alerts" status="Warning" icon={<TriangleAlert size={18} />} />
          <MetricCard label="Evidence labels" value="7" detail="ISO readiness support only" status="Healthy" icon={<ShieldCheck size={18} />} />
          <MetricCard label="Coverage" value="100%" detail="Mock admin changes captured" status="Healthy" icon={<Sparkles size={18} />} />
        </div>
        <Card className="overflow-hidden">
          <div className="flex border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1.5">
            <button type="button" onClick={() => setActiveTab("events")} className={`rounded-md px-3 py-2 text-xs font-medium ${activeTab === "events" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-white"}`}>Events</button>
            <button type="button" onClick={() => setActiveTab("coverage")} className={`rounded-md px-3 py-2 text-xs font-medium ${activeTab === "coverage" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-white"}`}>Coverage</button>
          </div>
          {activeTab === "events" ? (
            <>
              <div id="audit-filters" className="border-b border-[var(--border-subtle)] px-4 py-3">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <Filter size={14} className="shrink-0 text-[var(--brand-primary)]" />
                  {filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium ${filter === item ? "bg-[var(--brand-primary)] text-white" : "border border-[var(--border-subtle)] bg-white text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"}`}>{item}</button>)}
                </div>
              </div>
              <div id="audit-table">
                <DataTable
                  columns={["Timestamp", "Actor", "Type", "Action", "Target", "Severity", "Status"]}
                  rows={rows.map((log) => [log.timestamp, log.actor, log.type, log.action, log.target, <StatusBadge key="sev" value={log.severity} />, <StatusBadge key="status" value={log.status} />])}
                />
              </div>
            </>
          ) : (
            <div className="grid gap-3 p-4 md:grid-cols-3">
              {["Deployments and stack commands", "Permission, workspace, and team changes", "Model, routing, and knowledge policy changes", "Agent tool and kill-switch actions", "Alert acknowledgement and threshold edits", "Compliance evidence pack exports"].map((item) => (
                <div key={item} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-3 text-sm">{item}</div>
              ))}
            </div>
          )}
        </Card>
      </Section>
    </>
  );
}
