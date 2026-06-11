"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Cpu,
  Gauge,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldAlert,
  WalletCards,
  WifiOff
} from "lucide-react";
import { AreaMetricChart } from "@/components/charts";
import { ActionButton, Card, Section, StatusBadge, useAppState } from "@/components/ui";
import { alerts, providerHealth, requestVolume, targets } from "@/lib/mock-data";

const timeRanges = ["24h", "7d", "30d"] as const;
const metricViews = ["Overview", "Infrastructure", "Usage", "Cost"] as const;
const severities = ["All", "Critical", "Warning", "Info"] as const;

const alertActions: Record<string, string> = {
  Provider: "Review model routing",
  Infrastructure: "Review server capacity",
  Agent: "Reconnect agent",
  Cost: "Open budget controls",
  Service: "Inspect service event"
};

const alertSystems: Record<string, string> = {
  "OpenAI provider degradation affecting GPT-5": "OpenAI / GPT-5",
  "Claims On-Prem Node GPU memory above configured threshold": "Claims On-Prem Node",
  "Legal Sandbox agent offline": "Legal Sandbox",
  "GPT-5 monthly cost above threshold": "GPT-5",
  "LiteLLM restart event detected": "LiteLLM"
};

const driftSignals = [
  { title: "OpenAI GPT-5", detail: "Latency degraded", status: "Warning", action: "Route around now" },
  { title: "Claude fallback", detail: "Ready for critical work", status: "Healthy", action: "Fallback ready" },
  { title: "Qwen 32B local", detail: "Safe for sensitive traffic", status: "Healthy", action: "Local route safe" },
  { title: "Gemini", detail: "Healthy for Marketing", status: "Healthy", action: "No action" }
];

function OperationsKpi({ label, value, detail, icon, status }: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  status: "healthy" | "warning" | "critical" | "brand";
}) {
  const tone = {
    healthy: "bg-[rgba(16,185,129,0.10)] text-[var(--status-healthy)]",
    warning: "bg-[rgba(245,158,11,0.12)] text-[var(--status-warning)]",
    critical: "bg-[rgba(225,29,72,0.10)] text-[var(--status-critical)]",
    brand: "bg-[rgba(91,61,255,0.10)] text-[var(--brand-primary)]"
  }[status];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--text-secondary)]">{label}</p>
          <p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{value}</p>
          <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{detail}</p>
        </div>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${tone}`}>{icon}</span>
      </div>
    </Card>
  );
}

function SegmentButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${
        active
          ? "bg-[var(--brand-primary)] text-white shadow-sm"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

function MonitoringChart({ title, scope, value, note, children }: {
  title: string;
  scope: string;
  value: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{scope}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-[var(--text-primary)]">{value}</p>
          <p className="text-xs text-[var(--status-warning)]">{note}</p>
        </div>
      </div>
      <div className="h-48 px-2 py-3">{children}</div>
    </Card>
  );
}

export default function MonitoringPage() {
  const { showToast, addAudit, operationalThresholds } = useAppState();
  const [timeRange, setTimeRange] = useState<(typeof timeRanges)[number]>("7d");
  const [targetFilter, setTargetFilter] = useState("All servers");
  const [providerFilter, setProviderFilter] = useState("All providers");
  const [severityFilter, setSeverityFilter] = useState<(typeof severities)[number]>("All");
  const [metricView, setMetricView] = useState<(typeof metricViews)[number]>("Overview");

  const visibleTargets = useMemo(
    () => targets.filter((target) => targetFilter === "All servers" || target.name === targetFilter),
    [targetFilter]
  );
  const visibleProviders = useMemo(
    () => providerHealth.filter((provider) =>
      provider.status !== "Self-hosted" &&
      (providerFilter === "All providers" || provider.provider === providerFilter)
    ),
    [providerFilter]
  );
  const visibleAlerts = useMemo(
    () => alerts.filter((alert) => severityFilter === "All" || alert.severity === severityFilter),
    [severityFilter]
  );

  function simulateAction(action: string, target: string) {
    showToast(`${action} opened`);
    addAudit(action, target, "Alert");
  }

  function acknowledgeScope() {
    showToast("Selected monitoring scope acknowledged");
    addAudit("Acknowledged monitoring scope", `${targetFilter} / ${providerFilter}`, "Alert");
  }

  function resetFilters() {
    setTimeRange("7d");
    setTargetFilter("All servers");
    setProviderFilter("All providers");
    setSeverityFilter("All");
    setMetricView("Overview");
    showToast("Monitoring filters reset");
  }

  const chartScope = `${targetFilter} · ${providerFilter} · ${timeRange}`;

  return (
    <Section>
      <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Operate</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Monitoring</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Live infrastructure, provider, latency, cost, and service health.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/targets"
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-muted)]"
          >
            Open affected servers <ArrowRight size={15} />
          </Link>
          <ActionButton variant="secondary" onClick={acknowledgeScope}>Acknowledge scope</ActionButton>
        </div>
      </div>

      <Card className="mb-3 overflow-hidden border-l-4 border-l-[var(--status-warning)]">
        <div className="flex flex-col justify-between gap-3 px-4 py-3 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[rgba(245,158,11,0.12)] text-[var(--status-warning)]">
              <ShieldAlert size={18} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-[var(--text-primary)]">Monitoring Status: Warning</h2>
                <StatusBadge value="Warning" />
              </div>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Provider degradation, GPU pressure, and one disconnected agent require review.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <span><strong className="text-[var(--text-primary)]">5</strong> open issues</span>
            <span><strong className="text-[var(--status-critical)]">1</strong> critical</span>
            <span><strong className="text-[var(--status-warning)]">2</strong> provider/infrastructure</span>
            <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]"><Clock3 size={13} /> Updated 48 seconds ago</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <OperationsKpi label="Fleet GPU" value="71%" detail={`Warns at ${operationalThresholds.gpuMemoryWarning}%`} icon={<Gauge size={17} />} status="healthy" />
        <OperationsKpi label="Requests" value="128k" detail={`${timeRange} selected`} icon={<Activity size={17} />} status="brand" />
        <OperationsKpi label="Avg latency" value="812ms" detail={`Limit ${operationalThresholds.latencyWarning}ms`} icon={<Cpu size={17} />} status="warning" />
        <OperationsKpi label="Error rate" value="0.9%" detail="Across selected scope" icon={<AlertTriangle size={17} />} status="healthy" />
        <OperationsKpi label="Estimated cost" value="AED 18.4k" detail={`Watch ${operationalThresholds.monthlyCostWarning.toLocaleString()} AED`} icon={<WalletCards size={17} />} status="warning" />
        <OperationsKpi label="Open issues" value="5" detail="One critical incident" icon={<Server size={17} />} status="critical" />
      </div>

      <Card className="mt-3 overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 md:flex-row md:items-center">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">What needs attention right now</h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Incidents are ordered by operational urgency.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/routing-policies" className="text-xs font-semibold text-[var(--brand-primary)] hover:underline">Review model routing</Link>
            <span className="text-[var(--border-subtle)]">|</span>
            <Link href="/dashboard/settings" className="text-xs font-semibold text-[var(--brand-primary)] hover:underline">Tune thresholds</Link>
          </div>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {visibleAlerts.map((alert) => (
            <div key={alert.title} className="grid gap-3 px-4 py-3 lg:grid-cols-[96px_150px_110px_minmax(220px,1fr)_minmax(180px,0.8fr)_auto] lg:items-center">
              <StatusBadge value={alert.severity} />
              <div className="text-xs font-semibold text-[var(--text-primary)]">{alertSystems[alert.title]}</div>
              <div className="text-xs font-semibold text-[var(--text-secondary)]">{alert.area}</div>
              <div className="text-sm font-medium text-[var(--text-primary)]">{alert.title}</div>
              <div className="text-xs text-[var(--text-secondary)]">{alertActions[alert.area]}</div>
              <ActionButton variant="secondary" onClick={() => simulateAction(`Open ${alert.area} alert`, alert.title)}>Open</ActionButton>
            </div>
          ))}
          {visibleAlerts.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">No alerts match the selected severity.</div>
          ) : null}
        </div>
      </Card>

      <Card className="mt-3 p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-end">
            <div>
              <p className="mb-1.5 text-xs font-medium text-[var(--text-secondary)]">Time range</p>
              <div className="flex rounded-md border border-[var(--border-subtle)] bg-white p-1">
                {timeRanges.map((range) => <SegmentButton key={range} active={timeRange === range} onClick={() => setTimeRange(range)}>{range}</SegmentButton>)}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-[var(--text-secondary)]">Metric view</p>
              <div className="flex max-w-full overflow-x-auto rounded-md border border-[var(--border-subtle)] bg-white p-1">
                {metricViews.map((view) => <SegmentButton key={view} active={metricView === view} onClick={() => setMetricView(view)}>{view}</SegmentButton>)}
              </div>
            </div>
            <div className="grid flex-1 gap-2 sm:grid-cols-3">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Server
                <select value={targetFilter} onChange={(event) => setTargetFilter(event.target.value)} className="mt-1 block h-9 w-full rounded-md border border-[var(--border-subtle)] bg-white px-2 text-xs text-[var(--text-primary)]">
                  <option>All servers</option>
                  {targets.map((target) => <option key={target.id}>{target.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-[var(--text-secondary)]">Provider
                <select value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)} className="mt-1 block h-9 w-full rounded-md border border-[var(--border-subtle)] bg-white px-2 text-xs text-[var(--text-primary)]">
                  <option>All providers</option>
                  {providerHealth.filter((provider) => provider.status !== "Self-hosted").map((provider) => <option key={provider.provider}>{provider.provider}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-[var(--text-secondary)]">Severity
                <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as (typeof severities)[number])} className="mt-1 block h-9 w-full rounded-md border border-[var(--border-subtle)] bg-white px-2 text-xs text-[var(--text-primary)]">
                  {severities.map((severity) => <option key={severity}>{severity}</option>)}
                </select>
              </label>
            </div>
          </div>
          <button type="button" onClick={resetFilters} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-[var(--border-subtle)] bg-white px-3 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]">
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </Card>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        {(metricView === "Overview" || metricView === "Infrastructure") ? (
          <MonitoringChart title="Fleet GPU utilization" scope={chartScope} value="71%" note={`Warning at ${operationalThresholds.gpuMemoryWarning}%`}>
            <AreaMetricChart data={requestVolume} dataKey="gpu" stroke="#16C7E8" threshold={operationalThresholds.gpuMemoryWarning} thresholdLabel="GPU warning" />
          </MonitoringChart>
        ) : null}
        {(metricView === "Overview" || metricView === "Usage") ? (
          <MonitoringChart title="Request volume" scope={chartScope} value="128k" note="7-day total">
            <AreaMetricChart data={requestVolume} dataKey="requests" />
          </MonitoringChart>
        ) : null}
        {(metricView === "Overview" || metricView === "Infrastructure") ? (
          <MonitoringChart title="Average latency" scope={chartScope} value="812ms" note={`Limit ${operationalThresholds.latencyWarning}ms`}>
            <AreaMetricChart data={requestVolume} dataKey="latency" stroke="#F59E0B" threshold={operationalThresholds.latencyWarning} thresholdLabel="Latency limit" />
          </MonitoringChart>
        ) : null}
        {(metricView === "Overview" || metricView === "Infrastructure") ? (
          <MonitoringChart title="Error rate" scope={chartScope} value="0.9%" note="Healthy below 1.5%">
            <AreaMetricChart data={requestVolume} dataKey="errors" stroke="#E11D48" threshold={1.5} thresholdLabel="Error warning" />
          </MonitoringChart>
        ) : null}
        {metricView === "Cost" ? (
          <MonitoringChart title="Estimated cost" scope={chartScope} value="AED 18.4k" note="Watch at AED 20k">
            <AreaMetricChart data={requestVolume} dataKey="cost" stroke="#5B3DFF" threshold={4000} thresholdLabel="Daily watch" />
          </MonitoringChart>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Provider Health & Drift</h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">External health combined with route readiness.</p>
            </div>
            <StatusBadge value="Warning" />
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {visibleProviders.map((provider) => (
              <div key={provider.provider} className="grid gap-2 px-4 py-3 md:grid-cols-[120px_110px_1fr_1fr] md:items-center">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{provider.provider}</span>
                <StatusBadge value={provider.status} />
                <span className="text-xs text-[var(--text-secondary)]">{provider.impact}</span>
                <button type="button" onClick={() => simulateAction(provider.action, provider.provider)} className="text-left text-xs font-semibold text-[var(--brand-primary)] hover:underline">{provider.action}</button>
              </div>
            ))}
          </div>
          <div className="grid gap-2 border-t border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 sm:grid-cols-2 xl:grid-cols-4">
            {driftSignals.map((signal) => (
              <div key={signal.title} className="rounded-md border border-[var(--border-subtle)] bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{signal.title}</p>
                  {signal.status === "Healthy" ? <CheckCircle2 size={14} className="shrink-0 text-[var(--status-healthy)]" /> : <AlertTriangle size={14} className="shrink-0 text-[var(--status-warning)]" />}
                </div>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{signal.detail}</p>
                <p className="mt-2 text-xs font-medium text-[var(--brand-primary-dark)]">{signal.action}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] px-4 py-3">
            <h2 className="font-semibold text-[var(--text-primary)]">Service health by server</h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Agent and stack status for the selected scope.</p>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {visibleTargets.map((target) => (
              <div key={target.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  {target.health === "Offline" ? <WifiOff size={15} className="shrink-0 text-[var(--status-critical)]" /> : <Server size={15} className="shrink-0 text-[var(--brand-accent)]" />}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{target.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{target.lastHeartbeat}</p>
                  </div>
                </div>
                <StatusBadge value={target.health} />
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--border-subtle)] p-3">
            <button type="button" onClick={() => simulateAction("Refresh monitoring data", "Monitoring")} className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-primary)]">
              <RefreshCw size={13} /> Refresh telemetry
            </button>
          </div>
        </Card>
      </div>
    </Section>
  );
}
