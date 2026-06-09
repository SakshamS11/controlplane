"use client";

import { Bell, Building2, Cloud, Database, KeyRound, Settings } from "lucide-react";
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
  const { showToast } = useAppState();
  return (
    <>
      <PageHeader eyebrow="Settings" title="Workspace settings" description="Mock controls for organization, providers, agents, retention, audits, and notifications." />
      <Section>
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="grid gap-4 md:grid-cols-2">
            {settings.map((item) => {
              const Icon = item.icon;
              return <Card key={item.title} className="p-5"><Icon className="text-cyan-700" size={20} /><h2 className="mt-4 font-semibold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p><button onClick={() => showToast(`${item.title} opened`)} className="mt-4 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium">Configure</button></Card>;
            })}
          </div>
          <Card className="p-5">
            <div className="flex items-center gap-3"><Cloud className="text-cyan-700" size={20} /><h2 className="font-semibold">Connected providers</h2></div>
            <div className="mt-5 space-y-3">{providers.map(([name, status]) => <div key={name} className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm"><span>{name}</span><StatusBadge value={status} /></div>)}</div>
          </Card>
        </div>
      </Section>
    </>
  );
}
