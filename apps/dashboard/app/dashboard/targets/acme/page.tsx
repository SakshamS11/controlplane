"use client";

import { Activity, Boxes, Cpu, HardDrive, RotateCcw, Server, UploadCloud, Zap } from "lucide-react";
import { useState } from "react";
import { AreaMetricChart, MultiLineChart } from "@/components/charts";
import { ActionButton, Card, ChartCard, DataTable, MetricCard, MockAction, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { cpuRamSeries, services, targets, timeline } from "@/lib/mock-data";

export default function AcmeTargetDetailPage() {
  const target = targets[0];
  const { showToast, addAudit } = useAppState();
  const [progress, setProgress] = useState(10);

  function simulateDeploy() {
    setProgress(2);
    showToast("Deployment simulation started");
    addAudit("Deploy Stack", target.name);
    const steps = [18, 32, 46, 58, 70, 82, 92, 100];
    steps.forEach((value, index) => window.setTimeout(() => setProgress(value), 320 * (index + 1)));
    window.setTimeout(() => showToast("Private AI Basic deployment complete"), 3000);
  }

  return (
    <>
      <PageHeader
        eyebrow="Target detail"
        title="Acme Azure GPU Server"
        description="The primary demo page: remote target status, GPU telemetry, service controls, stack actions, and deployment timeline in one operational view."
        action={<div className="flex flex-wrap gap-2"><ActionButton onClick={simulateDeploy}><UploadCloud size={16} /> Deploy Stack</ActionButton><MockAction label="View Logs" auditTarget={target.name} /></div>}
      />
      <Section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard label="Agent status" value={target.agent} detail="Last heartbeat: 8 seconds ago" icon={<Activity size={18} />} />
          <MetricCard label="Region" value={target.region} detail={target.type} icon={<Server size={18} />} />
          <MetricCard label="Stack" value={target.stack} detail="Agent v0.1.0" icon={<Boxes size={18} />} />
          <MetricCard label="GPU" value="NVIDIA L40S" detail="VRAM 34 GB / 48 GB" icon={<Zap size={18} />} />
          <MetricCard label="CPU usage" value="24%" detail="Low contention" icon={<Cpu size={18} />} />
          <MetricCard label="Disk usage" value="63%" detail="1.2 TB available" icon={<HardDrive size={18} />} />
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <ChartCard title="CPU/RAM over time" detail="Mock host telemetry"><MultiLineChart data={cpuRamSeries} keys={[{ key: "cpu", name: "CPU", color: "#0891b2" }, { key: "ram", name: "RAM", color: "#4f46e5" }]} /></ChartCard>
          <ChartCard title="GPU utilization over time" detail="L40S utilization"><AreaMetricChart data={cpuRamSeries} dataKey="gpu" stroke="#059669" /></ChartCard>
          <ChartCard title="Latency over time" detail="Gateway p50 latency"><AreaMetricChart data={cpuRamSeries} dataKey="latency" stroke="#d97706" /></ChartCard>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold">Running services</h2>
              <StatusBadge value="6/6 Running" />
            </div>
            <DataTable
              columns={["Service", "Status", "Port", "Action"]}
              rows={services.map((service) => [
                <span key="name" className="font-medium">{service.name}</span>,
                <StatusBadge key="status" value={service.status} />,
                <span key="port" className="font-mono text-xs">{service.port}</span>,
                <ActionButton key="action" variant="secondary" onClick={() => { showToast(`${service.name} restart queued`); addAudit(`${service.name} service restarted`, service.name); }}><RotateCcw size={14} /> Restart</ActionButton>
              ])}
            />
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold">Deployment timeline</h2>
            <div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-cyan-500 transition-all" style={{ width: `${progress}%` }} /></div>
            <div className="mt-5 space-y-3">
              {timeline.map((step, index) => {
                const done = progress >= ((index + 1) / timeline.length) * 100;
                return <div key={step} className="flex items-center gap-3 text-sm"><span className={`h-2.5 w-2.5 rounded-full ${done ? "bg-cyan-500" : "bg-slate-300"}`} />{step}</div>;
              })}
            </div>
          </Card>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <MockAction label="Restart Service" auditTarget={target.name} />
          <MockAction label="Upgrade Stack" auditTarget={target.name} />
          <MockAction label="Rollback" auditTarget={target.name} variant="danger" />
        </div>
      </Section>
    </>
  );
}
