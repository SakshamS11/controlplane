"use client";

import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, Boxes, Cpu, Gauge, PlayCircle, Server, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { AreaMetricChart, BarMetricChart, DonutChart } from "@/components/charts";
import { ActionButton, Card, ChartCard, MetricCard, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { alerts, costByModel, deploymentEvents, requestsByDepartment, requestVolume, targets } from "@/lib/mock-data";

const metrics = [
  ["Online agents", "3", "1 offline sandbox", <Activity key="i" size={18} />],
  ["Deployment targets", "4", "Across cloud, on-prem, local", <Server key="i" size={18} />],
  ["Monthly requests", "128,420", "+18% this month", <Gauge key="i" size={18} />],
  ["Estimated monthly cost", "AED 18,400", "Cloud and self-hosted", <WalletCards key="i" size={18} />],
  ["Avg latency", "812 ms", "Across all models", <Cpu key="i" size={18} />],
  ["Models connected", "8", "Local and external", <Sparkles key="i" size={18} />],
  ["Active AI stacks", "5", "2 private templates", <Boxes key="i" size={18} />],
  ["Open alerts", "2", "1 critical, 1 warning", <AlertTriangle key="i" size={18} />]
];

export default function DashboardOverviewPage() {
  const { showToast, addAudit } = useAppState();
  function simulateAction(action: string, target: string) {
    showToast(`${action} opened`);
    addAudit(action, target);
  }

  return (
    <>
      <PageHeader
        eyebrow="Command center"
        title="Dashboard overview"
        description="A unified operating view across deployment targets, AI stacks, model providers, governance events, and infrastructure health."
        action={<Link href="/dashboard/targets/acme" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"><PlayCircle size={16} /> View server details</Link>}
      />
      <Section>
        <div className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="overflow-hidden">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase text-cyan-200">Executive focus</p>
                  <h2 className="mt-2 text-2xl font-semibold">Fleet is operational, with one target needing attention.</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">The core AI stack is healthy on Acme Azure GPU Server. Claims On-Prem needs GPU memory review and Legal Sandbox should be reconnected.</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/10 p-4 text-center">
                  <div className="text-4xl font-semibold">92</div>
                  <div className="mt-1 text-xs text-slate-300">Ops score</div>
                </div>
              </div>
            </div>
            <div className="grid gap-0 divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="p-5">
                <div className="text-sm font-semibold">Primary server</div>
                <div className="mt-1 text-sm text-slate-600">Acme Azure GPU Server</div>
                <Link href="/dashboard/targets/acme" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700">View server details <ArrowRight size={14} /></Link>
              </div>
              <div className="p-5">
                <div className="text-sm font-semibold">Governance posture</div>
                <div className="mt-1 text-sm text-slate-600">24 model policies enforced</div>
                <Link href="/dashboard/departments" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700">Review access <ArrowRight size={14} /></Link>
              </div>
              <div className="p-5">
                <div className="text-sm font-semibold">Cost watch</div>
                <div className="mt-1 text-sm text-slate-600">GPT-5 nearing threshold</div>
                <Link href="/dashboard/monitoring" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700">Open monitoring <ArrowRight size={14} /></Link>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-cyan-700">Recommended actions</p>
                <h2 className="mt-2 text-lg font-semibold">Next best moves</h2>
              </div>
              <ShieldCheck className="text-cyan-700" size={22} />
            </div>
            <div className="mt-5 space-y-3">
              <button onClick={() => simulateAction("Review critical alert", "Legal Sandbox")} className="flex w-full items-center justify-between rounded-md border border-red-100 bg-red-50 px-4 py-3 text-left text-sm hover:bg-red-100">
                <span><span className="font-semibold text-red-800">Reconnect Legal Sandbox</span><span className="block text-red-700/70">Agent offline for 42 minutes</span></span>
                <ArrowRight size={16} className="text-red-700" />
              </button>
              <button onClick={() => simulateAction("Open GPU memory review", "Claims On-Prem Node")} className="flex w-full items-center justify-between rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-left text-sm hover:bg-amber-100">
                <span><span className="font-semibold text-amber-800">Check Claims GPU memory</span><span className="block text-amber-700/70">Above recommended threshold</span></span>
                <ArrowRight size={16} className="text-amber-700" />
              </button>
              <ActionButton variant="secondary" onClick={() => simulateAction("Generate executive report", "Dashboard")}>Generate report</ActionButton>
            </div>
          </Card>
        </div>
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
