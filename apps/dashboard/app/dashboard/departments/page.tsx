"use client";

import { useState } from "react";
import { LockKeyhole, MailPlus, ShieldCheck, SlidersHorizontal, UserRoundCog, Users } from "lucide-react";
import { ActionButton, Card, DataTable, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
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
  { id: "members", label: "Team members" },
  { id: "departments", label: "Department limits" },
  { id: "users", label: "Individual limits" },
  { id: "models", label: "Model permissions" }
];

const initialTeamMembers: Record<string, string[]> = {
  Engineering: ["maya@acme.ai", "omar@acme.ai", "devops@acme.ai"],
  Legal: ["leena@acme.ai", "contracts@acme.ai"],
  Claims: ["farah@acme.ai", "claims.ops@acme.ai"],
  Finance: ["daniel@acme.ai"],
  "Customer Support": ["nadia@acme.ai", "support.lead@acme.ai"],
  Marketing: ["yusuf@acme.ai"]
};

const teamPolicySummary: Record<string, { workspace: string; knowledge: string; agents: string; rule: string }> = {
  Engineering: { workspace: "Engineering Copilot", knowledge: "Engineering Docs", agents: "Code Review Agent", rule: "GPT-5, Claude, DeepSeek Coder" },
  Legal: { workspace: "Legal AI Assistant", knowledge: "Legal Contracts", agents: "Contract Review Agent", rule: "Claude and Qwen Local, restricted external use" },
  Claims: { workspace: "Claims AI Assistant", knowledge: "Claims SOPs", agents: "Claims Summary Agent", rule: "External models blocked" },
  Finance: { workspace: "Finance AI Desk", knowledge: "Finance Policies", agents: "Finance Analysis Agent", rule: "Local-first, Claude approval required" },
  "Customer Support": { workspace: "Support Desk", knowledge: "Product FAQ", agents: "Support Triage Agent", rule: "Gemini and Llama Local" },
  Marketing: { workspace: "Marketing Studio", knowledge: "Brand and Product FAQ", agents: "Drafting Assistant", rule: "Gemini first, GPT-5 capped" }
};

export default function DepartmentsPage() {
  const [activeTab, setActiveTab] = useState("members");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberDepartment, setMemberDepartment] = useState("Legal");
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const {
    permissions,
    togglePermission,
    departmentTokenBudgets,
    updateDepartmentTokenBudget,
    toggleDepartmentHardLimit,
    userTokenBudgets,
    updateUserTokenBudget,
    showToast,
    addAudit
  } = useAppState();

  const totalLimit = Object.values(departmentTokenBudgets).reduce((sum, item) => sum + item.monthlyLimit, 0);
  const totalUsed = Object.values(departmentTokenBudgets).reduce((sum, item) => sum + item.used, 0);
  const totalMembers = Object.values(teamMembers).reduce((sum, items) => sum + items.length, 0);

  function addMember() {
    const email = memberEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      showToast("Enter a valid email address");
      return;
    }

    setTeamMembers((current) => ({
      ...current,
      [memberDepartment]: current[memberDepartment].includes(email) ? current[memberDepartment] : [...current[memberDepartment], email]
    }));
    setMemberEmail("");
    showToast(`${email} added to ${memberDepartment}`);
    addAudit("Department member added", `${email} -> ${memberDepartment}`, "Permission");
  }

  function removeMember(department: string, email: string) {
    setTeamMembers((current) => ({
      ...current,
      [department]: current[department].filter((item) => item !== email)
    }));
    showToast(`${email} removed from ${department}`);
    addAudit("Department member removed", `${email} -> ${department}`, "Permission");
  }

  return (
    <>
      <PageHeader eyebrow="Governance" title="Teams and departments" description="Add users by email, assign them to departments, and control each team's models, knowledge, workspaces, agents, and token limits." />
      <Section>
        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center gap-3"><Users className="text-cyan-700" size={20} /><div><div className="text-sm font-semibold">{departments.length} departments</div><div className="text-xs text-slate-500">Mapped to workspaces</div></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><MailPlus className="text-indigo-600" size={20} /><div><div className="text-sm font-semibold">{totalMembers} users</div><div className="text-xs text-slate-500">Assigned by email</div></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" size={20} /><div><div className="text-sm font-semibold">24 active policies</div><div className="text-xs text-slate-500">Access enforced in mock state</div></div></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3"><LockKeyhole className="text-slate-700" size={20} /><div><div className="text-sm font-semibold">{formatTokens(totalUsed)} / {formatTokens(totalLimit)}</div><div className="text-xs text-slate-500">Monthly governed tokens</div></div></div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="font-semibold">Team control center</h2>
              <p className="mt-1 text-sm text-slate-600">Add people, then immediately review access, budgets, and model permissions.</p>
            </div>
            <div role="tablist" aria-label="Team governance sections" className="grid grid-cols-2 gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 md:grid-cols-4">
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

          {activeTab === "members" ? (
            <div className="grid gap-5 p-5 xl:grid-cols-[380px_1fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700"><MailPlus size={15} /> Add team member</div>
                <h3 className="mt-2 text-lg font-semibold">Invite by email</h3>
                <div className="mt-4 space-y-3">
                  <label className="text-sm font-medium text-slate-600">Email
                    <input value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} placeholder="name@company.com" className="mt-2 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm" />
                  </label>
                  <label className="text-sm font-medium text-slate-600">Department
                    <select value={memberDepartment} onChange={(event) => setMemberDepartment(event.target.value)} className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                      {departments.map((department) => <option key={department}>{department}</option>)}
                    </select>
                  </label>
                  <ActionButton onClick={addMember}><MailPlus size={14} /> Add user</ActionButton>
                </div>
                <div className="mt-5 rounded-md border border-cyan-100 bg-cyan-50 p-3 text-sm leading-6 text-cyan-950">
                  Users inherit access from their department, workspace, model policy, knowledge bases, assigned agents, and token limits.
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <DataTable
                  columns={["Department", "Users", "Workspace", "Knowledge access", "Agents", "Policy"]}
                  rows={departments.map((department) => [
                    <span key="department" className="font-semibold">{department}</span>,
                    <div key="users" className="flex max-w-sm flex-wrap gap-2">
                      {teamMembers[department].map((email) => (
                        <button key={email} onClick={() => removeMember(department, email)} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-red-50 hover:text-red-700" title="Click to remove">
                          {email}
                        </button>
                      ))}
                    </div>,
                    teamPolicySummary[department].workspace,
                    teamPolicySummary[department].knowledge,
                    teamPolicySummary[department].agents,
                    <div key="policy" className="space-y-1"><StatusBadge value="Enforced" /><div className="text-xs text-slate-500">{teamPolicySummary[department].rule}</div></div>
                  ])}
                />
              </div>
            </div>
          ) : null}

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
