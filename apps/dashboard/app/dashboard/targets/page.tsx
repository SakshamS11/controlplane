"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Copy,
  Cpu,
  Plus,
  Server,
  ShieldCheck,
  TerminalSquare,
  WifiOff
} from "lucide-react";
import { ActionButton, Card, Modal, Section, StatusBadge, useAppState } from "@/components/ui";
import { targets } from "@/lib/mock-data";

const installCommand = "curl -fsSL https://controlplane.example.com/install-agent.sh | sudo bash -s -- --token TARGET_TOKEN --url https://api.controlplane.example.com";

const serverCapacity = {
  acme: {
    gpuLoad: 71,
    vramUsed: 34,
    vramTotal: 48,
    nextStep: "View details",
    recommendation: "Capacity is within its configured operating range."
  },
  claims: {
    gpuLoad: 92,
    vramUsed: 22,
    vramTotal: 24,
    nextStep: "Review capacity",
    recommendation: "Add one Qwen Local replica or reclaim underused Finance GPU capacity."
  },
  aws: {
    gpuLoad: 54,
    vramUsed: 16,
    vramTotal: 24,
    nextStep: "View details",
    recommendation: "Healthy capacity is available for RAG and permission-aware cache workloads."
  },
  legal: {
    gpuLoad: null,
    vramUsed: null,
    vramTotal: null,
    nextStep: "Reconnect agent",
    recommendation: "Reconnect the agent before deploying or managing services."
  }
} as const;

const filters = ["All", "Healthy", "Warning", "Offline", "On-prem", "Cloud", "GPU pressure"] as const;
type Filter = (typeof filters)[number];

function ProgressMeter({ value, warningAt = 85 }: { value: number | null; warningAt?: number }) {
  if (value === null) {
    return <span className="text-xs font-medium text-[var(--status-offline)]">n/a</span>;
  }

  const barColor = value >= warningAt
    ? "bg-[var(--status-warning)]"
    : "bg-[var(--brand-accent)]";

  return (
    <div className="min-w-[88px]">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-[var(--text-primary)]">{value}%</span>
        {value >= warningAt ? <span className="text-[var(--status-warning)]">High</span> : null}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function VramMeter({ used, total }: { used: number | null; total: number | null }) {
  if (used === null || total === null) {
    return <span className="text-xs font-medium text-[var(--status-offline)]">n/a</span>;
  }

  const percentage = Math.round((used / total) * 100);
  return (
    <div className="min-w-[92px]">
      <div className="mb-1 text-xs font-semibold text-[var(--text-primary)]">{used}/{total} GB</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className={`h-full rounded-full ${percentage >= 90 ? "bg-[var(--status-warning)]" : "bg-[var(--brand-primary)]"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function DeploymentTargetsPage() {
  const [installOpen, setInstallOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const { addAudit, showToast } = useAppState();

  useEffect(() => {
    function syncRegisterAction() {
      if (window.location.hash === "#register-agent") setInstallOpen(true);
    }
    syncRegisterAction();
    window.addEventListener("hashchange", syncRegisterAction);
    return () => window.removeEventListener("hashchange", syncRegisterAction);
  }, []);

  const filteredTargets = useMemo(() => targets.filter((target) => {
    const capacity = serverCapacity[target.id as keyof typeof serverCapacity];
    if (activeFilter === "All") return true;
    if (activeFilter === "Healthy" || activeFilter === "Warning" || activeFilter === "Offline") {
      return target.health === activeFilter;
    }
    if (activeFilter === "On-prem") {
      return target.type === "On-prem GPU Server" || target.type === "Local Workstation";
    }
    if (activeFilter === "Cloud") {
      return target.type === "Azure VM" || target.type === "AWS EC2";
    }
    return (capacity.gpuLoad ?? 0) >= 85;
  }), [activeFilter]);

  const applyCapacityFix = () => {
    showToast("Capacity approval requested");
    addAudit("Qwen capacity change approval requested", "Claims On-Prem Node", "Capacity");
  };

  return (
    <>
      <Section>
        <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Operate</p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Servers</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Fleet health, GPU capacity, agent connectivity, and deployed AI stacks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ActionButton variant="secondary" onClick={() => setInstallOpen(true)}>
              <TerminalSquare size={16} /> Register agent
            </ActionButton>
            <ActionButton onClick={() => setInstallOpen(true)}>
              <Plus size={16} /> Add server
            </ActionButton>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Servers online",
              value: "3/4",
              detail: "Available for operations",
              icon: <CheckCircle2 size={17} />,
              tone: "text-[var(--status-healthy)] bg-[rgba(16,185,129,0.10)]"
            },
            {
              label: "Warning node",
              value: "Claims GPU",
              detail: "VRAM pressure detected",
              icon: <AlertTriangle size={17} />,
              tone: "text-[var(--status-warning)] bg-[rgba(245,158,11,0.12)]"
            },
            {
              label: "Offline agent",
              value: "Legal Sandbox",
              detail: "Disconnected 42m ago",
              icon: <WifiOff size={17} />,
              tone: "text-[var(--status-critical)] bg-[rgba(225,29,72,0.10)]"
            },
            {
              label: "GPU capacity",
              value: "71% avg",
              detail: "92% fleet peak",
              icon: <Activity size={17} />,
              tone: "text-[var(--brand-accent)] bg-[rgba(22,199,232,0.12)]"
            },
            {
              label: "Agent safe mode",
              value: "Enforced",
              detail: "Allowlisted commands only",
              icon: <ShieldCheck size={17} />,
              tone: "text-[var(--brand-primary)] bg-[rgba(91,61,255,0.10)]"
            }
          ].map((metric) => (
            <Card key={metric.label} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--text-secondary)]">{metric.label}</p>
                  <p className="mt-1 truncate text-lg font-semibold text-[var(--text-primary)]">{metric.value}</p>
                  <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{metric.detail}</p>
                </div>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${metric.tone}`}>
                  {metric.icon}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-4 border-l-4 border-l-[var(--status-warning)] p-4">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[rgba(245,158,11,0.12)] text-[var(--status-warning)]">
                <AlertTriangle size={18} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-[var(--text-primary)]">Claims On-Prem Node near VRAM pressure</h2>
                  <StatusBadge value="Warning" />
                </div>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Add one Qwen Local replica or reclaim Finance GPU capacity.
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--brand-primary-dark)]">
                  Impact: reduce queue wait and missed SLA risk.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href="/dashboard/resource-planner"
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-muted)]"
              >
                Open capacity planner <ChevronRight size={15} />
              </Link>
              <Link
                href="/dashboard/resource-planner"
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-muted)]"
              >
                Review capacity <ChevronRight size={15} />
              </Link>
              <ActionButton onClick={applyCapacityFix}>Request approval</ActionButton>
            </div>
          </div>
        </Card>

        <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] p-1">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${
                  activeFilter === filter
                    ? "bg-[var(--brand-primary)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Showing {filteredTargets.length} of {targets.length} servers
          </p>
        </div>

        <Card className="mt-3 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1240px] text-left text-sm">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-secondary)]">
                <tr>
                  {["Server", "Type", "Region", "Agent", "Stack", "GPU", "GPU Load", "VRAM", "Health", "Next Step"].map((column) => (
                    <th key={column} className="whitespace-nowrap px-4 py-3 font-semibold">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredTargets.map((target) => {
                  const capacity = serverCapacity[target.id as keyof typeof serverCapacity];
                  const rowTone = target.health === "Offline"
                    ? "bg-[rgba(225,29,72,0.025)]"
                    : target.health === "Warning"
                      ? "bg-[rgba(245,158,11,0.035)]"
                      : "";

                  return (
                    <tr key={target.id} className={`${rowTone} transition hover:bg-[var(--surface-muted)]`}>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <Link
                          href={target.id === "acme" ? "/dashboard/targets/acme" : "/dashboard/targets"}
                          className="font-semibold text-[var(--text-primary)] hover:text-[var(--brand-primary)]"
                        >
                          {target.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{target.lastHeartbeat}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[var(--text-secondary)]">
                        <span className="inline-flex items-center gap-1.5">
                          {target.type === "Azure VM" || target.type === "AWS EC2" ? <Cloud size={13} /> : <Server size={13} />}
                          {target.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[var(--text-secondary)]">{target.region}</td>
                      <td className="whitespace-nowrap px-4 py-3.5"><StatusBadge value={target.agent} /></td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[var(--text-secondary)]">{target.stack === "None" ? "No stack" : target.stack}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[var(--text-secondary)]">
                        <span className="inline-flex items-center gap-1.5"><Cpu size={13} /> {target.gpu === "Not detected" ? "Not detected" : target.gpu}</span>
                      </td>
                      <td className="px-4 py-3.5"><ProgressMeter value={capacity.gpuLoad} /></td>
                      <td className="px-4 py-3.5"><VramMeter used={capacity.vramUsed} total={capacity.vramTotal} /></td>
                      <td className="whitespace-nowrap px-4 py-3.5"><StatusBadge value={target.health} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={target.id === "claims" ? "/dashboard/resource-planner" : target.id === "acme" ? "/dashboard/targets/acme" : "/dashboard/targets"}
                            className={`whitespace-nowrap text-xs font-semibold ${
                              target.health === "Offline"
                                ? "text-[var(--status-critical)]"
                                : target.health === "Warning"
                                  ? "text-[var(--status-warning)]"
                                  : "text-[var(--brand-primary)]"
                            }`}
                          >
                            {capacity.nextStep}
                          </Link>
                          <details className="relative">
                            <summary
                              className="cursor-pointer list-none rounded p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
                              aria-label={`Show recommendation for ${target.name}`}
                            >
                              <ChevronRight size={14} />
                            </summary>
                            <div className="absolute right-0 z-10 mt-2 w-72 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 text-xs leading-5 text-[var(--text-secondary)] shadow-xl">
                              {capacity.recommendation}
                            </div>
                          </details>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredTargets.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">No servers match this filter</p>
              <button
                type="button"
                onClick={() => setActiveFilter("All")}
                className="mt-2 text-sm font-semibold text-[var(--brand-primary)]"
              >
                Show all servers
              </button>
            </div>
          ) : null}
        </Card>
      </Section>

      {installOpen ? (
        <Modal title="Register a server agent" onClose={() => setInstallOpen(false)}>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Run this agent install command on the Ubuntu server you want to manage.
          </p>
          <pre className="mt-4 overflow-auto rounded-lg bg-[var(--surface-dark)] p-4 text-xs text-cyan-100">{installCommand}</pre>
          <div className="mt-4 flex justify-end">
            <ActionButton
              variant="secondary"
              onClick={() => {
                navigator.clipboard?.writeText(installCommand);
                showToast("Install command copied");
              }}
            >
              <Copy size={16} /> Copy install command
            </ActionButton>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
