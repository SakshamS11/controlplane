"use client";

import { Bell, Building2, Cloud, Database, Gauge, KeyRound, Settings, SlidersHorizontal } from "lucide-react";
import { Card, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

const settings = [
  { title: "Organization profile", text: "Name, workspace slug, and billing contact placeholder", icon: Building2 },
  { title: "Agent install settings", text: "Mock install script URL, token duration, and target labels", icon: KeyRound },
  { title: "Data retention", text: "Prompt, metric, and event retention policies", icon: Database },
  { title: "Audit log retention", text: "Enterprise evidence export and retention windows", icon: Settings },
  { title: "Notification settings", text: "Alert routing for email, Slack, and webhooks", icon: Bell }
];

const providers = [
  ["OpenAI", "Connected"],
  ["Anthropic", "Connected"],
  ["Google", "Not connected"],
  ["Azure", "Connected"],
  ["AWS", "Not connected"]
];

export default function SettingsPage() {
  const { showToast, operationalThresholds, updateOperationalThreshold } = useAppState();
  const thresholdControls = [
    { key: "gpuMemoryWarning", label: "GPU memory warning", suffix: "%", min: 50, max: 99, value: operationalThresholds.gpuMemoryWarning },
    { key: "gpuMemoryCritical", label: "GPU memory critical", suffix: "%", min: 60, max: 100, value: operationalThresholds.gpuMemoryCritical },
    { key: "cpuWarning", label: "CPU warning", suffix: "%", min: 50, max: 100, value: operationalThresholds.cpuWarning },
    { key: "ramWarning", label: "RAM warning", suffix: "%", min: 50, max: 100, value: operationalThresholds.ramWarning },
    { key: "diskWarning", label: "Disk warning", suffix: "%", min: 50, max: 100, value: operationalThresholds.diskWarning },
    { key: "latencyWarning", label: "Latency warning", suffix: " ms", min: 300, max: 3000, step: 50, value: operationalThresholds.latencyWarning },
    { key: "monthlyCostWarning", label: "Monthly cost warning", suffix: " AED", min: 1000, max: 100000, step: 1000, value: operationalThresholds.monthlyCostWarning }
  ] as const;

  return (
    <>
      <PageHeader eyebrow="Settings" title="Workspace settings" description="Configure organization defaults, providers, agents, notifications, and the operational thresholds that drive alerts." />
      <Section>
        <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><SlidersHorizontal size={15} /> Alert thresholds</div>
                <h2 className="mt-2 text-lg font-semibold">Define your safe operating ranges</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">These values decide when the overview, monitoring page, and alert queue show warnings or critical infrastructure events.</p>
              </div>
              <Gauge className="text-cyan-700" size={22} />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {thresholdControls.map((control) => (
                <label key={control.key} className="rounded-md border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800">{control.label}</span>
                    <span className="text-sm font-semibold text-slate-950">{control.value}{control.suffix}</span>
                  </div>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={"step" in control ? control.step : 1}
                    value={control.value}
                    onChange={(event) => updateOperationalThreshold(control.key, Number(event.target.value))}
                    className="mt-4 w-full accent-cyan-700"
                    aria-label={control.label}
                  />
                  <input
                    type="number"
                    min={control.min}
                    max={control.max}
                    step={"step" in control ? control.step : 1}
                    value={control.value}
                    onChange={(event) => updateOperationalThreshold(control.key, Number(event.target.value))}
                    className="mt-3 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                    aria-label={`${control.label} value`}
                  />
                </label>
              ))}
            </div>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {settings.map((item) => {
              const Icon = item.icon;
              return <Card key={item.title} className="p-5"><Icon className="text-cyan-700" size={20} /><h2 className="mt-4 font-semibold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p><button onClick={() => showToast(`${item.title} opened`)} className="mt-4 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium">Configure</button></Card>;
            })}
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card className="p-5">
            <h2 className="font-semibold">Policy impact preview</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-amber-100 bg-amber-50 p-4 text-sm">
                <div className="font-semibold text-amber-800">GPU warning</div>
                <div className="mt-1 text-amber-700">Triggers at {operationalThresholds.gpuMemoryWarning}% memory.</div>
              </div>
              <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm">
                <div className="font-semibold text-red-800">GPU critical</div>
                <div className="mt-1 text-red-700">Escalates at {operationalThresholds.gpuMemoryCritical}% memory.</div>
              </div>
              <div className="rounded-md border border-cyan-100 bg-cyan-50 p-4 text-sm">
                <div className="font-semibold text-cyan-800">Latency watch</div>
                <div className="mt-1 text-cyan-700">Flags routes above {operationalThresholds.latencyWarning} ms.</div>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><Cloud className="text-cyan-700" size={20} /><h2 className="font-semibold">Connected providers</h2></div>
            <div className="mt-5 space-y-3">{providers.map(([name, status]) => <div key={name} className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm"><span>{name}</span><StatusBadge value={status} /></div>)}</div>
          </Card>
        </div>
      </Section>
    </>
  );
}
