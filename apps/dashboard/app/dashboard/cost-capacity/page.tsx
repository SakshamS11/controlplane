"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  Gauge,
  PiggyBank,
  SlidersHorizontal,
  WalletCards
} from "lucide-react";
import { ComparisonBarChart, ForecastLineChart } from "@/components/charts";
import { ActionButton, Card, DataTable, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";

type CostTab = "summary" | "forecast" | "capacity" | "safeguards";

const burnRate = [
  { name: "Week 1", actual: 38, forecast: null },
  { name: "Week 2", actual: 77, forecast: null },
  { name: "Today", actual: 108, forecast: 108 },
  { name: "Week 3", actual: null, forecast: 143 },
  { name: "Month end", actual: null, forecast: 184 }
];

const teamSpend = [
  { name: "Engineering", current: 42, forecast: 55, budget: 72 },
  { name: "Claims", current: 34, forecast: 44, budget: 52 },
  { name: "Legal", current: 21, forecast: 27, budget: 34 },
  { name: "Support", current: 14, forecast: 18, budget: 25 },
  { name: "Marketing", current: 24, forecast: 31, budget: 24 },
  { name: "Finance", current: 6, forecast: 9, budget: 12 }
];

const modelSpend = [
  { name: "GPT-5", current: 45, forecast: 62, risk: "Cost risk", action: "Request Marketing ladder approval" },
  { name: "Qwen 32B", current: 28, forecast: 35, risk: "Healthy", action: "Increase local graduation" },
  { name: "Claude", current: 36, forecast: 48, risk: "Warning", action: "Reserve for approved fallback" },
  { name: "Llama 3.1", current: 20, forecast: 24, risk: "Healthy", action: "Keep normal routing" },
  { name: "Gemini", current: 12, forecast: 15, risk: "Healthy", action: "Use for Marketing drafts" }
];

const gpuCapacity = [
  { name: "Claims", assigned: 40, utilization: 38, forecast: 46, reclaimable: 0 },
  { name: "Finance", assigned: 30, utilization: 8, forecast: 10, reclaimable: 20 },
  { name: "Support", assigned: 20, utilization: 14, forecast: 18, reclaimable: 2 },
  { name: "Legal", assigned: 10, utilization: 7, forecast: 8, reclaimable: 2 }
];

const opportunities = [
  ["Support graduation", "Move 61% support traffic to Qwen 32B", "AED 35,000/mo", "High confidence"],
  ["Marketing cost ladder", "Route drafting to Gemini before GPT-5", "AED 18,000/mo", "Medium risk"],
  ["Semantic cache", "Cache repeated support queries with permission checks", "AED 11,400/mo", "Low risk"],
  ["Finance capacity reclaim", "Reduce reserved GPU from 30% to 10%", "20% GPU freed", "Low risk"]
];

const circuitBreakers = [
  ["Marketing", "80% budget used", "In 19 days", "Cache -> cheaper model -> approval -> hard stop", "Armed"],
  ["Legal", "Confidential KB detected", "Immediate", "Local Qwen only -> no external fallback", "Enforced"],
  ["Claims", "Queue wait above SLA", "At 46% demand", "Local capacity -> replica -> no cloud fallback", "Warning"],
  ["Engineering", "Provider degraded", "On incident", "DeepSeek Coder -> Claude -> GPT-5", "Active"]
];

const forecastItems = [
  { text: "Current run-rate reaches 80% budget in 19 days", status: "Warning" },
  { text: "GPT-5 spend should trigger Marketing ladder", status: "Cost risk" },
  { text: "Support cache can reduce repeated-query spend", status: "Healthy" },
  { text: "Claims capacity needs GPU, not cloud fallback", status: "Warning" }
];

const tabs: Array<{ id: CostTab; label: string }> = [
  { id: "summary", label: "Summary" },
  { id: "forecast", label: "Forecast & Spend" },
  { id: "capacity", label: "GPU Capacity" },
  { id: "safeguards", label: "Savings & Safeguards" }
];

function CompactKpi({ label, value, detail, status, icon }: {
  label: string;
  value: string;
  detail: string;
  status: string;
  icon: ReactNode;
}) {
  const tone = status === "Healthy"
    ? "bg-[rgba(16,185,129,0.10)] text-[var(--status-healthy)]"
    : status === "Critical"
      ? "bg-[rgba(225,29,72,0.10)] text-[var(--status-critical)]"
      : "bg-[rgba(245,158,11,0.12)] text-[var(--status-warning)]";

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-[var(--text-secondary)]">{label}</p>
          <p className="mt-1 whitespace-nowrap text-lg font-semibold text-[var(--text-primary)]">{value}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{detail}</p>
        </div>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${tone}`}>{icon}</span>
      </div>
    </Card>
  );
}

function ForecastCard({ title, value, detail, children }: {
  title: string;
  value: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
        <div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-0.5 text-xs text-[var(--text-secondary)]">{detail}</p></div>
        <p className="text-lg font-semibold">{value}</p>
      </div>
      {children}
    </Card>
  );
}

function ChartLegend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-3 px-4 pt-3 text-[10px] text-[var(--text-secondary)]">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className={`h-0.5 w-5 ${item.dashed ? "border-t-2 border-dashed bg-transparent" : ""}`} style={item.dashed ? { borderColor: item.color } : { backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export default function CostCapacityPage() {
  const { showToast, addAudit } = useAppState();
  const [activeTab, setActiveTab] = useState<CostTab>("summary");

  useEffect(() => {
    function openLinkedSection() {
      if (window.location.hash === "#safeguards") setActiveTab("safeguards");
    }
    openLinkedSection();
    window.addEventListener("hashchange", openLinkedSection);
    return () => window.removeEventListener("hashchange", openLinkedSection);
  }, []);

  function reviewSavings() {
    showToast("Savings actions opened");
    addAudit("Cost and capacity savings reviewed", "Cost & Capacity", "Alert");
    setActiveTab("safeguards");
  }

  return (
    <>
      <PageHeader
        eyebrow="Cost & capacity"
        title="Cost & Capacity"
        description="Forecast spend, budget risk, GPU demand, and savings actions."
        action={<ActionButton onClick={reviewSavings}><PiggyBank size={16} /> Review savings actions</ActionButton>}
      />
      <Section>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <CompactKpi label="Projected spend" value="AED 184,000" detail="+18% month over month" status="Warning" icon={<WalletCards size={16} />} />
          <CompactKpi label="Budget remaining" value="AED 46,000" detail="Before forecast limit" status="Healthy" icon={<PiggyBank size={16} />} />
          <CompactKpi label="Savings opportunity" value="AED 42,000" detail="Monthly forecast" status="Healthy" icon={<SlidersHorizontal size={16} />} />
          <CompactKpi label="GPU assigned" value="100%" detail="24% reclaimable" status="Warning" icon={<Gauge size={16} />} />
          <CompactKpi label="Cost per task" value="AED 0.84" detail="7% lower with cache" status="Healthy" icon={<ArrowRight size={16} />} />
          <CompactKpi label="Forecast risk" value="19 days" detail="To 80% of budget" status="Warning" icon={<Clock3 size={16} />} />
        </div>

        <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-white p-1 shadow-sm lg:sticky lg:top-[57px] lg:z-10">
          <div role="tablist" aria-label="Cost and capacity sections" className="flex min-w-max gap-1">
            {tabs.map((tab) => (
              <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`min-h-9 rounded-md px-3 py-2 text-sm font-medium transition ${activeTab === tab.id ? "bg-[var(--brand-primary)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "summary" ? (
          <div className="mt-3 grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="overflow-hidden border-l-4 border-l-[var(--status-warning)]">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
                <div><h2 className="font-semibold">Budget Forecast</h2><p className="mt-0.5 text-xs text-[var(--text-secondary)]">Actions ordered by expected financial impact.</p></div>
                <StatusBadge value="Warning" />
              </div>
              <div className="grid gap-px bg-[var(--border-subtle)] sm:grid-cols-2">
                {forecastItems.map((item) => (
                  <div key={item.text} className="flex items-start gap-3 bg-white p-3">
                    <AlertTriangle size={15} className={item.status === "Healthy" ? "mt-0.5 shrink-0 text-[var(--status-healthy)]" : "mt-0.5 shrink-0 text-[var(--status-warning)]"} />
                    <div className="min-w-0"><p className="text-sm font-medium">{item.text}</p><StatusBadge value={item.status} /></div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="overflow-hidden bg-[var(--surface-dark)] text-white">
              <div className="border-b border-white/10 px-4 py-3"><p className="text-xs font-semibold uppercase text-cyan-200">Savings Scenario Preview</p><h2 className="mt-1 font-semibold">Review recommended actions</h2></div>
              <div className="grid grid-cols-3 gap-px bg-white/10">
                <div className="bg-[var(--surface-dark)] p-3"><p className="text-[10px] text-slate-400">Current forecast</p><p className="mt-1 text-lg font-semibold">AED 184k</p></div>
                <div className="bg-[var(--surface-dark)] p-3"><p className="text-[10px] text-slate-400">After actions</p><p className="mt-1 text-lg font-semibold">AED 142k</p></div>
                <div className="bg-[var(--surface-dark)] p-3"><p className="text-[10px] text-slate-400">Monthly savings</p><p className="mt-1 text-lg font-semibold text-emerald-300">AED 42k</p></div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex gap-4 text-xs"><span>Quality risk: <strong>Low</strong></span><span>Governance: <strong className="text-emerald-300">Improved</strong></span></div>
                <Link href="/dashboard/recommendations" className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-[var(--brand-primary-dark)]">Open in Recommendations</Link>
              </div>
              <p className="px-4 pb-3 text-[10px] text-slate-400">Recommendations route through approval and audit before policy changes.</p>
            </Card>

            <Card className="p-4 xl:col-span-2">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div><h2 className="font-semibold">Capacity decision</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">Claims needs more local GPU, while Finance has 20% reclaimable capacity.</p></div>
                <div className="flex flex-wrap gap-2"><ActionButton variant="secondary" onClick={() => setActiveTab("capacity")}>Review GPU plan</ActionButton><ActionButton onClick={() => setActiveTab("forecast")}>Inspect forecast</ActionButton><Link href="/dashboard/recommendations" className="inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--brand-primary)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--brand-primary-dark)]">Open recommendation</Link></div>
              </div>
            </Card>
          </div>
        ) : null}

        {activeTab === "forecast" ? (
          <div className="mt-3 grid gap-3 xl:grid-cols-2">
            <ForecastCard title="Burn rate" value="AED 184k" detail="Actual spend and month-end forecast">
              <ChartLegend items={[{ label: "Actual", color: "#5B3DFF" }, { label: "Forecast", color: "#16C7E8", dashed: true }, { label: "Budget", color: "#E11D48", dashed: true }]} />
              <div className="h-48 px-2 py-2"><ForecastLineChart data={burnRate} actualKey="actual" forecastKey="forecast" budget={230} warning={184} /></div>
              <div className="border-t border-[var(--border-subtle)] bg-[rgba(245,158,11,0.06)] px-4 py-2 text-xs font-medium text-[var(--status-warning)]">Current run-rate reaches 80% budget in 19 days.</div>
            </ForecastCard>

            <ForecastCard title="Spend by team" value="Marketing at risk" detail="AED thousands: current, forecast, and budget">
              <ChartLegend items={[{ label: "Current", color: "#5B3DFF" }, { label: "Forecast", color: "#16C7E8" }, { label: "Budget", color: "#CBD5E1" }]} />
              <div className="h-48 px-2 py-2"><ComparisonBarChart data={teamSpend} keys={[{ key: "current", name: "Current", color: "#5B3DFF" }, { key: "forecast", name: "Forecast", color: "#16C7E8", opacity: 0.48 }, { key: "budget", name: "Budget", color: "#CBD5E1", opacity: 0.65 }]} /></div>
              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-2 text-xs"><span className="text-[var(--text-secondary)]">Marketing forecast: AED 31.5k</span><StatusBadge value="Cost risk" /></div>
            </ForecastCard>

            <ForecastCard title="Spend by model" value="GPT-5 leads" detail="AED thousands: current and forecast">
              <div className="grid gap-3 p-3 lg:grid-cols-[0.9fr_1.1fr]">
                <div><ChartLegend items={[{ label: "Current", color: "#5B3DFF" }, { label: "Forecast", color: "#16C7E8" }]} /><div className="h-48"><ComparisonBarChart data={modelSpend} keys={[{ key: "current", name: "Current", color: "#5B3DFF" }, { key: "forecast", name: "Forecast", color: "#16C7E8", opacity: 0.48 }]} /></div></div>
                <div className="divide-y divide-[var(--border-subtle)] rounded-md border border-[var(--border-subtle)]">
                  {modelSpend.map((model) => <div key={model.name} className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-xs"><div><p className="font-semibold">{model.name}</p><p className="mt-0.5 text-[var(--text-secondary)]">{model.action}</p></div><div className="text-right"><p className="font-semibold">{model.current}k to {model.forecast}k</p><StatusBadge value={model.risk} /></div></div>)}
                </div>
              </div>
            </ForecastCard>
          </div>
        ) : null}

        {activeTab === "capacity" ? (
          <div className="mt-3 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
            <ForecastCard title="GPU capacity" value="100% assigned" detail="Assigned, utilized, forecasted, and reclaimable share">
              <ChartLegend items={[{ label: "Assigned", color: "#5B3DFF" }, { label: "Actual", color: "#16C7E8" }, { label: "Forecast", color: "#F59E0B" }, { label: "Reclaimable", color: "#10B981" }]} />
              <div className="h-56 px-2 py-2"><ComparisonBarChart data={gpuCapacity} keys={[{ key: "assigned", name: "Assigned", color: "#5B3DFF" }, { key: "utilization", name: "Actual", color: "#16C7E8" }, { key: "forecast", name: "Forecast demand", color: "#F59E0B", opacity: 0.55 }, { key: "reclaimable", name: "Reclaimable", color: "#10B981", opacity: 0.7 }]} /></div>
              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-2 text-xs"><span className="text-[var(--text-secondary)]">Finance can return 20% reserved GPU.</span><StatusBadge value="Warning" /></div>
            </ForecastCard>
            <Card className="p-4">
              <h2 className="font-semibold">Recommended rebalance</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-md border border-[var(--border-subtle)] p-3"><p className="text-xs text-[var(--text-secondary)]">Reclaim</p><p className="mt-1 font-semibold">20% GPU from Finance</p></div>
                <div className="rounded-md border border-[var(--border-subtle)] p-3"><p className="text-xs text-[var(--text-secondary)]">Allocate</p><p className="mt-1 font-semibold">+15% to Claims Qwen</p></div>
                <div className="rounded-md border border-[var(--border-subtle)] p-3"><p className="text-xs text-[var(--text-secondary)]">Reserve</p><p className="mt-1 font-semibold">5% fleet headroom</p></div>
              </div>
              <ActionButton onClick={() => showToast("GPU rebalance simulation opened")}><SlidersHorizontal size={15} /> Simulate rebalance</ActionButton>
            </Card>
            <Card className="p-4 xl:col-span-2">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div><h2 className="font-semibold">Model Graduation Flywheel</h2><p className="mt-0.5 text-xs text-[var(--text-secondary)]">Moves repeatable cloud spend into governed local capacity.</p></div>
                <div className="grid flex-1 gap-2 sm:grid-cols-4 md:max-w-3xl">
                  {["Cloud exploration", "Usage clustering", "Semantic cache", "Owned local capacity"].map((item, index) => <div key={item} className="flex items-center gap-2 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold"><span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--brand-primary)] text-[10px] text-white">{index + 1}</span>{item}</div>)}
                </div>
              </div>
            </Card>
          </div>
        ) : null}

        {activeTab === "safeguards" ? (
          <div className="mt-3 grid gap-3 xl:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3"><div><h2 className="font-semibold">Savings opportunities</h2><p className="mt-0.5 text-xs text-[var(--text-secondary)]">Forecasted savings with governance checks preserved.</p></div><Link href="/dashboard/recommendations" className="text-xs font-semibold text-[var(--brand-primary)] hover:underline">Open in Recommendations</Link></div>
              <DataTable columns={["Opportunity", "Recommendation", "Impact", "Confidence"]} rows={opportunities.map((row) => [row[0], row[1], row[2], <StatusBadge key="confidence" value={row[3].includes("High") || row[3].includes("Low") ? "Healthy" : "Warning"} />])} />
            </Card>
            <Card className="overflow-hidden">
              <div className="border-b border-[var(--border-subtle)] px-4 py-3"><h2 className="font-semibold">Budget circuit breakers</h2><p className="mt-0.5 text-xs text-[var(--text-secondary)]">Expected policy activation before overspend.</p></div>
              <DataTable columns={["Scope", "Trigger", "Expected activation", "Ladder", "Status"]} rows={circuitBreakers.map((row) => [row[0], row[1], row[2], row[3], <StatusBadge key="status" value={row[4]} />])} />
            </Card>
          </div>
        ) : null}
      </Section>
    </>
  );
}
