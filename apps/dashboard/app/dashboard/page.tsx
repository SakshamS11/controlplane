"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, AlertTriangle, ArrowRight, Bot, Boxes, Building2, Cpu, Database, Gauge, Layers, MonitorDot, PlayCircle, Route, Server, ShieldCheck, SlidersHorizontal, Sparkles, WalletCards } from "lucide-react";
import { AreaMetricChart, BarMetricChart, DonutChart } from "@/components/charts";
import { ActionButton, Card, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
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

const actionQueue = [
  {
    title: "Reconnect Legal Sandbox",
    severity: "Critical",
    detail: "Agent has missed heartbeats for 42 minutes. Reconnect the agent before deploying or collecting logs.",
    href: "/dashboard/targets",
    cta: "Open servers"
  },
  {
    title: "Review Claims GPU memory",
    severity: "Warning",
    detail: "GPU memory is above your configured warning threshold. Review the target or tune alert policy.",
    href: "/dashboard/settings",
    cta: "Adjust threshold"
  },
  {
    title: "Route around OpenAI degradation",
    severity: "Warning",
    detail: "GPT-5 provider latency is elevated. Review provider health and fallback model access.",
    href: "/dashboard/routing-policies",
    cta: "Apply route"
  }
];

const systemTiles = [
  { label: "Primary server", value: "Acme Azure GPU Server", href: "/dashboard/targets/acme", cta: "View server" },
  { label: "Governance posture", value: "24 policies enforced", href: "/dashboard/departments", cta: "Review access" },
  { label: "Provider health", value: "OpenAI degraded", href: "/dashboard/routing-policies", cta: "Apply route" },
  { label: "Cost watch", value: "GPT-5 near threshold", href: "/dashboard/monitoring", cta: "Open monitoring" }
];

const commandModules = [
  { label: "Servers", value: "3 online / 1 warning", href: "/dashboard/targets", icon: Server, tone: "text-emerald-700 bg-emerald-50" },
  { label: "Models", value: "OpenAI degraded", href: "/dashboard/models", icon: Sparkles, tone: "text-amber-700 bg-amber-50" },
  { label: "Routing", value: "GPT-5 fallback ready", href: "/dashboard/routing-policies", icon: Route, tone: "text-cyan-700 bg-cyan-50" },
  { label: "Monitoring", value: "2 open issues", href: "/dashboard/monitoring", icon: MonitorDot, tone: "text-amber-700 bg-amber-50" },
  { label: "Teams", value: "24 policies enforced", href: "/dashboard/departments", icon: Building2, tone: "text-emerald-700 bg-emerald-50" },
  { label: "Workspaces", value: "4 active assistants", href: "/dashboard/workspaces", icon: Layers, tone: "text-cyan-700 bg-cyan-50" },
  { label: "Knowledge", value: "5,220 docs indexed", href: "/dashboard/knowledge-bases", icon: Database, tone: "text-indigo-700 bg-indigo-50" },
  { label: "Agents", value: "5 governed agents", href: "/dashboard/agents", icon: Bot, tone: "text-slate-700 bg-slate-100" },
  { label: "Planner", value: "AED 9.4k savings", href: "/dashboard/resource-planner", icon: SlidersHorizontal, tone: "text-cyan-700 bg-cyan-50" }
];

const plannerMetrics = [
  ["Departments optimized", "6", "All active teams analyzed", <ShieldCheck key="i" size={18} />],
  ["Potential monthly savings", "AED 9,400", "Routing and capacity changes", <WalletCards key="i" size={18} />],
  ["Under-allocated teams", "1", "Claims needs more local capacity", <AlertTriangle key="i" size={18} />],
  ["Over-allocated teams", "2", "Finance and Marketing", <Gauge key="i" size={18} />],
  ["Governance risks", "1", "Legal confidential workflow", <ShieldCheck key="i" size={18} />]
];

function CompactKpi({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-500">{label}</div>
          <div className="mt-2 text-xl font-semibold text-slate-950">{value}</div>
          <div className="mt-1 truncate text-xs text-slate-500">{detail}</div>
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-cyan-50 text-cyan-700">{icon}</div>
      </div>
    </Card>
  );
}

function CompactChart({ title, detail, children }: { title: string; detail: string; children: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <Gauge size={16} className="shrink-0 text-slate-400" />
      </div>
      <div className="h-44">{children}</div>
    </Card>
  );
}

function ModuleTile({ item }: { item: (typeof commandModules)[number] }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="group flex min-h-24 items-start justify-between gap-3 rounded-md border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg hover:shadow-slate-200/60">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-950">{item.label}</div>
        <div className="mt-2 text-xs leading-5 text-slate-500">{item.value}</div>
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700">Open <ArrowRight size={13} className="transition group-hover:translate-x-0.5" /></div>
      </div>
      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${item.tone}`}><Icon size={17} /></div>
    </Link>
  );
}

export default function DashboardOverviewPage() {
  const { showToast, addAudit, operationalThresholds } = useAppState();
  function simulateAction(action: string, target: string) {
    showToast(`${action} opened`);
    addAudit(action, target);
  }

  return (
    <>
      <PageHeader
        eyebrow="Command center"
        title="AI operations command center"
        description="Fleet health, model status, governance posture, cost, capacity, and the next operational actions in one place."
        action={<Link href="/dashboard/targets/acme" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"><PlayCircle size={16} /> View server details</Link>}
      />
      <Section>
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.slice(0, 4).map(([label, value, detail, icon]) => <CompactKpi key={label as string} label={label as string} value={value as string} detail={detail as string} icon={icon} />)}
        </div>
        <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-cyan-700">Control room</p>
                <h2 className="mt-2 text-lg font-semibold">Operate the AI estate</h2>
              </div>
              <StatusBadge value="Operational" />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {commandModules.map((item) => <ModuleTile key={item.label} item={item} />)}
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="bg-slate-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase text-cyan-200">Priority status</p>
              <div className="mt-4 flex items-end gap-3">
                <div className="text-5xl font-semibold">92</div>
                <div className="pb-2 text-xs text-slate-300">Ops score</div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">Stable overall. GPU warnings currently trigger at {operationalThresholds.gpuMemoryWarning}% memory.</p>
            </div>
            <div className="grid divide-y divide-slate-200">
              {systemTiles.map((tile) => (
                <Link key={tile.label} href={tile.href} className="flex items-center justify-between gap-3 p-4 transition hover:bg-slate-50">
                  <div>
                    <div className="text-xs font-medium uppercase text-slate-400">{tile.label}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">{tile.value}</div>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-700">{tile.cta} <ArrowRight size={13} /></div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
        <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="grid gap-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <CompactChart title="Request volume" detail="7 day trend"><AreaMetricChart data={requestVolume} dataKey="requests" /></CompactChart>
              <CompactChart title="Cost by model" detail="Estimated spend"><DonutChart data={costByModel} /></CompactChart>
              <CompactChart title="Department usage" detail="Share of requests"><BarMetricChart data={requestsByDepartment} dataKey="value" /></CompactChart>
            </div>
          </div>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-cyan-700">Action queue</p>
                <h2 className="mt-2 text-lg font-semibold">Do these first</h2>
              </div>
              <ShieldCheck className="text-cyan-700" size={22} />
            </div>
            <div className="mt-5 space-y-3">
              {actionQueue.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`block rounded-md border px-4 py-3 text-sm transition ${item.severity === "Critical" ? "border-red-100 bg-red-50 hover:bg-red-100" : "border-amber-100 bg-amber-50 hover:bg-amber-100"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className={item.severity === "Critical" ? "font-semibold text-red-800" : "font-semibold text-amber-800"}>{item.title}</div>
                      <div className={item.severity === "Critical" ? "mt-1 text-red-700/75" : "mt-1 text-amber-700/75"}>{item.detail}</div>
                    </div>
                    <StatusBadge value={item.severity} />
                  </div>
                  <div className={item.severity === "Critical" ? "mt-3 inline-flex items-center gap-2 font-semibold text-red-800" : "mt-3 inline-flex items-center gap-2 font-semibold text-amber-800"}>
                    {item.cta} <ArrowRight size={14} />
                  </div>
                </Link>
              ))}
              <ActionButton variant="secondary" onClick={() => simulateAction("Generate operations report", "Dashboard")}>Generate ops report</ActionButton>
            </div>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.slice(4).map(([label, value, detail, icon]) => <CompactKpi key={label as string} label={label as string} value={value as string} detail={detail as string} icon={icon} />)}
        </div>
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">Resource planner impact</h2>
              <p className="mt-1 text-sm text-slate-500">Capacity and governance optimization opportunities across departments.</p>
            </div>
            <Link href="/dashboard/resource-planner" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">Open planner <ArrowRight size={14} /></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {plannerMetrics.map(([label, value, detail, icon]) => <CompactKpi key={label as string} label={label as string} value={value as string} detail={detail as string} icon={icon} />)}
          </div>
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
