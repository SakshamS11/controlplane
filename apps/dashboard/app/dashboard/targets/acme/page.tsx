"use client";

import Link from "next/link";
import { Activity, ArrowRight, Boxes, CheckCircle2, Cpu, FileText, HardDrive, RotateCcw, Server, UploadCloud, Zap } from "lucide-react";
import { useState } from "react";
import { AreaMetricChart, MultiLineChart } from "@/components/charts";
import { ActionButton, Card, ChartCard, DataTable, MetricCard, MockAction, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { cpuRamSeries, services, targets, timeline } from "@/lib/mock-data";

export default function AcmeTargetDetailPage() {
  const target = targets[0];
  const { showToast, addAudit } = useAppState();
  const [progress, setProgress] = useState(10);
  const [activePanel, setActivePanel] = useState("metrics");

  function simulateDeploy() {
    setProgress(2);
    showToast("Deployment simulation started");
    addAudit("Deployment simulation replayed", target.name);
    const steps = [18, 32, 46, 58, 70, 82, 92, 100];
    steps.forEach((value, index) => window.setTimeout(() => setProgress(value), 320 * (index + 1)));
    window.setTimeout(() => showToast("Private AI Basic deployment complete"), 3000);
  }

  function requestDeploymentApproval() {
    showToast("Deployment approval requested");
    addAudit("Deployment approval requested", target.name, "Permission");
  }

  return (
    <>
      <PageHeader
        eyebrow="Server detail"
        title="Acme Azure GPU Server"
        description="Inspect server health, GPU telemetry, services, and deployment history."
        action={<div className="flex flex-wrap gap-2"><Link href="/dashboard/approval-inbox" onClick={requestDeploymentApproval} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--brand-primary-dark)]"><UploadCloud size={16} /> Request deployment</Link><MockAction label="View Logs" auditTarget={target.name} /></div>}
      />
      <Section>
        <div className="mb-6 grid gap-6 xl:grid-cols-[1.2fr_420px]">
          <Card className="overflow-hidden">
            <div className="grid gap-0 md:grid-cols-[260px_1fr]">
              <div className="bg-slate-950 p-6 text-white">
                <p className="text-xs font-semibold uppercase text-cyan-200">Target health</p>
                <div className="mt-4 flex items-end gap-3">
                  <div className="text-5xl font-semibold">96</div>
                  <div className="pb-2 text-sm text-slate-300">/ 100</div>
                </div>
                <div className="mt-5 inline-flex items-center gap-2 rounded-md bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200"><CheckCircle2 size={15} /> Healthy</div>
              </div>
              <div className="p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row">
                  <div>
                    <h2 className="text-lg font-semibold">Private AI Basic is serving traffic normally.</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">Six services are healthy; GPU and latency remain within configured limits.</p>
                  </div>
                  <StatusBadge value="Online" />
                </div>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Recommended action</div>
                    <div className="mt-1 text-sm font-semibold">Review logs after deployment</div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Access policy</div>
                    <div className="mt-1 text-sm font-semibold">Claims, Legal enabled</div>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Rollback point</div>
                    <div className="mt-1 text-sm font-semibold">v0.1.0 stable</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase text-cyan-700">Operator actions</p>
            <h2 className="mt-2 text-lg font-semibold">Common tasks</h2>
            <div className="mt-5 grid gap-2">
              <Link href="/dashboard/approval-inbox" onClick={requestDeploymentApproval} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--brand-primary-dark)]"><UploadCloud size={15} /> Request deployment</Link>
              <MockAction label="Restart Service" auditTarget={target.name} />
              <MockAction label="Upgrade Stack" auditTarget={target.name} />
              <MockAction label="View Logs" auditTarget={target.name} />
              <ActionButton variant="danger" onClick={() => {
                if (!window.confirm("Simulate rollback? No infrastructure changes will be made; an audit event will be recorded.")) return;
                showToast("Rollback command queued");
                addAudit("Rollback command queued", target.name);
              }}>Rollback</ActionButton>
            </div>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard label="Agent status" value={target.agent} detail="Last heartbeat: 8 seconds ago" icon={<Activity size={18} />} />
          <MetricCard label="Region" value={target.region} detail={target.type} icon={<Server size={18} />} />
          <MetricCard label="Stack" value={target.stack} detail="Agent v0.1.0" icon={<Boxes size={18} />} />
          <MetricCard label="GPU" value="NVIDIA L40S" detail="VRAM 34 GB / 48 GB" icon={<Zap size={18} />} />
          <MetricCard label="CPU usage" value="24%" detail="Low contention" icon={<Cpu size={18} />} />
          <MetricCard label="Disk usage" value="63%" detail="1.2 TB available" icon={<HardDrive size={18} />} />
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="font-semibold">Server workspace</h2>
              <p className="mt-1 text-sm text-slate-600">Metrics, services, and deployment activity.</p>
            </div>
            <div role="tablist" aria-label="Server workspace sections" className="grid grid-cols-4 rounded-md border border-slate-200 bg-slate-50 p-1">
              {[
                ["metrics", "Metrics"],
                ["services", "Services"],
                ["deployment", "Deployment"],
                ["logs", "Logs"]
              ].map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={activePanel === id} onClick={() => setActivePanel(id)} className={`min-h-9 rounded px-3 text-sm font-medium transition ${activePanel === id ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {activePanel === "metrics" ? (
            <div className="grid gap-6 p-5 xl:grid-cols-3">
              <ChartCard title="CPU/RAM over time" detail="Mock host telemetry"><MultiLineChart data={cpuRamSeries} keys={[{ key: "cpu", name: "CPU", color: "#0891b2" }, { key: "ram", name: "RAM", color: "#4f46e5" }]} /></ChartCard>
              <ChartCard title="GPU utilization over time" detail="L40S utilization"><AreaMetricChart data={cpuRamSeries} dataKey="gpu" stroke="#059669" /></ChartCard>
              <ChartCard title="Latency over time" detail="Gateway p50 latency"><AreaMetricChart data={cpuRamSeries} dataKey="latency" stroke="#d97706" /></ChartCard>
            </div>
          ) : null}
          {activePanel === "services" ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h3 className="font-semibold">Running services</h3>
                  <p className="mt-1 text-xs text-slate-500">Restart actions are grouped at row level for fast service recovery.</p>
                </div>
                <StatusBadge value="6/6 Running" />
              </div>
              <DataTable
                columns={["Service", "Status", "Port", "Recommended action", "Action"]}
                rows={services.map((service) => [
                  <span key="name" className="font-medium">{service.name}</span>,
                  <StatusBadge key="status" value={service.status} />,
                  <span key="port" className="font-mono text-xs">{service.port}</span>,
                  <span key="recommended" className="inline-flex items-center gap-2 text-xs text-slate-600"><FileText size={13} /> Review logs before restart</span>,
                  <ActionButton key="action" variant="secondary" onClick={() => { showToast(`${service.name} restart queued`); addAudit(`${service.name} service restarted`, service.name); }}><RotateCcw size={14} /> Restart</ActionButton>
                ])}
              />
            </div>
          ) : null}
          {activePanel === "deployment" ? (
            <div className="p-5">
              <h3 className="font-semibold">Deployment timeline</h3>
              <div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-cyan-500 transition-all" style={{ width: `${progress}%` }} /></div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {timeline.map((step, index) => {
                  const done = progress >= ((index + 1) / timeline.length) * 100;
                  return <div key={step} className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"><span className={`h-2.5 w-2.5 rounded-full ${done ? "bg-cyan-500" : "bg-slate-300"}`} />{step}</div>;
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={simulateDeploy} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50">Replay deployment simulation</button>
                <button type="button" onClick={() => { showToast("Deployment report opened"); addAudit("Deployment report viewed", target.name); }} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50">Open deployment report <ArrowRight size={15} /></button>
              </div>
            </div>
          ) : null}
          {activePanel === "logs" ? (
            <div className="p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h3 className="font-semibold">Logs preview</h3>
                  <p className="mt-1 text-sm text-slate-600">Bounded agent logs; arbitrary shell access is blocked.</p>
                </div>
                <StatusBadge value="Healthy" />
              </div>
              <pre className="mt-4 max-h-72 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-cyan-100">{`[10:42:11] agent heartbeat accepted for acme
[10:42:12] docker compose services healthy: 6/6
[10:42:13] gpu nvidia-l40s utilization=71% vram=34/48GB
[10:42:14] open-webui p50 latency=812ms
[10:42:15] command allowlist verified: GET_STATUS
[10:42:16] audit event recorded: service status viewed`}</pre>
            </div>
          ) : null}
        </div>
      </Section>
    </>
  );
}
