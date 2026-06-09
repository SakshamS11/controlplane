"use client";

import { Activity, AlertTriangle, Boxes, Cpu, Gauge, Server, Sparkles, WalletCards } from "lucide-react";
import { AreaMetricChart, BarMetricChart, DonutChart } from "@/components/charts";
import { Card, ChartCard, MetricCard, PageHeader, Section, StatusBadge } from "@/components/ui";
import { alerts, costByModel, deploymentEvents, requestsByDepartment, requestVolume, targets } from "@/lib/mock-data";

const metrics = [
  ["Deployment targets", "4", "Across cloud, on-prem, local", <Server key="i" size={18} />],
  ["Online agents", "3", "1 offline sandbox", <Activity key="i" size={18} />],
  ["Models connected", "8", "Local and external", <Sparkles key="i" size={18} />],
  ["Active AI stacks", "5", "2 private templates", <Boxes key="i" size={18} />],
  ["Monthly requests", "128,420", "+18% this month", <Gauge key="i" size={18} />],
  ["Avg latency", "812 ms", "Across all models", <Cpu key="i" size={18} />],
  ["Estimated monthly cost", "AED 18,400", "Cloud and self-hosted", <WalletCards key="i" size={18} />],
  ["Open alerts", "2", "1 critical, 1 warning", <AlertTriangle key="i" size={18} />]
];

export default function DashboardOverviewPage() {
  return (
    <>
      <PageHeader eyebrow="Command center" title="Dashboard overview" description="A unified operating view across deployment targets, AI stacks, model providers, governance events, and infrastructure health." />
      <Section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value, detail, icon]) => <MetricCard key={label as string} label={label as string} value={value as string} detail={detail as string} icon={icon} />)}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <ChartCard title="Request volume over time" detail="Mock traffic across all models"><AreaMetricChart data={requestVolume} dataKey="requests" /></ChartCard>
          <ChartCard title="Cost by model" detail="Estimated AED spend"><DonutChart data={costByModel} /></ChartCard>
          <ChartCard title="GPU utilization over time" detail="Fleet average"><AreaMetricChart data={requestVolume} dataKey="gpu" stroke="#4f46e5" /></ChartCard>
          <ChartCard title="Requests by department" detail="Share of usage"><BarMetricChart data={requestsByDepartment} dataKey="value" /></ChartCard>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <Card className="p-5">
            <h2 className="font-semibold">Recent deployment events</h2>
            <div className="mt-4 space-y-3">{deploymentEvents.map((event) => <div key={event} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">{event}</div>)}</div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold">Active alerts</h2>
            <div className="mt-4 space-y-3">{alerts.slice(0, 3).map((alert) => <div key={alert.title} className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-3 text-sm"><span>{alert.title}</span><StatusBadge value={alert.severity} /></div>)}</div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold">Fleet health summary</h2>
            <div className="mt-4 space-y-3">{targets.map((target) => <div key={target.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm"><span>{target.name}</span><StatusBadge value={target.health} /></div>)}</div>
          </Card>
        </div>
      </Section>
    </>
  );
}
