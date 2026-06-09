"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Clock, Filter, RefreshCw, Server, Sparkles } from "lucide-react";
import { AreaMetricChart, BarMetricChart, DonutChart, MultiLineChart } from "@/components/charts";
import { ActionButton, Card, ChartCard, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { alerts, costByModel, providerHealth, requestsByDepartment, requestVolume, targets } from "@/lib/mock-data";

const timeRanges = ["24h", "7d", "30d"];
const metricViews = ["Overview", "Infrastructure", "Usage", "Cost"];
const severities = ["All", "Critical", "Warning", "Info"];

export default function MonitoringPage() {
  const { showToast, addAudit } = useAppState();
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

  return (
    <>
      <PageHeader eyebrow="Observability" title="Monitoring dashboard" description="Infrastructure health, request volume, latency, cost, errors, department usage, and target service health in one place." />
      <Section>
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><Filter size={14} /> Filters</div>
              <p className="mt-2 text-sm text-slate-500">Narrow monitoring by time, server, provider, severity, and metric focus.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="text-xs font-medium text-slate-500">Time range
                <select value={timeRange} onChange={(event) => setTimeRange(event.target.value)} className="mt-1 block min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900">
                  {timeRanges.map((range) => <option key={range}>{range}</option>)}
                </select>
              </label>
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
              <label className="text-xs font-medium text-slate-500">View
                <select value={metricView} onChange={(event) => setMetricView(event.target.value)} className="mt-1 block min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900">
                  {metricViews.map((view) => <option key={view}>{view}</option>)}
                </select>
              </label>
            </div>
          </div>
        </Card>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="p-4"><div className="flex items-center gap-3"><Clock className="text-cyan-700" size={18} /><div><div className="text-xs text-slate-500">Window</div><div className="mt-1 font-semibold">{timeRange}</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><Server className="text-emerald-700" size={18} /><div><div className="text-xs text-slate-500">Servers shown</div><div className="mt-1 font-semibold">{visibleTargets.length}</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><Sparkles className="text-indigo-700" size={18} /><div><div className="text-xs text-slate-500">Providers shown</div><div className="mt-1 font-semibold">{visibleProviders.length}</div></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-3"><AlertTriangle className="text-amber-700" size={18} /><div><div className="text-xs text-slate-500">Issues in scope</div><div className="mt-1 font-semibold">{activeIssues}</div></div></div></Card>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <Link href="/dashboard/targets" className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">Open affected servers <ArrowRight size={15} /></Link>
          <Link href="/dashboard/models" className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">Review model routing <ArrowRight size={15} /></Link>
          <button onClick={() => simulateAction("Refresh monitoring data", "Monitoring")} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">Refresh data <RefreshCw size={15} /></button>
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
