"use client";

import { AlertTriangle } from "lucide-react";
import { AreaMetricChart, BarMetricChart, DonutChart, MultiLineChart } from "@/components/charts";
import { Card, ChartCard, PageHeader, Section, StatusBadge } from "@/components/ui";
import { alerts, costByModel, providerHealth, requestsByDepartment, requestVolume, targets } from "@/lib/mock-data";

export default function MonitoringPage() {
  return (
    <>
      <PageHeader eyebrow="Observability" title="Monitoring dashboard" description="Infrastructure health, request volume, latency, cost, errors, department usage, and target service health in one place." />
      <Section>
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Fleet GPU utilization"><AreaMetricChart data={requestVolume} dataKey="gpu" stroke="#059669" /></ChartCard>
          <ChartCard title="Request volume"><AreaMetricChart data={requestVolume} dataKey="requests" /></ChartCard>
          <ChartCard title="Average latency"><AreaMetricChart data={requestVolume} dataKey="latency" stroke="#d97706" /></ChartCard>
          <ChartCard title="Error rate"><AreaMetricChart data={requestVolume} dataKey="errors" stroke="#dc2626" /></ChartCard>
          <ChartCard title="Cost trend"><MultiLineChart data={requestVolume} keys={[{ key: "cost", name: "Cost AED", color: "#4f46e5" }]} /></ChartCard>
          <ChartCard title="Requests by department"><BarMetricChart data={requestsByDepartment} dataKey="value" /></ChartCard>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
          <ChartCard title="Cost by model"><DonutChart data={costByModel} /></ChartCard>
          <div className="grid gap-6">
            <Card className="p-5">
              <h2 className="font-semibold">Service health by server</h2>
              <div className="mt-4 space-y-3">{targets.map((target) => <div key={target.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm"><span>{target.name}</span><StatusBadge value={target.health} /></div>)}</div>
            </Card>
            <Card className="p-5">
              <h2 className="font-semibold">External model providers</h2>
              <p className="mt-1 text-sm text-slate-500">Down detector for models running outside your servers.</p>
              <div className="mt-4 space-y-3">
                {providerHealth.filter((provider) => provider.status !== "Self-hosted").map((provider) => (
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
          {alerts.map((alert) => <Card key={alert.title} className="p-4"><AlertTriangle className="text-amber-600" size={18} /><div className="mt-3 text-sm font-semibold">{alert.title}</div><div className="mt-3"><StatusBadge value={alert.severity} /></div></Card>)}
        </div>
      </Section>
    </>
  );
}
