"use client";

import { ArrowRight, Gauge, PiggyBank, SlidersHorizontal, WalletCards } from "lucide-react";
import { BarMetricChart, DonutChart } from "@/components/charts";
import { ActionButton, Card, ChartCard, DataTable, MetricCard, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { costByModel, requestsByDepartment, requestVolume } from "@/lib/mock-data";

const opportunities = [
  ["Support graduation", "Move 61% support traffic to Qwen 32B", "AED 35,000/mo", "High confidence"],
  ["Marketing cost ladder", "Route drafting to Gemini before GPT-5", "AED 18,000/mo", "Medium risk"],
  ["Semantic cache", "Cache duplicate support queries with permission checks", "AED 11,400/mo", "Low risk"],
  ["Finance capacity reclaim", "Reduce reserved local GPU from 30% to 10%", "20% GPU freed", "Low risk"]
];

const circuitBreakers = [
  ["Marketing", "80% budget used", "Cache -> cheaper model -> approval -> hard stop", "Armed"],
  ["Legal", "Confidential KB detected", "Local Qwen only -> no external fallback", "Enforced"],
  ["Claims", "Queue wait rising", "Local capacity -> replica -> no cloud fallback", "Warning"],
  ["Engineering", "Provider degraded", "DeepSeek Coder -> Claude -> GPT-5", "Active"]
];

export default function CostCapacityPage() {
  const { showToast, addAudit } = useAppState();

  function reviewSavings() {
    showToast("Savings review opened");
    addAudit("Cost and capacity savings reviewed", "Cost & Capacity", "Alert");
  }

  return (
    <>
      <PageHeader
        eyebrow="Cost & capacity"
        title="Cost & Capacity"
        description="Track cloud spend, local GPU allocation, budget remaining, graceful degradation ladders, and the workloads ready to graduate into owned AI infrastructure."
        action={<ActionButton onClick={reviewSavings}><PiggyBank size={16} /> Review graduation savings</ActionButton>}
      />
      <Section>
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Projected monthly spend" value="AED 184,000" trend="+18% MoM" detail="Marketing and GPT-5 are drivers" status="Warning" icon={<WalletCards size={18} />} />
          <MetricCard label="Budget remaining" value="AED 46,000" detail="At current burn rate" status="Healthy" icon={<PiggyBank size={18} />} />
          <MetricCard label="Savings opportunity" value="AED 42,000" detail="Routing, cache, graduation" status="Healthy" icon={<SlidersHorizontal size={18} />} />
          <MetricCard label="GPU capacity assigned" value="100%" detail="Reclaim before adding load" status="Warning" icon={<Gauge size={18} />} />
          <MetricCard label="Cost per successful task" value="AED 0.84" trend="-7%" detail="After cache simulation" status="Healthy" icon={<ArrowRight size={18} />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Spend by model" detail="Estimated monthly cost"><DonutChart data={costByModel} /></ChartCard>
          <ChartCard title="Spend by department" detail="Usage share proxy"><BarMetricChart data={requestsByDepartment} dataKey="value" /></ChartCard>
          <ChartCard title="Burn rate" detail="Mock weekly cost trend"><BarMetricChart data={requestVolume} dataKey="cost" /></ChartCard>
          <Card className="p-5">
            <h2 className="font-semibold">Budget forecast</h2>
            <div className="mt-5 space-y-4">
              {["Current run-rate reaches 80% budget in 19 days", "GPT-5 spend should trigger Marketing ladder", "Support cache can reduce repeated-query spend", "Claims capacity needs GPU, not cloud fallback"].map((item) => (
                <div key={item} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm">{item}</div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="mt-6 p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="font-semibold">Model Graduation Flywheel</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Spend is treated as a learning signal: identify repeatable traffic, cache safe answers, move stable work to local models, then reserve premium providers for high-value tasks.</p>
            </div>
            <StatusBadge value="Healthy" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {["Cloud exploration", "Usage clustering", "Semantic cache", "Owned local capacity"].map((item) => (
              <div key={item} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold">{item}</div>
            ))}
          </div>
        </Card>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="overflow-hidden">
            <div className="border-b border-[var(--border-subtle)] px-5 py-4">
              <h2 className="font-semibold">Savings opportunities</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Mock recommendations for reducing spend without removing governance.</p>
            </div>
            <DataTable
              columns={["Opportunity", "Recommendation", "Impact", "Confidence"]}
              rows={opportunities.map((row) => [row[0], row[1], row[2], <StatusBadge key="confidence" value={row[3].includes("High") || row[3].includes("Low") ? "Healthy" : "Warning"} />])}
            />
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-[var(--border-subtle)] px-5 py-4">
              <h2 className="font-semibold">Budget circuit breakers</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Graceful degradation ladders by team or policy.</p>
            </div>
            <DataTable
              columns={["Scope", "Trigger", "Ladder", "Status"]}
              rows={circuitBreakers.map((row) => [row[0], row[1], row[2], <StatusBadge key="status" value={row[3]} />])}
            />
          </Card>
        </div>
      </Section>
    </>
  );
}
