"use client";

import { Filter, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { ActionButton, Card, DataTable, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { models } from "@/lib/mock-data";

const filters = ["All", "Local", "External", "Running", "Department"];

export default function ModelsPage() {
  const [filter, setFilter] = useState("All");
  const { showToast, addAudit } = useAppState();
  const visible = useMemo(() => models.filter((model) => filter === "All" || filter === "Department" || model.hosting === filter || model.status === filter), [filter]);

  return (
    <>
      <PageHeader eyebrow="Model catalog" title="Unified model catalog" description="A single inventory of local models, hosted provider models, access policies, latency, and request volume." />
      <Section>
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-md px-3 py-2 text-sm font-medium ${filter === item ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}><Filter className="mr-2 inline" size={14} />{item}</button>)}
        </div>
        <Card>
          <DataTable
            columns={["Model", "Hosting", "Provider", "Status", "Target", "Monthly requests", "Avg latency", "Access", "Action"]}
            rows={visible.map((model) => [
              <span key="name" className="font-semibold">{model.name}</span>,
              model.hosting,
              model.provider,
              <StatusBadge key="status" value={model.status} />,
              model.target,
              model.requests,
              model.latency,
              model.access,
              <ActionButton key="action" variant="secondary" onClick={() => { showToast(`${model.name} policy opened`); addAudit(`${model.name} model policy viewed`, model.name, "Model"); }}><Sparkles size={14} /> Manage</ActionButton>
            ])}
          />
        </Card>
      </Section>
    </>
  );
}
