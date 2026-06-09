"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Activity, AlertTriangle, ArrowRight, Cpu, Filter, Gauge, RefreshCw, Server, WalletCards, X } from "lucide-react";
import { AreaMetricChart, BarMetricChart, DonutChart, MultiLineChart } from "@/components/charts";
import { ActionButton, Card, ChartCard, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { alerts, costByModel, providerHealth, requestsByDepartment, requestVolume, targets } from "@/lib/mock-data";

const timeRanges = ["24h", "7d", "30d"];
const metricViews = ["Overview", "Infrastructure", "Usage", "Cost"];
const severities = ["All", "Critical", "Warning", "Info"];

function MonitoringKpi({ label, value, detail, icon, tone = "cyan" }: { label: string; value: string; detail: string; icon: ReactNode; tone?: "cyan" | "emerald" | "amber" | "red" | "indigo" }) {
  const toneClass = {
    cyan: "bg-cyan-50 text-cyan-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    indigo: "bg-indigo-50 text-indigo-700"
  }[tone];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
          <div className="mt-1 text-xs text-slate-500">{detail}</div>
        </div>
        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${toneClass}`}>{icon}</div>
      </div>
    </Card>
  );
}

function FilterButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-9 rounded-md px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${active ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
    >
      {children}
    </button>
  );
}

export default function MonitoringPage() {
  const { showToast, addAudit, operationalThresholds } = useAppState();
  const [timeRange, setTimeRange] = useState("7d");
  const [targetFilter, setTargetFilter] = useState("All servers");
  const [providerFilter, setProviderFilter] = useState("All providers");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [metricView, setMetricView] = useState("Overview");

  const visibleTargets = useMemo(() => targets.filter((target) => targetFilter === "All servers" || target.name === targetFilter), [targetFilter]);
  const visibleProviders = useMemo(() => providerHealth.filter((provider) => provider.status !== "Self-hosted" && (providerFilter === "All providers" || provider.provider === providerFilter)), [providerFilter]);
  const visibleAlerts = useMemo(() => alerts.filter((alert) => severityFilter === "All" || alert.severity === severityFilter), [severityFilter]);
  const activeIssues = visibleAlerts.filter((alert) => alert.severity === "Critical" || alert.severity === "Warning").length + visibleProviders.filter((provider) => provider.status === "Degraded" || provider.status === "Down").length;

  function simulateAction(action: string, target: string) {
    showToast(`${action} opened`);
    addAudit(action, target, "Alert");
  }

  function resetFilters() {
    setTimeRange("7d");
    setTargetFilter("All servers");
    setProviderFilter("All providers");
    setSeverityFilter("All");
    setMetricView("Overview");
    showToast("Monitoring filters reset");
  }

  return (
    <>
      <PageHeader eyebrow="Observability" title="Monitoring dashboard" description="Infrastructure health, request volume, latency, cost, errors, department usage, and target service health in one place." />
      <Section>
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MonitoringKpi label="Fleet GPU" value="71%" detail={`Warns at ${operationalThresholds.gpuMemoryWarning}%`} icon={<Gauge size={18} />} tone="emerald" />
          <MonitoringKpi label="Requests" value="128k" detail={`${timeRange} selected`} icon={<Activity size={18} />} />
          <MonitoringKpi label="Avg latency" value="812 ms" detail={`Limit ${operationalThresholds.latencyWarning} ms`} icon={<Cpu size={18} />} tone="amber" />
          <MonitoringKpi label="Error rate" value="0.9%" detail="Across selected scope" icon={<AlertTriangle size={18} />} tone="red" />
          <MonitoringKpi label="Est. cost" value="AED 18.4k" detail={`Watch ${operationalThresholds.monthlyCostWarning.toLocaleString()} AED`} icon={<WalletCards size={18} />} tone="indigo" />
          <MonitoringKpi label="Open issues" value={String(activeIssues)} detail={`${visibleAlerts.length} alerts visible`} icon={<Server size={18} />} tone={activeIssues ? "amber" : "emerald"} />
        </div>

        <Card className="mb-6 p-5">
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><Filter size={14} /> Monitoring filters</div>
              <h2 className="mt-2 text-lg font-semibold">Filter all KPIs, charts, alerts, and health panels</h2>
              <p className="mt-1 text-sm text-slate-500">Use these controls to move from fleet-wide health to a specific server, provider, severity, or metric view.</p>
            </div>
            <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1.25fr]">
              <div>
                <div className="text-xs font-semibold uppercase text-slate-500">Time range</div>
                <div className="mt-2 flex flex-wrap gap-2">{timeRanges.map((range) => <FilterButton key={range} active={timeRange === range} onClick={() => setTimeRange(range)}>{range}</FilterButton>)}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-slate-500">Metric view</div>
                <div className="mt-2 flex flex-wrap gap-2">{metricViews.map((view) => <FilterButton key={view} active={metricView === view} onClick={() => setMetricView(view)}>{view}</FilterButton>)}</div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="text-xs font-medium text-slate-500">Server
                  <select value={targetFilter} onChange={(event) => setTargetFilter(event.target.value)} className="mt-1 block min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900">
                    <option>All servers</option>
                    {targets.map((target) => <option key={target.id}>{target.name}</option>)}
                  </select>
                </label>
                <label className="text-xs font-medium text-slate-500">Provider
                  <select value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)} className="mt-1 block min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900">
                    <option>All providers</option>
                    {providerHealth.filter((provider) => provider.status !== "Self-hosted").map((provider) => <option key={provider.provider}>{provider.provider}</option>)}
                  </select>
                </label>
                <label className="text-xs font-medium text-slate-500">Severity
                  <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} className="mt-1 block min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900">
                    {severities.map((severity) => <option key={severity}>{severity}</option>)}
                  </select>
                </label>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-slate-50 px-4 py-3">
              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{targetFilter}</span>, <span className="font-semibold text-slate-900">{providerFilter}</span>, <span className="font-semibold text-slate-900">{severityFilter}</span> alerts, <span className="font-semibold text-slate-900">{metricView}</span> charts.
              </div>
              <button onClick={resetFilters} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <X size={14} /> Reset filters
              </button>
            </div>
          </div>
        </Card>

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <Link href="/dashboard/targets" className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">Open affected servers <ArrowRight size={15} /></Link>
          <Link href="/dashboard/models" className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">Review model routing <ArrowRight size={15} /></Link>
          <Link href="/dashboard/settings" className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">Tune alert thresholds <ArrowRight size={15} /></Link>
        </div>
        <div className="mb-6 rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          GPU memory warnings use your configured threshold of {operationalThresholds.gpuMemoryWarning}%; critical alerts start at {operationalThresholds.gpuMemoryCritical}%.
          <button onClick={() => simulateAction("Refresh monitoring data", "Monitoring")} className="ml-3 inline-flex items-center gap-1 font-semibold text-amber-900">Refresh <RefreshCw size={13} /></button>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {(metricView === "Overview" || metricView === "Infrastructure") ? <ChartCard title="Fleet GPU utilization" detail={`${targetFilter}, ${timeRange}`}><AreaMetricChart data={requestVolume} dataKey="gpu" stroke="#059669" /></ChartCard> : null}
          {(metricView === "Overview" || metricView === "Usage") ? <ChartCard title="Request volume" detail={`${providerFilter}, ${timeRange}`}><AreaMetricChart data={requestVolume} dataKey="requests" /></ChartCard> : null}
          {(metricView === "Overview" || metricView === "Infrastructure") ? <ChartCard title="Average latency" detail={`${targetFilter}, ${timeRange}`}><AreaMetricChart data={requestVolume} dataKey="latency" stroke="#d97706" /></ChartCard> : null}
          {(metricView === "Overview" || metricView === "Infrastructure") ? <ChartCard title="Error rate" detail={`${severityFilter} alerts, ${timeRange}`}><AreaMetricChart data={requestVolume} dataKey="errors" stroke="#dc2626" /></ChartCard> : null}
          {(metricView === "Overview" || metricView === "Cost") ? <ChartCard title="Cost trend" detail={`${providerFilter}, ${timeRange}`}><MultiLineChart data={requestVolume} keys={[{ key: "cost", name: "Cost AED", color: "#4f46e5" }]} /></ChartCard> : null}
          {(metricView === "Overview" || metricView === "Usage") ? <ChartCard title="Requests by department" detail="Usage share for selected scope"><BarMetricChart data={requestsByDepartment} dataKey="value" /></ChartCard> : null}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
          <ChartCard title="Cost by model"><DonutChart data={costByModel} /></ChartCard>
          <div className="grid gap-6">
            <Card className="p-5">
              <h2 className="font-semibold">Service health by server</h2>
              <div className="mt-4 space-y-3">{visibleTargets.map((target) => <div key={target.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm"><span>{target.name}</span><StatusBadge value={target.health} /></div>)}</div>
            </Card>
            <Card className="p-5">
              <h2 className="font-semibold">External model providers</h2>
              <p className="mt-1 text-sm text-slate-500">Down detector for models running outside your servers.</p>
              <div className="mt-4 space-y-3">
                {visibleProviders.map((provider) => (
                  <div key={provider.provider} className="rounded-md border border-slate-200 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{provider.provider}</span>
                      <StatusBadge value={provider.status} />
                    </div>
                    <div className="mt-2 text-xs text-slate-500">{provider.affectedModels.join(", ")} checked {provider.lastChecked}</div>
                    <div className="mt-2 text-sm text-slate-700">{provider.action}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-4">
          {visibleAlerts.map((alert) => <Card key={alert.title} className="p-4"><AlertTriangle className="text-amber-600" size={18} /><div className="mt-3 text-sm font-semibold">{alert.title}</div><div className="mt-3 flex items-center justify-between gap-3"><StatusBadge value={alert.severity} /><ActionButton variant="secondary" onClick={() => simulateAction(`Open ${alert.area} alert`, alert.title)}>Open</ActionButton></div></Card>)}
        </div>
      </Section>
    </>
  );
}
