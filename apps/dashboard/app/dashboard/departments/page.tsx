"use client";

import { useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  FileCheck2,
  KeyRound,
  MailPlus,
  Plus,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Users
} from "lucide-react";
import { ActionButton, Card, Modal, Section, StatusBadge, useAppState } from "@/components/ui";
import { departments } from "@/lib/mock-data";

const tabs = [
  { id: "overview", label: "Teams Overview" },
  { id: "members", label: "Members" },
  { id: "budgets", label: "Budgets & Limits" },
  { id: "models", label: "Model Access" },
  { id: "knowledge", label: "Knowledge Access" },
  { id: "agents", label: "Agent Access" },
  { id: "evidence", label: "Evidence Gaps" }
] as const;

type TabId = (typeof tabs)[number]["id"];

const teamProfiles = {
  Engineering: {
    users: 64,
    owner: "Maya Rao",
    workspace: "Engineering Copilot",
    models: ["GPT-5", "Claude", "DeepSeek Coder"],
    knowledge: ["Engineering Docs", "Codebase Docs"],
    agents: ["Code Review Agent"],
    budgetUsed: 81,
    risk: "Healthy",
    evidence: "Ready"
  },
  Legal: {
    users: 18,
    owner: "Leena Shah",
    workspace: "Legal AI Assistant",
    models: ["Claude", "Qwen 32B"],
    knowledge: ["Legal Contracts", "Compliance Policies"],
    agents: ["Contract Review Agent"],
    budgetUsed: 62,
    risk: "Governance risk",
    evidence: "2 gaps"
  },
  Claims: {
    users: 72,
    owner: "Farah Ali",
    workspace: "Claims AI Assistant",
    models: ["Qwen 32B", "Llama 3.1 8B"],
    knowledge: ["Claims SOPs", "Policy Documents"],
    agents: ["Claims Summary Agent"],
    budgetUsed: 73,
    risk: "Warning",
    evidence: "1 gap"
  },
  Finance: {
    users: 22,
    owner: "Daniel Cruz",
    workspace: "Finance AI Desk",
    models: ["Qwen 32B", "Claude"],
    knowledge: ["Finance Policies"],
    agents: ["Finance Analysis Agent"],
    budgetUsed: 40,
    risk: "Warning",
    evidence: "1 gap"
  },
  "Customer Support": {
    users: 38,
    owner: "Nadia Basu",
    workspace: "Support Desk",
    models: ["Gemini", "Llama 3.1 8B"],
    knowledge: ["Product FAQ"],
    agents: ["Support Triage Agent"],
    budgetUsed: 58,
    risk: "Healthy",
    evidence: "Ready"
  },
  Marketing: {
    users: 16,
    owner: "Yusuf Malik",
    workspace: "Marketing Studio",
    models: ["Gemini", "GPT-5"],
    knowledge: ["Brand Library", "Product FAQ"],
    agents: ["Drafting Assistant"],
    budgetUsed: 92,
    risk: "Cost risk",
    evidence: "1 gap"
  }
} as const;

const initialTeamMembers: Record<string, string[]> = {
  Engineering: ["maya@acme.ai", "omar@acme.ai", "devops@acme.ai"],
  Legal: ["leena@acme.ai", "contracts@acme.ai"],
  Claims: ["farah@acme.ai", "claims.ops@acme.ai"],
  Finance: ["daniel@acme.ai"],
  "Customer Support": ["nadia@acme.ai", "support.lead@acme.ai"],
  Marketing: ["yusuf@acme.ai"]
};

const knowledgeBases = ["Legal Contracts", "Claims SOPs", "Finance Policies", "Product FAQ", "Engineering Docs"];
const governedAgents = ["Claims Summary Agent", "Contract Review Agent", "Support Triage Agent", "Code Review Agent", "Finance Analysis Agent"];

const initialKnowledgeAccess: Record<string, Record<string, boolean>> = Object.fromEntries(
  departments.map((team) => [
    team,
    Object.fromEntries(knowledgeBases.map((knowledge) => [
      knowledge,
      (teamProfiles[team as keyof typeof teamProfiles].knowledge as readonly string[]).includes(knowledge)
    ]))
  ])
);

const initialAgentAccess: Record<string, Record<string, boolean>> = Object.fromEntries(
  departments.map((team) => [
    team,
    Object.fromEntries(governedAgents.map((agent) => [
      agent,
      (teamProfiles[team as keyof typeof teamProfiles].agents as readonly string[]).includes(agent)
    ]))
  ])
);

const evidenceGaps = [
  { team: "Legal", gap: "Risk assessment pending", owner: "Leena Shah", due: "Jun 18", severity: "High" },
  { team: "Legal", gap: "Policy acceptance pending", owner: "Governance", due: "Jun 20", severity: "Medium" },
  { team: "Claims", gap: "Training/change task open", owner: "Farah Ali", due: "Jun 16", severity: "Medium" },
  { team: "Finance", gap: "Human approval missing", owner: "Daniel Cruz", due: "Jun 14", severity: "High" },
  { team: "Marketing", gap: "Evidence owner missing", owner: "Unassigned", due: "Jun 13", severity: "High" }
];

function formatTokens(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return `${value}`;
}

function usagePercent(used: number, limit: number) {
  return Math.min(100, Math.round((used / limit) * 100));
}

function Toggle({ enabled, label, onToggle }: { enabled: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={enabled}
      onClick={onToggle}
      className={`h-6 w-11 rounded-full p-1 transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${
        enabled ? "bg-[var(--brand-primary)]" : "bg-slate-300"
      }`}
    >
      <span className={`block h-4 w-4 rounded-full bg-white transition ${enabled ? "translate-x-5" : ""}`} />
    </button>
  );
}

function AccessMatrix({ title, description, columns, values, onToggle }: {
  title: string;
  description: string;
  columns: string[];
  values: Record<string, Record<string, boolean>>;
  onToggle: (team: string, column: string) => void;
}) {
  return (
    <div>
      <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] px-5 py-4">
        <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">{description}</p>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-[var(--border-subtle)] text-xs uppercase text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3">Team</th>
              {columns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}
              <th className="px-4 py-3">Policy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {departments.map((team) => (
              <tr key={team} className="hover:bg-[var(--surface-muted)]">
                <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-[var(--text-primary)]">{team}</td>
                {columns.map((column) => (
                  <td key={column} className="px-4 py-3.5">
                    <Toggle enabled={Boolean(values[team]?.[column])} label={`Toggle ${column} access for ${team}`} onToggle={() => onToggle(team, column)} />
                  </td>
                ))}
                <td className="px-4 py-3.5"><StatusBadge value="Enforced" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormSelect({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-xs font-medium text-[var(--text-secondary)]">
      {label}
      <select className="mt-1.5 block h-10 w-full rounded-md border border-[var(--border-subtle)] bg-white px-3 text-sm text-[var(--text-primary)]">
        {children}
      </select>
    </label>
  );
}

export default function DepartmentsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberTeam, setMemberTeam] = useState("Legal");
  const [memberRole, setMemberRole] = useState("Member");
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [knowledgeAccess, setKnowledgeAccess] = useState(initialKnowledgeAccess);
  const [agentAccess, setAgentAccess] = useState(initialAgentAccess);
  const {
    permissions,
    togglePermission,
    departmentTokenBudgets,
    updateDepartmentTokenBudget,
    toggleDepartmentHardLimit,
    userTokenBudgets,
    updateUserTokenBudget,
    showToast,
    addAudit,
    modelCatalog
  } = useAppState();

  const permissionModels = modelCatalog
    .filter((model) => model.status === "Running" || model.status === "Connected")
    .map((model) => model.name);

  function inviteMember() {
    const email = memberEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      showToast("Enter a valid email address");
      return;
    }
    setTeamMembers((current) => ({
      ...current,
      [memberTeam]: current[memberTeam].includes(email) ? current[memberTeam] : [...current[memberTeam], email]
    }));
    showToast(`${email} invited to ${memberTeam}`);
    addAudit("Team member invited", `${email} -> ${memberTeam} (${memberRole})`, "Permission");
    setMemberEmail("");
    setInviteOpen(false);
  }

  function removeMember(team: string, email: string) {
    setTeamMembers((current) => ({ ...current, [team]: current[team].filter((item) => item !== email) }));
    showToast(`${email} removed from ${team}`);
    addAudit("Team member removed", `${email} -> ${team}`, "Permission");
  }

  function createTeam() {
    showToast("Team created in mock state");
    addAudit("Team created", "New team", "Permission");
    setCreateOpen(false);
  }

  function toggleLocalAccess(
    setter: Dispatch<SetStateAction<Record<string, Record<string, boolean>>>>,
    type: string,
    team: string,
    item: string
  ) {
    setter((current) => ({
      ...current,
      [team]: { ...current[team], [item]: !current[team][item] }
    }));
    showToast(`${item} access updated for ${team}`);
    addAudit(`${type} access changed`, `${team} / ${item}`, "Permission");
  }

  return (
    <>
      <Section>
        <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--brand-primary)]">Govern</p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Teams</h1>
            <p className="mt-1 max-w-4xl text-sm text-[var(--text-secondary)]">
              Create teams, invite users, assign AI workspaces, and control each team&apos;s models, knowledge, agents, budgets, token limits, and governance evidence.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton variant="secondary" onClick={() => setInviteOpen(true)}><MailPlus size={15} /> Invite User</ActionButton>
            <ActionButton onClick={() => setCreateOpen(true)}><Plus size={15} /> Create Team</ActionButton>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {[
            { label: "Teams", value: "6", detail: "Governed groups", icon: <Users size={16} />, tone: "brand" },
            { label: "Users", value: "230", detail: "Across all teams", icon: <MailPlus size={16} />, tone: "brand" },
            { label: "Active policies", value: "24", detail: "Applied consistently", icon: <ShieldCheck size={16} />, tone: "healthy" },
            { label: "Governed tokens", value: "30.6M / 51M", detail: "Monthly usage", icon: <KeyRound size={16} />, tone: "brand" },
            { label: "Evidence gaps", value: "3", detail: "Priority gaps", icon: <FileCheck2 size={16} />, tone: "warning" },
            { label: "Teams at risk", value: "2", detail: "Governance or cost", icon: <ShieldAlert size={16} />, tone: "critical" }
          ].map((metric) => {
            const tone = metric.tone === "healthy"
              ? "bg-[rgba(16,185,129,0.10)] text-[var(--status-healthy)]"
              : metric.tone === "warning"
                ? "bg-[rgba(245,158,11,0.12)] text-[var(--status-warning)]"
                : metric.tone === "critical"
                  ? "bg-[rgba(225,29,72,0.10)] text-[var(--status-critical)]"
                  : "bg-[rgba(91,61,255,0.10)] text-[var(--brand-primary)]";
            return (
              <Card key={metric.label} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--text-secondary)]">{metric.label}</p>
                    <p className="mt-1 whitespace-nowrap text-lg font-semibold text-[var(--text-primary)]">{metric.value}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{metric.detail}</p>
                  </div>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${tone}`}>{metric.icon}</span>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1.5">
            <div role="tablist" aria-label="Team governance sections" className="flex min-w-max gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-md px-3 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] ${
                    activeTab === tab.id
                      ? "bg-[var(--brand-primary)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-white hover:text-[var(--text-primary)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" ? (
            <div className="grid gap-3 p-4 lg:grid-cols-2 2xl:grid-cols-3">
              {departments.map((team) => {
                const profile = teamProfiles[team as keyof typeof teamProfiles];
                return (
                  <div key={team} className="rounded-lg border border-[var(--border-subtle)] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-[var(--text-primary)]">{team}</h2>
                        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{profile.users} users · Owner: {profile.owner}</p>
                      </div>
                      <StatusBadge value={profile.risk} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div><span className="text-[var(--text-secondary)]">Workspace</span><p className="mt-0.5 font-semibold text-[var(--text-primary)]">{profile.workspace}</p></div>
                      <div><span className="text-[var(--text-secondary)]">Evidence</span><p className="mt-0.5 font-semibold text-[var(--text-primary)]">{profile.evidence}</p></div>
                      <div className="col-span-2"><span className="text-[var(--text-secondary)]">Models</span><p className="mt-0.5 text-[var(--text-primary)]">{profile.models.join(", ")}</p></div>
                      <div><span className="text-[var(--text-secondary)]">Knowledge</span><p className="mt-0.5 text-[var(--text-primary)]">{profile.knowledge.join(", ")}</p></div>
                      <div><span className="text-[var(--text-secondary)]">Agents</span><p className="mt-0.5 text-[var(--text-primary)]">{profile.agents.join(", ")}</p></div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-[var(--text-secondary)]"><span>Budget/token usage</span><strong className="text-[var(--text-primary)]">{profile.budgetUsed}%</strong></div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                        <div className={`h-full rounded-full ${profile.budgetUsed >= 85 ? "bg-[var(--status-warning)]" : "bg-[var(--brand-primary)]"}`} style={{ width: `${profile.budgetUsed}%` }} />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button type="button" onClick={() => setActiveTab("budgets")} className="rounded-md bg-[var(--brand-primary)] px-3 py-2 text-xs font-semibold text-white">Manage</button>
                      <button type="button" onClick={() => setActiveTab("models")} className="rounded-md border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-muted)]">View access</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {activeTab === "members" ? (
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">Team members</h3>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Users inherit workspace, model, knowledge, agent, routing, and budget policies from their team.</p>
                </div>
                <ActionButton onClick={() => setInviteOpen(true)}><MailPlus size={15} /> Invite User</ActionButton>
              </div>
              <div className="overflow-auto rounded-md border border-[var(--border-subtle)]">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-secondary)]">
                    <tr><th className="px-4 py-3">Team</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Members</th><th className="px-4 py-3">Inherited workspace</th><th className="px-4 py-3">Policy</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {departments.map((team) => {
                      const profile = teamProfiles[team as keyof typeof teamProfiles];
                      return (
                        <tr key={team}>
                          <td className="px-4 py-3.5 font-semibold">{team}</td>
                          <td className="px-4 py-3.5 text-[var(--text-secondary)]">{profile.owner}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex max-w-md flex-wrap gap-1.5">
                              {teamMembers[team].map((email) => (
                                <button key={email} type="button" title="Remove member" onClick={() => removeMember(team, email)} className="rounded-full border border-[var(--border-subtle)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">{email}</button>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[var(--text-secondary)]">{profile.workspace}</td>
                          <td className="px-4 py-3.5"><StatusBadge value="Enforced" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeTab === "budgets" ? (
            <div className="p-4">
              <div className="mb-4 flex items-center gap-3">
                <SlidersHorizontal size={18} className="text-[var(--brand-primary)]" />
                <div><h3 className="font-semibold text-[var(--text-primary)]">Team limits</h3><p className="mt-0.5 text-xs text-[var(--text-secondary)]">Set team-level monthly limits, then refine individual allowances where needed.</p></div>
              </div>
              <div className="grid gap-3 xl:grid-cols-2">
                {departments.map((team) => {
                  const budget = departmentTokenBudgets[team];
                  const percent = usagePercent(budget.used, budget.monthlyLimit);
                  return (
                    <div key={team} className="rounded-md border border-[var(--border-subtle)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div><p className="font-semibold">{team}</p><p className="mt-0.5 text-xs text-[var(--text-secondary)]">{formatTokens(budget.used)} of {formatTokens(budget.monthlyLimit)} tokens</p></div>
                        <div className="flex items-center gap-2"><span className="text-xs text-[var(--text-secondary)]">Hard limit</span><Toggle enabled={budget.hardLimit} label={`Toggle hard limit for ${team}`} onToggle={() => toggleDepartmentHardLimit(team)} /></div>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-[var(--surface-muted)]"><div className={`h-full rounded-full ${percent >= 85 ? "bg-[var(--status-warning)]" : "bg-[var(--brand-primary)]"}`} style={{ width: `${percent}%` }} /></div>
                      <div className="mt-3 grid grid-cols-[1fr_120px] gap-3">
                        <input aria-label={`${team} monthly token limit slider`} type="range" min={500000} max={20000000} step={500000} value={budget.monthlyLimit} onChange={(event) => updateDepartmentTokenBudget(team, Number(event.target.value))} className="accent-[var(--brand-primary)]" />
                        <input aria-label={`${team} monthly token limit`} type="number" min={500000} step={500000} value={budget.monthlyLimit} onChange={(event) => updateDepartmentTokenBudget(team, Number(event.target.value))} className="h-9 rounded-md border border-[var(--border-subtle)] px-2 text-sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
              <h3 className="mb-3 mt-6 font-semibold text-[var(--text-primary)]">Individual limits</h3>
              <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                {userTokenBudgets.map((user) => (
                  <div key={user.id} className="rounded-md border border-[var(--border-subtle)] p-3">
                    <div className="flex justify-between gap-2"><div><p className="text-sm font-semibold">{user.name}</p><p className="text-xs text-[var(--text-secondary)]">{user.department}</p></div><StatusBadge value={user.status} /></div>
                    <div className="mt-3 flex items-center gap-2">
                      <input aria-label={`${user.name} token limit`} type="range" min={250000} max={3000000} step={50000} value={user.monthlyLimit} onChange={(event) => updateUserTokenBudget(user.id, Number(event.target.value))} className="min-w-0 flex-1 accent-[var(--brand-primary)]" />
                      <span className="text-xs font-semibold">{formatTokens(user.monthlyLimit)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "models" ? (
            <div>
              <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] px-5 py-4">
                <h3 className="font-semibold text-[var(--text-primary)]">Model access matrix</h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Changes here control which models each team can use across assigned workspaces, agents, and API routes.</p>
                <p className="mt-1 text-xs font-medium text-[var(--brand-primary-dark)]">External model access may still be restricted by routing, sovereignty, or prompt firewall policies.</p>
              </div>
              <div className="overflow-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-[var(--border-subtle)] text-xs uppercase text-[var(--text-secondary)]"><tr><th className="px-4 py-3">Team</th>{permissionModels.map((model) => <th key={model} className="px-4 py-3">{model}</th>)}<th className="px-4 py-3">Policy</th></tr></thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {departments.map((team) => (
                      <tr key={team} className="hover:bg-[var(--surface-muted)]">
                        <td className="px-4 py-3.5 font-semibold">{team}</td>
                        {permissionModels.map((model) => <td key={model} className="px-4 py-3.5"><Toggle enabled={Boolean(permissions[team]?.[model])} label={`Toggle ${model} access for ${team}`} onToggle={() => togglePermission(team, model)} /></td>)}
                        <td className="px-4 py-3.5"><StatusBadge value="Enforced" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeTab === "knowledge" ? (
            <AccessMatrix title="Knowledge access matrix" description="Authorized knowledge is enforced across assigned workspaces, agents, APIs, and retrieval flows." columns={knowledgeBases} values={knowledgeAccess} onToggle={(team, item) => toggleLocalAccess(setKnowledgeAccess, "Knowledge", team, item)} />
          ) : null}

          {activeTab === "agents" ? (
            <AccessMatrix title="Agent access matrix" description="Assign governed AI workers to teams while preserving their model, tool, approval, and budget policies." columns={governedAgents} values={agentAccess} onToggle={(team, item) => toggleLocalAccess(setAgentAccess, "Agent", team, item)} />
          ) : null}

          {activeTab === "evidence" ? (
            <div className="p-4">
              <div className="mb-3 flex items-start gap-3">
                <FileCheck2 size={18} className="mt-0.5 text-[var(--brand-primary)]" />
                <div><h3 className="font-semibold text-[var(--text-primary)]">Team evidence gaps</h3><p className="mt-0.5 text-xs text-[var(--text-secondary)]">ISO/IEC 42001 readiness support signals only. This does not represent or guarantee certification.</p></div>
              </div>
              <div className="overflow-auto rounded-md border border-[var(--border-subtle)]">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-secondary)]"><tr><th className="px-4 py-3">Team</th><th className="px-4 py-3">Readiness gap</th><th className="px-4 py-3">Evidence owner</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Action</th></tr></thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {evidenceGaps.map((gap) => <tr key={`${gap.team}-${gap.gap}`}><td className="px-4 py-3.5 font-semibold">{gap.team}</td><td className="px-4 py-3.5">{gap.gap}</td><td className="px-4 py-3.5 text-[var(--text-secondary)]">{gap.owner}</td><td className="px-4 py-3.5 text-[var(--text-secondary)]">{gap.due}</td><td className="px-4 py-3.5"><StatusBadge value={gap.severity} /></td><td className="px-4 py-3.5"><button type="button" onClick={() => { showToast(`${gap.gap} opened`); addAudit("Evidence gap reviewed", `${gap.team} / ${gap.gap}`, "Compliance"); }} className="text-xs font-semibold text-[var(--brand-primary)]">Review</button></td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </Card>
      </Section>

      {inviteOpen ? (
        <Modal title="Invite User" onClose={() => setInviteOpen(false)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2 text-xs font-medium text-[var(--text-secondary)]">Email
              <input value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} placeholder="name@company.com" className="mt-1.5 h-10 w-full rounded-md border border-[var(--border-subtle)] px-3 text-sm" />
            </label>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Team
              <select value={memberTeam} onChange={(event) => setMemberTeam(event.target.value)} className="mt-1.5 block h-10 w-full rounded-md border border-[var(--border-subtle)] bg-white px-3 text-sm">{departments.map((team) => <option key={team}>{team}</option>)}</select>
            </label>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Role
              <select value={memberRole} onChange={(event) => setMemberRole(event.target.value)} className="mt-1.5 block h-10 w-full rounded-md border border-[var(--border-subtle)] bg-white px-3 text-sm"><option>Member</option><option>Team Admin</option><option>Viewer</option></select>
            </label>
          </div>
          <div className="mt-4 rounded-md bg-[var(--surface-muted)] p-3 text-xs leading-5 text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">Inherited access:</strong> {teamProfiles[memberTeam as keyof typeof teamProfiles].workspace}; {teamProfiles[memberTeam as keyof typeof teamProfiles].models.join(", ")}; {teamProfiles[memberTeam as keyof typeof teamProfiles].knowledge.join(", ")}.
          </div>
          <div className="mt-5 flex justify-end gap-2"><ActionButton variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</ActionButton><ActionButton onClick={inviteMember}><MailPlus size={15} /> Invite User</ActionButton></div>
        </Modal>
      ) : null}

      {createOpen ? (
        <Modal title="Create Team" onClose={() => setCreateOpen(false)}>
          <div className="grid max-h-[68vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Team name<input placeholder="e.g. Risk Operations" className="mt-1.5 h-10 w-full rounded-md border border-[var(--border-subtle)] px-3 text-sm" /></label>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Owner<input placeholder="owner@company.com" className="mt-1.5 h-10 w-full rounded-md border border-[var(--border-subtle)] px-3 text-sm" /></label>
            <label className="sm:col-span-2 text-xs font-medium text-[var(--text-secondary)]">Description<textarea rows={2} placeholder="Team purpose and governed AI use cases" className="mt-1.5 w-full rounded-md border border-[var(--border-subtle)] p-3 text-sm" /></label>
            <FormSelect label="Default workspace"><><option>None</option><option>Legal AI Assistant</option><option>Claims AI Assistant</option><option>Engineering Copilot</option><option>Finance AI Desk</option></></FormSelect>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Add users by email<input placeholder="user1@acme.ai, user2@acme.ai" className="mt-1.5 h-10 w-full rounded-md border border-[var(--border-subtle)] px-3 text-sm" /></label>
            <FormSelect label="Allowed models"><><option>Qwen 32B, Claude</option><option>Local models only</option><option>All connected models</option></></FormSelect>
            <FormSelect label="Allowed knowledge bases"><><option>None</option><option>Team-authorized sources</option><option>Selected sources</option></></FormSelect>
            <FormSelect label="Allowed agents"><><option>None</option><option>Selected governed agents</option></></FormSelect>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Monthly token budget<input type="number" defaultValue={2000000} className="mt-1.5 h-10 w-full rounded-md border border-[var(--border-subtle)] px-3 text-sm" /></label>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Monthly spend budget (AED)<input type="number" defaultValue={10000} className="mt-1.5 h-10 w-full rounded-md border border-[var(--border-subtle)] px-3 text-sm" /></label>
            <FormSelect label="External model rule"><><option>Allowed by routing policy</option><option>Approval required</option><option>Blocked</option></></FormSelect>
            <FormSelect label="Human approval requirement"><><option>Not required</option><option>High-risk outputs only</option><option>All agent decisions</option></></FormSelect>
            <label className="sm:col-span-2 text-xs font-medium text-[var(--text-secondary)]">ISO/evidence owner<input placeholder="governance.owner@company.com" className="mt-1.5 h-10 w-full rounded-md border border-[var(--border-subtle)] px-3 text-sm" /></label>
          </div>
          <div className="mt-5 flex justify-end gap-2"><ActionButton variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</ActionButton><ActionButton onClick={createTeam}><Plus size={15} /> Create Team</ActionButton></div>
        </Modal>
      ) : null}
    </>
  );
}
