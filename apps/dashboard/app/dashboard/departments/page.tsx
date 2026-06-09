"use client";

import { useState } from "react";
import { LockKeyhole, ShieldCheck, SlidersHorizontal, UserRoundCog, Users } from "lucide-react";
import { Card, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { departments, permissionModels } from "@/lib/mock-data";

function formatTokens(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return `${value}`;
}

function usagePercent(used: number, limit: number) {
  return Math.min(100, Math.round((used / limit) * 100));
}

const tabs = [
  { id: "departments", label: "Department limits" },
  { id: "users", label: "Individual limits" },
  { id: "models", label: "Model permissions" }
];

export default function DepartmentsPage() {
  const [activeTab, setActiveTab] = useState("departments");
  const {
    permissions,
    togglePermission,
    departmentTokenBudgets,
    updateDepartmentTokenBudget,
    toggleDepartmentHardLimit,
    userTokenBudgets,
    updateUserTokenBudget
  } = useAppState();

  const totalLimit = Object.values(departmentTokenBudgets).reduce((sum, item) => sum + item.monthlyLimit, 0);
  const totalUsed = Object.values(departmentTokenBudgets).reduce((sum, item) => sum + item.used, 0);

  return (
    <>
      <PageHeader eyebrow="Governance" title="Departments, model access, and token controls" description="Manage who can use which models, how many tokens each department can spend, and individual exceptions from one compact governance workspace." />
      <Section>
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center gap-3"><Users className="text-cyan-700" size={20} /><div><div className="text-sm font-semibold">6 departments</div><div className="text-xs text-slate-500">Mapped to model access</div></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" size={20} /><div><div className="text-sm font-semibold">24 active policies</div><div className="text-xs text-slate-500">Updated instantly in demo state</div></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><LockKeyhole className="text-slate-700" size={20} /><div><div className="text-sm font-semibold">{formatTokens(totalUsed)} / {formatTokens(totalLimit)} tokens</div><div className="text-xs text-slate-500">Monthly governed usage</div></div></div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="font-semibold">Governance controls</h2>
              <p className="mt-1 text-sm text-slate-600">Switch between control surfaces instead of scrolling through every setting.</p>
            </div>
            <div role="tablist" aria-label="Governance control sections" className="grid grid-cols-3 rounded-md border border-slate-200 bg-slate-50 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-9 rounded px-3 text-sm font-medium transition ${activeTab === tab.id ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "departments" ? (
            <div className="p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-cyan-700">Department token controls</p>
                  <h3 className="mt-2 text-lg font-semibold">Set monthly token limits by department</h3>
                  <p className="mt-1 text-sm text-slate-600">Use hard limits for regulated teams and soft limits for teams that need operational flexibility.</p>
                </div>
                <SlidersHorizontal className="text-cyan-700" size={22} />
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {departments.map((department) => {
                  const budget = departmentTokenBudgets[department];
                  const percent = usagePercent(budget.used, budget.monthlyLimit);
                  return (
                    <div key={department} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                        <div>
                          <div className="font-semibold">{department}</div>
                          <div className="mt-1 text-xs text-slate-500">{formatTokens(budget.used)} used of {formatTokens(budget.monthlyLimit)} monthly tokens</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                            Hard limit
                            <button type="button" aria-label={`Toggle hard token limit for ${department}`} onClick={() => toggleDepartmentHardLimit(department)} className={`h-6 w-11 rounded-full p-1 transition ${budget.hardLimit ? "bg-cyan-600" : "bg-slate-300"}`}>
                              <span className={`block h-4 w-4 rounded-full bg-white transition ${budget.hardLimit ? "translate-x-5" : ""}`} />
                            </button>
                          </label>
                          <StatusBadge value={percent >= 85 ? "Warning" : "Healthy"} />
                        </div>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-white">
                        <div className={`h-2 rounded-full ${percent >= 85 ? "bg-amber-500" : "bg-cyan-500"}`} style={{ width: `${percent}%` }} />
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_120px]">
                        <input aria-label={`${department} monthly token limit slider`} type="range" min={500000} max={20000000} step={500000} value={budget.monthlyLimit} onChange={(event) => updateDepartmentTokenBudget(department, Number(event.target.value))} className="w-full accent-cyan-600" />
                        <input aria-label={`${department} monthly token limit`} type="number" min={500000} step={500000} value={budget.monthlyLimit} onChange={(event) => updateDepartmentTokenBudget(department, Number(event.target.value))} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeTab === "users" ? (
            <div className="p-5">
              <div className="mb-5 flex items-start gap-3">
                <UserRoundCog className="mt-1 text-cyan-700" size={22} />
                <div>
                  <p className="text-xs font-semibold uppercase text-cyan-700">Individual controls</p>
                  <h3 className="mt-1 text-lg font-semibold">User token limits</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Fine tune token access for high-usage users without changing the whole department policy.</p>
                </div>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {userTokenBudgets.map((user) => {
                  const percent = usagePercent(user.used, user.monthlyLimit);
                  return (
                    <div key={user.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="mt-1 text-xs text-slate-500">{user.department} / {user.email}</div>
                        </div>
                        <StatusBadge value={user.status} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>{formatTokens(user.used)} used</span>
                        <span>{formatTokens(user.monthlyLimit)} limit</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full ${percent >= 85 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${percent}%` }} />
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_110px]">
                        <input aria-label={`${user.name} monthly token limit slider`} type="range" min={250000} max={3000000} step={50000} value={user.monthlyLimit} onChange={(event) => updateUserTokenBudget(user.id, Number(event.target.value))} className="w-full accent-cyan-600" />
                        <input aria-label={`${user.name} monthly token limit`} type="number" min={250000} step={50000} value={user.monthlyLimit} onChange={(event) => updateUserTokenBudget(user.id, Number(event.target.value))} className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeTab === "models" ? (
            <div>
              <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
                <ShieldCheck size={18} className="text-cyan-700" />
                <div>
                  <div className="font-semibold">Permission matrix</div>
                  <div className="mt-1 text-xs text-slate-500">Toggle department access to individual models.</div>
                </div>
              </div>
              <div className="overflow-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Department</th>
                      {permissionModels.map((model) => <th key={model} className="px-4 py-3">{model}</th>)}
                      <th className="px-4 py-3">Policy state</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departments.map((department) => (
                      <tr key={department}>
                        <td className="px-4 py-4 font-semibold">{department}</td>
                        {permissionModels.map((model) => (
                          <td key={model} className="px-4 py-4">
                            <button type="button" aria-label={`Toggle ${model} access for ${department}`} onClick={() => togglePermission(department, model)} className={`h-6 w-11 rounded-full p-1 transition ${permissions[department][model] ? "bg-cyan-600" : "bg-slate-300"}`}>
                              <span className={`block h-4 w-4 rounded-full bg-white transition ${permissions[department][model] ? "translate-x-5" : ""}`} />
                            </button>
                          </td>
                        ))}
                        <td className="px-4 py-4"><StatusBadge value="Enforced" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </Card>
      </Section>
    </>
  );
}
