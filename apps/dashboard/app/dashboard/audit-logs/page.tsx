"use client";

import { useState } from "react";
import { Card, DataTable, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

const filters = ["All", "Deployment", "Permission", "Model", "Agent", "Alert"];

export default function AuditLogsPage() {
  const { auditRows } = useAppState();
  const [filter, setFilter] = useState("All");
  const rows = auditRows.filter((row) => filter === "All" || row.type === filter);
  return (
    <>
      <PageHeader eyebrow="Audit trail" title="Enterprise audit logs" description="Mock audit trail for infrastructure actions, model changes, permission updates, alerts, and agent events." />
      <Section>
        <div className="mb-4 flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-md px-3 py-2 text-sm font-medium ${filter === item ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>{item}</button>)}</div>
        <Card>
          <DataTable
            columns={["Timestamp", "Actor", "Action", "Target", "Severity", "Status"]}
            rows={rows.map((log) => [log.timestamp, log.actor, log.action, log.target, <StatusBadge key="sev" value={log.severity} />, <StatusBadge key="status" value={log.status} />])}
          />
        </Card>
      </Section>
    </>
  );
}
