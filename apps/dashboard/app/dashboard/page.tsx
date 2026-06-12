"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Cloud,
  Gauge,
  Lightbulb,
  MessageSquareText,
  RefreshCw,
  Route,
  ShieldCheck,
  Timer,
  Users,
  WalletCards
} from "lucide-react";
import type { ReactNode } from "react";
import { DonutChart, TrafficCostChart } from "@/components/charts";
import { ActionButton, Card, Section, StatusBadge, useAppState } from "@/components/ui";

const kpis = [
  { label: "System health", value: "96%", trend: "Warning", detail: "3 issues open", icon: Activity, points: [92, 94, 95, 94, 96, 96] },
  { label: "Active users", value: "248", trend: "+12%", detail: "vs last month", icon: Users, points: [172, 184, 198, 209, 224, 248] },
  { label: "AI requests", value: "1.42M", trend: "+18%", detail: "monthly volume", icon: MessageSquareText, points: [72, 78, 83, 87, 94, 100] },
  { label: "Avg latency", value: "842 ms", trend: "-6%", detail: "improving", icon: Timer, points: [100, 96, 94, 91, 88, 84] },
  { label: "Monthly cost", value: "AED 137,600", trend: "+9%", detail: "forecast on plan", icon: WalletCards, points: [62, 68, 73, 78, 86, 91] }
];

const trafficCostTrend = [
  { name: "Jan", requests: 148000, cost: 14200 },
  { name: "Feb", requests: 172000, cost: 15800 },
  { name: "Mar", requests: 189000, cost: 17400 },
  { name: "Apr", requests: 216000, cost: 20100 },
  { name: "May", requests: 238000, cost: 22600 },
  { name: "Jun", requests: 251000, cost: 23500 },
  { name: "Jul", requests: 206000, cost: 24000 }
];

const modelCosts = [
  { name: "GPT-5", value: 55040, share: "40%" },
  { name: "Claude", value: 33024, share: "24%" },
  { name: "Qwen 32B Local", value: 22016, share: "16%" },
  { name: "Gemini", value: 13760, share: "10%" },
  { name: "Others", value: 13760, share: "10%" }
];

const chartColors = ["#5B3DFF", "#16C7E8", "#10B981", "#F59E0B", "#64748B"];

const workloads = [
  { name: "Engineering", value: 31 },
  { name: "Customer Support", value: 24 },
  { name: "Legal", value: 18 },
  { name: "Marketing", value: 16 },
  { name: "Finance", value: 11 }
];

const nextActions = [
  "Review routing fallback rules",
  "Reclaim GPU from Finance",
  "Enable semantic cache"
];

export default function DashboardOverviewPage() {
  const { showToast, addAudit } = useAppState();

  function refreshOverview() {
    showToast("Overview telemetry refreshed");
    addAudit("Overview telemetry refreshed", "Command Center", "Alert");
  }

  return (
    <Section>
      <header className="mb-3 flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] pb-3 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Command Center</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">AI operations command center</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Health, spend, capacity, governance, and next actions across the AI estate.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="overview-time-range">Overview time range</label>
          <select id="overview-time-range" defaultValue="Last 30 days" className="min-h-9 rounded-md border border-[var(--border-subtle)] bg-white px-3 text-xs font-medium text-[var(--text-primary)]">
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This quarter</option>
          </select>
          <ActionButton variant="secondary" onClick={refreshOverview}><RefreshCw size={14} /> Refresh</ActionButton>
        </div>
      </header>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((item) => (
          <KpiCard key={item.label} {...item} />
        ))}
      </div>

      <Card className="mt-3 overflow-hidden border-l-4 border-l-[var(--status-warning)]">
        <div className="flex flex-col justify-between gap-3 px-4 py-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[rgba(245,158,11,0.12)] text-[var(--status-warning)]">
              <AlertTriangle size={17} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">OpenAI degraded</h2>
                <StatusBadge value="Degraded" />
                <span className="text-xs text-[var(--text-secondary)]">48 seconds ago</span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Elevated GPT-5 latency. Traffic is routing to approved fallback models.</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/dashboard/routing-policies" className="inline-flex min-h-9 items-center rounded-md bg-[var(--brand-primary)] px-3 text-xs font-semibold text-white hover:bg-[var(--brand-primary-dark)]">View routing</Link>
            <Link href="/dashboard/models" className="inline-flex min-h-9 items-center rounded-md border border-[var(--border-subtle)] bg-white px-3 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-muted)]">View providers</Link>
          </div>
        </div>
      </Card>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.75fr)]">
        <Card className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Traffic &amp; Cost Trend</h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Requests and AI spend across the selected period.</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)]">
              <LegendDot color="#5B3DFF" label="Requests" />
              <LegendDot color="#16C7E8" label="Cost" />
            </div>
          </div>
          <div className="mt-2 h-44 sm:h-48">
            <TrafficCostChart data={trafficCostTrend} />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--border-subtle)]">
            <AnalyticsStat label="Total requests" value="1.42M" />
            <AnalyticsStat label="Total cost" value="AED 137,600" />
            <AnalyticsStat label="Avg cost / 1K tokens" value="AED 4.18" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Top Models by Cost</h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">GPT-5 remains the largest cost driver.</p>
            </div>
            <WalletCards size={17} className="text-[var(--brand-primary)]" />
          </div>
          <div className="mt-2 grid grid-cols-[130px_minmax(0,1fr)] items-center gap-3">
            <div className="h-40">
              <DonutChart data={modelCosts} innerRadius={42} outerRadius={68} />
            </div>
            <div className="space-y-2">
              {modelCosts.map((item, index) => (
                <div key={item.name} className="grid grid-cols-[minmax(0,1fr)_34px_auto] items-center gap-2 text-xs">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: chartColors[index] }} />
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="text-right text-[var(--text-secondary)]">{item.share}</span>
                  <span className="text-right font-semibold">AED {(item.value / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        <ControlCard
          icon={<Gauge size={17} />}
          title="Capacity Overview"
          actionLabel="View capacity planner"
          href="/dashboard/cost-capacity"
        >
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="GPU utilized" value="71%" />
            <MiniStat label="GPU reserved" value="100%" />
            <MiniStat label="Reclaimable" value="20%" />
          </div>
          <p className="mt-2 text-[11px] text-[var(--text-secondary)]">Reclaimable capacity is unused reserved GPU.</p>
        </ControlCard>

        <ControlCard
          icon={<Cloud size={17} />}
          title="Workload Distribution"
          actionLabel="View all workspaces"
          href="/dashboard/workspaces"
        >
          <div className="space-y-1.5">
            {workloads.map((item) => (
              <div key={item.name} className="grid grid-cols-[105px_1fr_28px] items-center gap-2 text-[11px]">
                <span className="truncate text-[var(--text-secondary)]">{item.name}</span>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div className="h-full rounded-full bg-[var(--brand-primary)]" style={{ width: `${item.value}%` }} />
                </div>
                <span className="text-right font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </ControlCard>

        <ControlCard
          icon={<ShieldCheck size={17} />}
          title="Governance & Risk"
          actionLabel="View compliance"
          href="/dashboard/compliance"
        >
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="Policy violations" value="1" tone="critical" />
            <MiniStat label="Audit coverage" value="100%" tone="healthy" />
            <MiniStat label="Data residency" value="UAE / Local" />
            <MiniStat label="Evidence readiness" value="72%" tone="warning" />
          </div>
          <p className="mt-2 text-[11px] text-[var(--text-secondary)]">ISO/IEC 42001 readiness support; not certification.</p>
        </ControlCard>

        <ControlCard
          icon={<Lightbulb size={17} />}
          title="What's Next"
          actionLabel="View recommendations"
          href="/dashboard/resource-planner"
        >
          <ol className="space-y-2">
            {nextActions.map((action, index) => (
              <li key={action} className="flex items-center gap-2 text-xs">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--surface-muted)] text-[10px] font-semibold text-[var(--brand-primary)]">{index + 1}</span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </ControlCard>
      </div>

      <Card className="mt-3 border-[rgba(91,61,255,0.24)] px-4 py-3">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[rgba(91,61,255,0.10)] text-[var(--brand-primary)]">
              <Route size={15} />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Tip for today</div>
              <p className="mt-0.5 text-sm font-medium">Move 18% of drafting traffic to Gemini or local models to save AED 18K/month.</p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Your AI spend becomes an owned AI asset over time.</p>
            </div>
          </div>
          <Link href="/dashboard/resource-planner" className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md bg-[var(--brand-primary)] px-3 text-xs font-semibold text-white hover:bg-[var(--brand-primary-dark)]">
            Run resource planner <ArrowRight size={13} />
          </Link>
        </div>
      </Card>
    </Section>
  );
}

function KpiCard({ label, value, trend, detail, icon: Icon, points }: {
  label: string;
  value: string;
  trend: string;
  detail: string;
  icon: typeof Activity;
  points: number[];
}) {
  const isWarning = trend === "Warning";
  return (
    <Card className="p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--surface-muted)] text-[var(--brand-primary)]"><Icon size={14} /></span>
          <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
        </div>
        <Sparkline points={points} warning={isWarning} />
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="text-xl font-semibold text-[var(--text-primary)]">{value}</span>
        <span className={`text-xs font-semibold ${isWarning ? "text-[var(--status-warning)]" : "text-[var(--status-healthy)]"}`}>{trend}</span>
      </div>
      <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">{detail}</div>
    </Card>
  );
}

function Sparkline({ points, warning }: { points: number[]; warning?: boolean }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const coordinates = points.map((point, index) => {
    const x = (index / (points.length - 1)) * 54;
    const y = 18 - ((point - min) / range) * 14;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="56" height="20" viewBox="0 0 56 20" aria-hidden="true">
      <polyline points={coordinates} fill="none" stroke={warning ? "#F59E0B" : "#5B3DFF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{label}</span>;
}

function AnalyticsStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-3 py-2">
      <div className="text-[10px] text-[var(--text-secondary)]">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: "healthy" | "warning" | "critical" }) {
  const color = tone === "healthy"
    ? "text-[var(--status-healthy)]"
    : tone === "warning"
      ? "text-[var(--status-warning)]"
      : tone === "critical"
        ? "text-[var(--status-critical)]"
        : "text-[var(--text-primary)]";
  return (
    <div className="rounded-md border border-[var(--border-subtle)] px-2.5 py-2">
      <div className={`text-sm font-semibold ${color}`}>{value}</div>
      <div className="mt-0.5 text-[10px] text-[var(--text-secondary)]">{label}</div>
    </div>
  );
}

function ControlCard({ icon, title, children, actionLabel, href }: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  actionLabel: string;
  href: string;
}) {
  return (
    <Card className="flex min-h-[210px] flex-col p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[var(--brand-primary)]">{icon}</span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="flex-1">{children}</div>
      <Link href={href} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] hover:underline">
        {actionLabel} <ArrowRight size={12} />
      </Link>
    </Card>
  );
}
