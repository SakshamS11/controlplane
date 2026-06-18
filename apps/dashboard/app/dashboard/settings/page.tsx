"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  Cloud,
  Database,
  Gauge,
  KeyRound,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal
} from "lucide-react";
import { ActionButton, Card, Modal, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

type SettingsTab = "overview" | "thresholds" | "integrations" | "governance";
type SettingsGroup = "general" | "integrations" | "governance";

const settings = [
  { title: "Organization profile", text: "Name, workspace slug, and billing contact", icon: Building2, group: "general" },
  { title: "Workspace publishing defaults", text: "Open WebUI launch rules, audit capture, and invites", icon: SlidersHorizontal, group: "general" },
  { title: "Provider settings", text: "Model gateway defaults and server-side secret references", icon: Cloud, group: "integrations" },
  { title: "Agent install settings", text: "Install script URL, token duration, and target labels", icon: KeyRound, group: "integrations" },
  { title: "Notification settings", text: "Alert routing for email, Slack, and webhooks", icon: Bell, group: "integrations" },
  { title: "Data residency", text: "Default regions and restricted knowledge routing", icon: Database, group: "governance" },
  { title: "Data retention", text: "Prompt, metric, and event retention policies", icon: Database, group: "governance" },
  { title: "Audit log retention", text: "Evidence export and retention windows", icon: Settings, group: "governance" },
  { title: "Compliance settings", text: "ISO/IEC 42001 readiness labels and reviewer routing", icon: ShieldCheck, group: "governance" }
] satisfies Array<{ title: string; text: string; icon: typeof Building2; group: SettingsGroup }>;

const providers = [
  ["OpenAI", "Connected"],
  ["Anthropic", "Connected"],
  ["Google", "Not connected"],
  ["Azure", "Connected"],
  ["AWS", "Not connected"]
];

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "thresholds", label: "Alert Thresholds" },
  { id: "integrations", label: "Integrations" },
  { id: "governance", label: "Governance & Retention" }
];

export default function SettingsPage() {
  const { showToast, operationalThresholds, updateOperationalThreshold } = useAppState();
  const [activeTab, setActiveTab] = useState<SettingsTab>("overview");
  const [selectedSetting, setSelectedSetting] = useState<(typeof settings)[number] | null>(null);
  const thresholdControls = [
    { key: "gpuMemoryWarning", label: "GPU memory warning", suffix: "%", min: 50, max: 99, value: operationalThresholds.gpuMemoryWarning },
    { key: "gpuMemoryCritical", label: "GPU memory critical", suffix: "%", min: 60, max: 100, value: operationalThresholds.gpuMemoryCritical },
    { key: "cpuWarning", label: "CPU warning", suffix: "%", min: 50, max: 100, value: operationalThresholds.cpuWarning },
    { key: "ramWarning", label: "RAM warning", suffix: "%", min: 50, max: 100, value: operationalThresholds.ramWarning },
    { key: "diskWarning", label: "Disk warning", suffix: "%", min: 50, max: 100, value: operationalThresholds.diskWarning },
    { key: "latencyWarning", label: "Latency warning", suffix: " ms", min: 300, max: 3000, step: 50, value: operationalThresholds.latencyWarning },
    { key: "monthlyCostWarning", label: "Monthly cost warning", suffix: " AED", min: 1000, max: 100000, step: 1000, value: operationalThresholds.monthlyCostWarning }
  ] as const;

  useEffect(() => {
    function openLinkedSection() {
      if (window.location.hash === "#thresholds") setActiveTab("thresholds");
    }
    openLinkedSection();
    window.addEventListener("hashchange", openLinkedSection);
    return () => window.removeEventListener("hashchange", openLinkedSection);
  }, []);

  const configureCards = (group: SettingsGroup) => (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {settings.filter((item) => item.group === group).map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="flex min-h-40 flex-col p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-[rgba(22,199,232,0.12)] text-[var(--brand-accent)]"><Icon size={17} /></span>
              <StatusBadge value="Active" />
            </div>
            <h2 className="mt-3 text-sm font-semibold">{item.title}</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{item.text}</p>
            <button type="button" onClick={() => setSelectedSetting(item)} className="mt-auto pt-3 text-left text-xs font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-primary-dark)]">
              Configure
            </button>
          </Card>
        );
      })}
    </div>
  );

  return (
    <>
      <PageHeader eyebrow="Settings" title="Workspace settings" description="Configure organization defaults, integrations, retention, and operating thresholds." />
      <Section>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Acme Corp", "Organization"],
            ["UAE North", "Data residency"],
            ["365 days", "Audit retention"],
            ["Open WebUI", "Workspace default"],
            ["Readiness support", "Evidence preparation"]
          ].map(([value, label]) => (
            <Card key={label} className="p-4">
              <div className="text-sm font-semibold">{value}</div>
              <div className="mt-1 text-xs text-[var(--text-secondary)]">{label}</div>
            </Card>
          ))}
        </div>

        <div id="settings-tabs" className="mt-3 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-white p-1 shadow-sm lg:sticky lg:top-[57px] lg:z-10">
          <div role="tablist" aria-label="Settings sections" className="flex min-w-max gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-9 rounded-md px-3 py-2 text-sm font-medium transition ${activeTab === tab.id ? "bg-[var(--brand-primary)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" ? (
          <div className="mt-3 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Operating defaults</h2>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">Common settings are ready; open a section only when changes are needed.</p>
                </div>
                <StatusBadge value="Healthy" />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {settings.filter((item) => item.group === "general").map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.title} type="button" onClick={() => setSelectedSetting(item)} className="flex items-center gap-3 rounded-md border border-[var(--border-subtle)] p-3 text-left hover:bg-[var(--surface-muted)]">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[rgba(91,61,255,0.09)] text-[var(--brand-primary)]"><Icon size={17} /></span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{item.title}</span>
                        <span className="block truncate text-xs text-[var(--text-secondary)]">{item.text}</span>
                      </span>
                    </button>
                  );
                })}
                <button type="button" onClick={() => setActiveTab("thresholds")} className="flex items-center gap-3 rounded-md border border-[var(--border-subtle)] p-3 text-left hover:bg-[var(--surface-muted)]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[rgba(245,158,11,0.12)] text-[var(--status-warning)]"><Gauge size={17} /></span>
                  <span><span className="block text-sm font-semibold">Alert thresholds</span><span className="block text-xs text-[var(--text-secondary)]">GPU warning starts at {operationalThresholds.gpuMemoryWarning}%.</span></span>
                </button>
                <button type="button" onClick={() => setActiveTab("governance")} className="flex items-center gap-3 rounded-md border border-[var(--border-subtle)] p-3 text-left hover:bg-[var(--surface-muted)]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[rgba(16,185,129,0.10)] text-[var(--status-healthy)]"><ShieldCheck size={17} /></span>
                  <span><span className="block text-sm font-semibold">Governance defaults</span><span className="block text-xs text-[var(--text-secondary)]">Evidence readiness support is enabled.</span></span>
                </button>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between"><h2 className="font-semibold">Connected providers</h2><button type="button" onClick={() => setActiveTab("integrations")} className="text-xs font-semibold text-[var(--brand-primary)]">Manage</button></div>
              <div className="mt-3 divide-y divide-[var(--border-subtle)]">
                {providers.map(([name, status]) => <div key={name} className="flex items-center justify-between py-2.5 text-sm"><span>{name}</span><StatusBadge value={status} /></div>)}
              </div>
            </Card>
          </div>
        ) : null}

        {activeTab === "thresholds" ? (
          <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_320px]">
            <Card id="thresholds" className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="font-semibold">Safe operating ranges</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">Threshold changes update this mock environment only.</p></div>
                <Gauge className="text-[var(--brand-accent)]" size={20} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {thresholdControls.map((control) => (
                  <label key={control.key} className="rounded-md border border-[var(--border-subtle)] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">{control.label}</span>
                      <span className="text-xs font-semibold">{control.value}{control.suffix}</span>
                    </div>
                    <input type="range" min={control.min} max={control.max} step={"step" in control ? control.step : 1} value={control.value} onChange={(event) => updateOperationalThreshold(control.key, Number(event.target.value))} className="mt-3 w-full accent-[var(--brand-primary)]" aria-label={control.label} />
                    <input type="number" min={control.min} max={control.max} step={"step" in control ? control.step : 1} value={control.value} onChange={(event) => updateOperationalThreshold(control.key, Number(event.target.value))} className="mt-2 min-h-9 w-full rounded-md border border-[var(--border-subtle)] px-2.5 text-sm" aria-label={`${control.label} value`} />
                  </label>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h2 className="font-semibold">Policy impact</h2>
              <div className="mt-3 space-y-3 text-sm">
                <div className="rounded-md bg-[rgba(245,158,11,0.08)] p-3"><span className="font-semibold text-[var(--status-warning)]">GPU warning</span><p className="mt-1 text-xs text-[var(--text-secondary)]">Triggers at {operationalThresholds.gpuMemoryWarning}% memory.</p></div>
                <div className="rounded-md bg-[rgba(225,29,72,0.07)] p-3"><span className="font-semibold text-[var(--status-critical)]">GPU critical</span><p className="mt-1 text-xs text-[var(--text-secondary)]">Escalates at {operationalThresholds.gpuMemoryCritical}% memory.</p></div>
                <div className="rounded-md bg-[rgba(22,199,232,0.08)] p-3"><span className="font-semibold text-cyan-700">Latency watch</span><p className="mt-1 text-xs text-[var(--text-secondary)]">Flags routes above {operationalThresholds.latencyWarning} ms.</p></div>
              </div>
            </Card>
          </div>
        ) : null}

        {activeTab === "integrations" ? <div className="mt-3">{configureCards("integrations")}</div> : null}
        {activeTab === "governance" ? <div className="mt-3">{configureCards("governance")}</div> : null}
      </Section>

      {selectedSetting ? (
        <Modal title={`Configure ${selectedSetting.title}`} onClose={() => setSelectedSetting(null)}>
          <p className="text-sm text-[var(--text-secondary)]">{selectedSetting.text}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Configuration owner<select defaultValue="Platform Operations" className="mt-2 min-h-10 w-full rounded-md border border-[var(--border-subtle)] px-3"><option>Platform Operations</option><option>Security</option><option>AI Governance</option></select></label>
            <label className="text-sm font-medium">Scope<select defaultValue="Organization default" className="mt-2 min-h-10 w-full rounded-md border border-[var(--border-subtle)] px-3"><option>Organization default</option><option>Production only</option><option>Selected workspaces</option></select></label>
          </div>
          <label className="mt-4 block text-sm font-medium">Change note<textarea className="mt-2 min-h-24 w-full rounded-md border border-[var(--border-subtle)] p-3" placeholder="Describe the intended policy change." /></label>
          <p className="mt-3 text-xs text-[var(--text-secondary)]">Configuration changes are recorded with owner, scope, and audit context.</p>
          <div className="mt-5 flex justify-end gap-2">
            <ActionButton variant="secondary" onClick={() => setSelectedSetting(null)}>Cancel</ActionButton>
            <ActionButton onClick={() => { showToast(`${selectedSetting.title} saved`); setSelectedSetting(null); }}><Save size={15} /> Save change</ActionButton>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
