# Switchboard AI Product Feature Inventory

This document describes what is currently present in the Switchboard AI dashboard mockup. It is written so it can be pasted into ChatGPT or another reviewer to analyze the product, feature coverage, UX structure, and missing gaps.

## Product Summary

Switchboard AI is an enterprise AI control plane. It helps organizations control:

- where AI runs: cloud providers, private GPU servers, local model runtimes, and governed workspaces
- who can use AI: teams, users, role-aware actions, approval permissions, and inherited access
- what data AI can access: knowledge bases, restricted documents, source sync, workspace assignment, and authorization boundaries
- what AI costs: spend forecast, model cost, department budgets, savings recommendations, and capacity planning
- how AI actions are governed: approval inbox, audit logs, incident response, routing policies, ISO/IEC 42001 readiness support, and evidence tracking

The main product loop is:

Observe -> Detect -> Recommend -> Simulate -> Approve -> Apply -> Audit -> Optimize

## Global App Structure

### App Shell

The dashboard has a persistent left sidebar, top bar, global command bar, alert menu, role selector, and page-level action button.

### Sidebar Navigation

Command Center:

- Overview: `/dashboard`
- Recommendations: `/dashboard/recommendations`
- Incidents: `/dashboard/incidents`

Operate:

- Servers: `/dashboard/targets`
- Monitoring: `/dashboard/monitoring`
- Stacks: `/dashboard/stacks`

AI Platform:

- Models & Providers: `/dashboard/models`
- Routing Policies: `/dashboard/routing-policies`

Workspaces:

- AI Workspaces: `/dashboard/workspaces`
- Knowledge Bases: `/dashboard/knowledge-bases`
- Agents: `/dashboard/agents`

Govern:

- Teams: `/dashboard/departments`
- Approval Inbox: `/dashboard/approval-inbox`
- Audit Logs: `/dashboard/audit-logs`
- Compliance Readiness: `/dashboard/compliance`

Optimize:

- Resource Planner: `/dashboard/resource-planner`
- Cost & Capacity: `/dashboard/cost-capacity`

Settings:

- Settings: `/dashboard/settings`

### Sidebar Controls

- Switchboard AI logo/home link.
- Collapse sidebar button.
- Expand sidebar button when collapsed.
- Active route highlight.
- Scrollable navigation.
- Governance mode status card.

### Top Bar

Top bar contents:

- Organization: Acme Corp
- Environment: Production
- AI Ops Status: Warning
- Demo Mode badge
- Role selector: Viewer, Operator, Admin, Owner
- Global Command Bar
- Active alerts button
- Page-level primary action

Top bar page actions:

- Overview: Review recommendations
- Recommendations: Simulate top recommendation
- Incidents: Review open incidents
- Servers: Add Server
- Server Detail: Request deployment
- Monitoring: Open incidents
- Stacks: Request approval
- Models & Providers: Add Model
- Routing Policies: Create Policy
- AI Workspaces: Create Workspace
- Knowledge Bases: Add Source
- Agents: Create Agent
- Teams: Create Team
- Approval Inbox: Review pending
- Audit Logs: Export Audit
- Compliance Readiness: Export Evidence
- Resource Planner: Run simulator
- Cost & Capacity: Review savings
- Settings: Configure

### Global Command Bar

Purpose:

- Cross-product navigation and simulated AI operations commands.

Placeholder:

- Search or run command...

Shortcut:

- Ctrl K

Command suggestions currently include:

- Open Overview
- Open Recommendations
- Open Incidents
- Open Approval Inbox
- Open Claims On-Prem Node
- Review cost recommendations
- Review governance recommendations
- Review open incidents
- Review pending approvals
- Simulate top recommendation
- Show degraded providers
- Create Legal AI Workspace
- Review ISO evidence gaps
- Open Qwen 32B model
- Request GPT-5 fallback approval
- View agent kill switch controls

Command behavior:

- Most commands navigate to a dashboard page.
- GPT-5 fallback approval command shows a toast, records audit activity, and routes to Approval Inbox.
- Escape closes the command list.
- Outside click closes the command list.

### Alert Menu

The alert menu opens from the top bar.

Visible alerts:

- Legal Sandbox agent offline: Critical, no heartbeat for 42 minutes, workspace unavailable, links to Servers.
- Claims GPU pressure: Warning, GPU 92% and VRAM 22/24 GB, queue wait +18%, links to Cost & Capacity.
- OpenAI GPT-5 latency: Degraded, p95 latency 1,480 ms, fallback ready, links to Routing Policies.

Buttons/links:

- Alert menu toggle.
- Each alert row navigates to the relevant page.
- View all monitoring alerts links to Monitoring.

### Shared UI Components

Shared components currently used across pages:

- DashboardShell
- TopBar
- PageHeader
- Section
- Card
- MetricCard
- StatusBadge
- RiskBadge
- DataBoundaryChip
- ActionButton
- DataTable
- RecommendedActionCard
- ChartCard
- Modal
- MockAction

Shared interaction patterns:

- Toast messages.
- In-memory audit logging.
- Confirmation modals for risky actions.
- Local state updates for simulated workflow changes.
- Role-aware disabled actions.
- Links to related workflow pages.

## Route And Page Inventory

## 1. Overview

Route:

- `/dashboard`

Purpose:

- Main command center for AI estate health, immediate action, infrastructure status, cost risk, governance gaps, and recent activity.

Major sections:

- Compact command center header.
- KPI/status strip.
- Queue preview cards.
- Immediate attention preview.
- Operational details tabs.
- Workspace activity chart.
- Cost snapshot.
- Provider and governance card.
- Teams needing attention.
- Confirmation modal.
- Usage reminder modal.

KPI/status cards:

- AI Ops Status: Warning.
- Infrastructure: 3/4 online.
- Services: 18/21 healthy.
- Agents: 1 offline.
- Cost: AED 184,000 projected monthly spend.
- ISO Evidence: 72% readiness support.
- Capacity: 92% GPU peak.

Queue preview cards:

- Recommendations: 8 open.
- Incidents: 5 active.
- Approval Inbox: 6 pending.

Immediate attention items:

- Legal Sandbox Offline.
- Claims GPU Pressure.
- OpenAI Provider Degraded.

Operational detail tabs:

- Infrastructure.
- Recommended Actions.
- Teams Needing Attention.
- Recent Audit.

Buttons/actions:

- Refresh: records health telemetry refresh.
- Open Recommendations.
- Open Incidents.
- Restart Agent: opens confirmation modal.
- View Logs: records action.
- Review Capacity: links to Recommendations.
- Simulate Fix: links to Recommendations.
- Open Server: links to Servers.
- Request Routing Approval: opens confirmation modal.
- View Providers: links to Models.
- Request Cost Approval: opens confirmation modal.
- Notify Team Owner: opens reminder modal.
- Review Evidence: links to Compliance.
- Enable Approval: opens confirmation modal.
- View Fleet: links to Servers.
- Open Critical: links to Servers.
- Workspace Activity arrow: links to Workspaces.
- Open cost recommendations: links to Recommendations.
- Teams table Notify Owner: opens reminder modal.
- Teams table primary action links to Routing Policies, Models, or Resource Planner depending on the issue.
- Confirmation modal: Cancel and Confirm action.
- Reminder modal: editable message, Cancel, Send reminder.

Feature value:

- Lets an admin quickly see what is unhealthy, what needs approval, where cost is trending, and where to go next.

## 2. Recommendations

Route:

- `/dashboard/recommendations`

Purpose:

- Central action queue for cross-product AI operations recommendations.

Major sections:

- Page header.
- KPI cards.
- Result panel after an action.
- Recommendation queue.
- Selected recommendation detail panel.
- Related context cards.
- Confirmation modal.

KPI cards:

- Open recommendations.
- Critical recommendations.
- Monthly savings.
- Awaiting approval.
- Governance gaps.
- Capacity risk.

Recommendation filters:

- All.
- Cost.
- Capacity.
- Routing.
- Provider.
- Governance.
- Access.
- Cache.
- Model Graduation.
- Evidence.
- Applied.
- Dismissed.

Recommendation queue columns/content:

- Severity.
- Category.
- Recommendation title.
- Problem.
- Evidence.
- Impact.
- Owner.
- Approval status.
- Recommendation status.
- Next action hint.

Selected detail panel includes:

- Recommendation title.
- Severity badge.
- Category.
- Data boundary.
- Status.
- Approval.
- Problem.
- Evidence.
- Impact if ignored.
- Recommended change.
- Current state.
- Proposed state.
- Estimated monthly savings.
- Capacity impact.
- Governance impact.
- Rollback or next step.

Mock recommendations:

- Claims GPU reallocation.
- Marketing cost ladder.
- OpenAI degraded fallback.
- Support semantic cache opportunity.
- Engineering model graduation.
- Legal local-only enforcement.
- Finance agent approval gap.
- Evidence readiness gap.

Buttons/actions:

- Simulate top recommendation.
- Filter buttons.
- Select recommendation row.
- Review.
- Simulate.
- Request approval.
- Apply.
- View evidence.
- Dismiss.
- Open related page.
- Clear result panel.
- Confirmation modal Cancel.
- Confirmation modal Confirm action.

Role behavior:

- Viewer can inspect but cannot simulate, request approval, apply, or dismiss.

Feature value:

- Consolidates scattered operational, cost, capacity, routing, governance, access, cache, and evidence actions into one decision workflow.

## 3. Incidents

Route:

- `/dashboard/incidents`

Purpose:

- Incident response and lifecycle handling for active AI operations issues.

Major sections:

- Page header.
- Incident KPIs.
- Incident queue/list.
- Selected incident detail panel.
- Simulation/result panel.
- Create incident modal.
- Confirmation modal.

Incident concepts:

- Response owner.
- Timeline.
- Mitigation.
- SLA risk.
- Related approvals.
- Resolution.
- Related audit events.

Buttons/actions:

- Create incident.
- Review open incidents.
- Filter incident queue.
- Select incident row.
- Acknowledge.
- Assign owner.
- Simulate fix.
- Apply mitigation or Request approval.
- Resolve.
- View logs.
- Open related page or Approval Inbox.
- Clear simulation/result.
- Create incident modal Cancel.
- Create incident modal Create incident.
- Confirmation modal Cancel.
- Confirmation modal Confirm action.

Role behavior:

- Viewer can inspect but cannot acknowledge, assign, simulate mitigation, apply/request mitigation, or resolve.

Feature value:

- Separates signal detection from incident response and gives admins a response workflow.

## 4. Servers

Route:

- `/dashboard/targets`

Purpose:

- AI infrastructure fleet control room for deployment targets, agents, health, GPU/VRAM, stack status, and registration.

Major sections:

- Fleet status/KPI cards.
- Top recommendation.
- Quick filters.
- Server table.
- Register/install agent modal.
- Capacity approval callout.

Server data:

- Acme Azure GPU Server: Azure VM, UAE North, online, Private AI Basic, NVIDIA L40S, 71%, 34/48GB, Healthy.
- Claims On-Prem Node: On-prem GPU Server, Dubai Office, online, Claims AI Stack, RTX 4090, 92%, 22/24GB, Warning.
- AWS Private AI Node: AWS EC2, eu-west-1, online, RAG Stack, A10G, 54%, 16/24GB, Healthy.
- Legal Sandbox: Local Workstation, Legal Department, offline, no stack, GPU not detected, Offline.

Filters:

- All.
- Healthy.
- Warning.
- Offline.
- On-prem.
- Cloud.
- GPU pressure.

Buttons/actions:

- Register Agent.
- Add Server.
- Filter buttons.
- View server detail.
- Review capacity.
- Request approval.
- Open recommendation.
- Copy/install agent command.
- Close install modal.
- Generate registration/install instructions.

Feature value:

- Lets admins see which servers are online, offline, overloaded, or safe, then act on agent registration and capacity risk.

## 5. Server Detail

Route:

- `/dashboard/targets/acme`

Purpose:

- Detailed view of the Acme Azure GPU Server.

Major sections:

- Page header.
- Server health and stack overview.
- Metric cards for CPU, RAM, disk, GPU, VRAM.
- Tabs for Services, Deployment, Logs.
- Service table.
- Deployment timeline.
- Logs preview.

Buttons/actions:

- Request deployment.
- View Logs.
- Request restart.
- Tab buttons: Services, Deployment, Logs.
- Restart service.
- Replay deployment simulation.
- Open deployment report.
- Confirmation-style browser prompt for restart.

Feature value:

- Gives admins server-level operational inspection and controlled service actions.

## 6. Monitoring

Route:

- `/dashboard/monitoring`

Purpose:

- Live AI operations monitoring for signals, metrics, alerts, provider health, latency, cost, and service health.

Major sections:

- Monitoring status summary.
- Compact KPI strip.
- Attention/alert queue.
- Quick action buttons.
- Compact filter bar.
- Chart grid.
- Provider Health & Drift section.
- Service health by server.

KPI metrics:

- Fleet GPU.
- Requests.
- Avg latency.
- Error rate.
- Estimated cost.
- Open issues.

Filters:

- Time range.
- Metric view.
- Server.
- Provider.
- Severity.
- Reset filters.

Alerts:

- OpenAI provider degradation affecting GPT-5.
- Claims On-Prem Node GPU memory above threshold.
- Legal Sandbox agent offline.
- GPT-5 monthly cost above threshold.
- LiteLLM restart event detected.

Buttons/actions:

- Open affected servers.
- Review model routing.
- Tune alert thresholds.
- Acknowledge selected scope.
- Filter/reset controls.
- Alert Open buttons.
- Provider/routing links where applicable.

Feature value:

- Keeps Monitoring focused on signals, telemetry, provider drift, charts, and alert triage.

## 7. Stacks

Route:

- `/dashboard/stacks`

Purpose:

- Deployable AI stack catalog for choosing private or governed AI infrastructure templates.

Stack templates:

- Private AI Basic.
- Private RAG Stack.
- Claims AI Stack.
- Developer AI Stack.
- Secure Local-Only Stack.

Major sections:

- Summary strip.
- Stack catalog cards.
- Template detail modal.
- Deployment simulation state.

Each stack card shows:

- Stack name.
- Use case.
- Included services as chips.
- Recommended infrastructure.
- Best for.
- Sensitivity fit.
- Deployment complexity.
- Evidence/audit hooks where relevant.

Buttons/actions:

- Simulate deploy.
- Request approval.
- View template.
- Modal Request approval.
- Modal Simulate deploy.
- Modal close.

Feature value:

- Helps admins compare deployment templates and initiate controlled stack deployment workflows.

## 8. Models & Providers

Route:

- `/dashboard/models`

Purpose:

- Governed model catalog for local models, cloud providers, provider health, sensitivity fit, fallback eligibility, and model integration.

Major sections:

- KPI strip.
- Provider health/active issue summary.
- Governed model catalog table.
- Model Graduation insight.
- Routing recommendations.
- Add Model drawer/modal.

Provider health examples:

- OpenAI: degraded, route critical work to Claude or Qwen 32B.
- Anthropic: operational.
- Google: operational.
- Ollama/vLLM: self-hosted telemetry.

Model catalog visible columns:

- Model.
- Hosting.
- Runtime.
- Provider Health.
- Target.
- Sensitivity Fit.
- Status.
- Action.

Add Model form fields:

- Provider.
- Model name.
- Model type.
- Endpoint.
- Secret reference.
- Input cost per 1M tokens.
- Output cost per 1M tokens.
- Context window.
- Sensitivity fit.
- Fallback eligible.
- Max concurrency.
- GPU requirement.
- VRAM requirement.

Buttons/actions:

- Add Model.
- Refresh provider status.
- Open routing policy.
- Test connection.
- Add to governed catalog.
- Drawer/modal Cancel or close.

Feature value:

- Establishes model catalog as the source of truth for what models can be selected in workspaces, agents, routing, and planning.

## 9. Routing Policies

Route:

- `/dashboard/routing-policies`

Purpose:

- Policy control room for model routing, fallback behavior, sensitive-data routes, blocked models, provider degradation, and cost ladders.

Major sections:

- OpenAI degraded alert.
- Routing module cards.
- Local filters.
- Policy table.
- Model suggestions.
- Create/Edit Policy drawer/modal.

Routing modules:

- Sovereignty Router.
- Marketing Cost Ladder.
- Provider Degradation.
- Budget Circuit Breaker.
- Prompt Firewall.

Policy filters:

- All.
- Sensitive.
- Cost risk.
- Provider issue.
- Local-only.
- External allowed.

Policy table visible columns:

- Policy.
- Scope.
- Sensitivity.
- Primary Route.
- Fallback.
- Blocked.
- Status.
- Action.

Create/Edit fields:

- Policy name.
- Workspace/team scope.
- Task type.
- Sensitivity.
- Primary model.
- Fallback policy.
- Blocked models.

Buttons/actions:

- Route to Claude.
- Route to Qwen.
- Open incident.
- Open recommendation.
- Request approval.
- Review rules.
- Filter buttons.
- Edit policy.
- Create Policy.
- Cancel.
- Save routing policy.

Feature value:

- Shows how traffic moves between local and external models based on sensitivity, provider health, budget, and policy.

## 10. AI Workspaces

Route:

- `/dashboard/workspaces`

Purpose:

- Create, publish, launch, and govern AI interfaces for teams.

Major sections:

- KPI cards.
- Tabs for Workspaces and Boundary.
- Workspace table.
- Workspace create/edit modal.
- Workspace launch preview modal.
- Access boundary panel.

Workspace object includes:

- Workspace name.
- Interface: Open WebUI, custom chat, or API-only.
- Launch URL.
- Publish status.
- Assigned departments/teams.
- Assigned users.
- Allowed models.
- Knowledge bases.
- Assigned agents.
- Routing policy.
- Token/budget limits.
- External model rule.
- Audit logging.

Buttons/actions:

- Create Workspace.
- Tab buttons.
- Launch.
- Copy URL.
- Edit.
- Open approval.
- Publish/disable toggle icon.
- Save workspace.
- Modal Cancel.
- Launch preview: Open, Copy URL, Invite users, Manage governance policy.
- Multi-select option buttons.

Feature value:

- Makes workspaces the core product object that admins configure and send users into.

## 11. Knowledge Bases

Route:

- `/dashboard/knowledge-bases`

Purpose:

- Connect document/data sources and govern which workspaces, teams, and users can retrieve from them.

Major sections:

- KPI cards.
- Knowledge base table/list.
- Source setup flow.
- Add Source modal/drawer.
- Sync/action controls.

Knowledge base examples:

- Legal Contracts.
- Claims SOPs.
- Engineering Docs.
- Finance Policies.
- Product FAQ.

Knowledge base fields:

- Document count.
- Source type.
- Sync status.
- Vector index status.
- Assigned workspaces.
- Assigned teams.
- Access permissions.
- Last sync timestamp.
- Sensitivity.
- Authorization boundary.

Source connection types:

- Uploaded documents.
- SharePoint folder.
- Google Drive folder.
- S3 bucket.
- Internal policies.
- SOPs.
- Contracts.
- Claims documents.
- HR policies.
- Finance policies.
- Product FAQs.
- Engineering docs.

Buttons/actions:

- Add Source.
- Manage.
- Connect source.
- Test connection.
- Sync now.
- Save source.
- Modal/drawer Cancel or close.

Feature value:

- Shows that users should only retrieve knowledge from sources they are authorized to access.

## 12. Agents

Route:

- `/dashboard/agents`

Purpose:

- Govern custom AI agents as controlled AI workers with owners, budgets, tools, approvals, and kill switches.

Major sections:

- Page header.
- Tabs for Agents and Safety & Controls.
- Agent table.
- Agent create/edit modal.
- Safety controls.

Agent fields:

- Agent name.
- Owner.
- Department/team.
- Allowed models.
- Allowed knowledge bases.
- Tools/MCP servers.
- Human approval rule.
- External model restrictions.
- Usage limits.
- Budget.
- MCP/tool governance.
- Kill switch.
- Status/risk.

Example agents:

- Claims Summary Agent.
- Contract Review Agent.
- Support Triage Agent.
- Code Review Agent.
- Finance Analysis Agent.

Buttons/actions:

- Create Agent.
- Tabs: Agents, Safety & Controls.
- Edit.
- Open approval.
- Open recommendation.
- Option toggle buttons.
- Cancel.
- Save agent.

Feature value:

- Makes agents governed identities rather than untracked automation.

## 13. Teams

Route:

- `/dashboard/departments`

UI name:

- Teams.

Purpose:

- Create teams, invite users, assign AI access, and manage budgets, token limits, model access, knowledge access, agent access, and evidence gaps.

Major sections:

- Page header.
- KPI cards.
- Team summary cards.
- Tabs.
- Members table.
- Budgets and limits.
- Model Access matrix.
- Knowledge Access matrix.
- Agent Access matrix.
- Evidence Gaps table.
- Invite User modal.
- Create Team modal.

KPI cards:

- 6 teams.
- 230 users.
- 24 active policies.
- 30.6M / 51M monthly governed tokens.
- 3 evidence gaps.
- 2 teams at risk.

Team summary cards:

- Engineering.
- Legal.
- Claims.
- Finance.
- Customer Support.
- Marketing.

Team card fields:

- Users.
- Primary workspace.
- Allowed models.
- Assigned knowledge bases.
- Assigned agents.
- Budget/token usage.
- Risk status.
- ISO/evidence status.

Tabs:

- Teams Overview.
- Members.
- Budgets & Limits.
- Model Access.
- Knowledge Access.
- Agent Access.
- Evidence Gaps.

Create Team fields:

- Team name.
- Owner.
- Description.
- Default workspace.
- Add users by email.
- Allowed models.
- Allowed knowledge bases.
- Allowed agents.
- Monthly token budget.
- Monthly spend budget.
- External model rule.
- Human approval requirement.
- ISO/evidence owner.

Invite User fields:

- Email.
- Team.
- Role.
- Inherited access summary.

Buttons/actions:

- Invite User.
- Create Team.
- Tabs.
- Manage.
- View access.
- Model access toggles.
- Knowledge access toggles.
- Agent access toggles.
- Hard-limit toggles.
- Budget/token input controls.
- Invite modal Cancel.
- Invite modal Invite User.
- Create Team modal Cancel.
- Create Team modal Create Team.

Feature value:

- Lets admins govern AI access at team and user level.

## 14. Approval Inbox

Route:

- `/dashboard/approval-inbox`

Purpose:

- Review and decide high-impact AI operations changes before they are applied.

Major sections:

- Page header.
- Approval KPI cards.
- Filter tabs.
- Approval request table/list.
- Selected approval detail panel.
- Simulation/result panel.
- Confirmation modal.

Approval concepts:

- Exact payload.
- Expiry.
- Audit trail.
- Requested change.
- Risk level.
- Owner.
- Related page.
- Impact simulation.

Buttons/actions:

- Review pending.
- Filter approvals.
- Select approval row.
- Approve.
- Deny.
- Request changes.
- Simulate impact.
- Open related page.
- Show exact payload.
- Clear simulation.
- Confirmation modal Cancel.
- Confirmation modal Confirm decision.

Role behavior:

- Only Owner can approve or deny high-impact changes.
- Other roles see disabled approve/deny with a reason.

Feature value:

- Centralizes approval before production-sensitive operations such as routing changes, workspace publishing, budget controls, and agent actions.

## 15. Audit Logs

Route:

- `/dashboard/audit-logs`

Purpose:

- Enterprise audit trail for infrastructure, model, access, alert, agent, compliance, and governance events.

Major sections:

- Page header.
- Tabs.
- Filters.
- Audit event table.
- Coverage view.

Tabs:

- Events.
- Coverage.

Filters:

- All.
- Deployment.
- Permission.
- Model.
- Routing.
- Knowledge.
- Workspace.
- Agent.
- Alert.
- Compliance evidence.

Audit table includes:

- Time.
- Actor.
- Event.
- Target.
- Related record.
- Status.

Buttons/actions:

- Export Audit page action.
- Tabs.
- Filter buttons.

Feature value:

- Shows evidence of admin activity, simulated workflow decisions, and governance events.

## 16. Compliance Readiness

Route:

- `/dashboard/compliance`

Purpose:

- ISO/IEC 42001 readiness support through evidence, AI system registry, risk assessments, human oversight, policy coverage, and governance gaps.

Important wording:

- Supports ISO/IEC 42001 readiness.
- Does not claim certification.

Major sections:

- Page header.
- Readiness summary.
- KPI cards.
- Tabs.
- AI system registry.
- Evidence vault.
- Governance gaps.
- Export evidence workflow.

KPI cards:

- AI systems registered.
- Risk assessments.
- Human oversight.
- Evidence collected.

Tabs:

- Systems.
- Evidence.
- Gaps.

Buttons/actions:

- Export readiness evidence.
- Open governance recommendations.
- Tabs.
- Open in Recommendations for gaps.

Feature value:

- Gives admins a readiness/evidence layer without claiming compliance certification.

## 17. Resource Planner

Route:

- `/dashboard/resource-planner`

Purpose:

- Planning workspace for capacity, budget, team usage, model mix, governance recommendations, and policy simulation.

Major sections:

- Summary.
- Sticky secondary navigation/tabs.
- Recommendations queue.
- Simulator.
- Team Usage.
- Access & Policies.
- Evidence.
- Recommendation detail drawer/panel.

Primary tabs:

- Summary.
- Recommendations.
- Simulator.
- Team Usage.
- Access & Policies.
- Evidence.

Access & Policies sub-tabs:

- Models.
- Knowledge Bases.
- Agents.
- Workspaces.

Summary metrics:

- Potential savings.
- Under-allocated teams.
- Over-allocated teams.
- Governance risks.
- ISO readiness gaps.
- Top recommended action.

Recommendation rows:

- Claims under-allocated.
- Marketing over-spending.
- Finance over-allocated.
- Legal governance risk.
- Customer Support cache opportunity.
- ISO readiness gap.

Team Usage columns:

- Team.
- Active users.
- Requests.
- Tokens.
- AI cost.
- GPU allocation.
- Cloud spend.
- Avg latency.
- Status.
- Action.

Simulator fields:

- Selected team.
- Current plan.
- Proposed plan.
- Monthly budget.
- Local GPU allocation.
- Max concurrent requests.
- Fallback policy.
- Allowed models.
- Assigned knowledge bases.
- Assigned agents.

Projected effect:

- Projected monthly cost.
- Expected latency.
- Capacity impact.
- Savings.
- Risk level.
- Governance readiness impact.

Buttons/actions:

- Run Simulator.
- Secondary tab buttons.
- Review recommendation.
- Simulate recommendation.
- Load recommendation.
- Request approval.
- Team Usage Plan button.
- Access matrix toggles.
- Close recommendation panel.
- Open in Recommendations.
- Team membership link to Teams.

Feature value:

- Helps admins decide how capacity, budgets, model access, knowledge access, agents, and governance responsibility should be allocated.

## 18. Cost & Capacity

Route:

- `/dashboard/cost-capacity`

Purpose:

- Financial and capacity cockpit for spend forecast, budget burn, savings opportunities, GPU allocation, reclaimable capacity, and cost controls.

Major sections:

- KPI cards.
- Budget forecast.
- Tabs.
- Spend/capacity charts.
- Spend by model breakdown.
- Savings scenario preview.
- Budget circuit breakers.
- Model Graduation Flywheel.
- Savings opportunities.

KPI cards:

- Projected monthly spend: AED 184,000.
- Budget remaining: AED 46,000.
- Savings opportunity: AED 42,000.
- GPU capacity assigned: 100%.
- Cost per successful task: AED 0.84.
- Forecast risk: 80% budget in 19 days.

Tabs:

- Forecast.
- Spend.
- Capacity.
- Controls.

Budget forecast items:

- Current run-rate reaches 80% budget in 19 days.
- GPT-5 spend should trigger Marketing ladder.
- Support cache can reduce repeated-query spend.
- Claims capacity needs GPU, not cloud fallback.

Budget circuit breaker columns:

- Scope.
- Trigger.
- Expected activation.
- Ladder.
- Status.

Buttons/actions:

- Review savings actions.
- Open in Recommendations.
- Review GPU plan.
- Inspect forecast.
- Simulate rebalance.
- Tab buttons.

Feature value:

- Shows whether AI spend is going over budget, who is driving cost, what can be saved, and what policies will activate.

## 19. Settings

Route:

- `/dashboard/settings`

Purpose:

- Configure organization defaults, integrations, retention, operational thresholds, data residency, notifications, workspace publishing, and compliance settings.

Major sections:

- Page header.
- Settings tabs.
- Organization profile.
- Providers.
- Agent install settings.
- Data residency.
- Audit retention.
- Notifications.
- Workspace publishing defaults.
- Compliance settings.
- Operational thresholds.
- Selected setting modal.

Settings areas:

- Organization profile.
- Providers.
- Agent install.
- Data residency.
- Audit retention.
- Notifications.
- Workspace publishing defaults.
- Compliance settings.
- Thresholds.

Buttons/actions:

- Configure page action.
- Tab buttons.
- Setting card buttons.
- Manage connected providers.
- Selected setting modal Cancel.
- Selected setting modal Save change.

Feature value:

- Gives admins a place to configure operating defaults and governance settings.

## Main Product Capabilities Represented

### Infrastructure Operations

- Register remote server agents.
- View server online/offline state.
- View GPU/VRAM pressure.
- View agent heartbeat status.
- Inspect server details.
- Restart service.
- Request deployment approval.
- Simulate stack deployment.
- View logs/report.

### AI Model Governance

- Register local and cloud models.
- Track provider health.
- Mark sensitivity fit.
- Track fallback eligibility.
- Test provider/model connection.
- Route traffic based on policy.
- Recommend model fallback during degradation.
- Identify model graduation opportunities.

### Workspace Governance

- Create AI workspaces.
- Publish governed interfaces.
- Launch Open WebUI/custom/API workspace previews.
- Copy workspace URLs.
- Invite users.
- Manage governance policy.
- Assign models, knowledge bases, agents, budgets, routing policies, and audit logging.

### Knowledge Governance

- Add document/data sources.
- Track sync and vector index status.
- Assign knowledge bases to workspaces and teams.
- Show authorization boundaries.
- Trigger sync.
- Test source connection.

### Agent Governance

- Create custom agents.
- Assign owner/team.
- Assign models and knowledge bases.
- Govern tools and MCP servers.
- Require human approval.
- Apply usage/budget limits.
- Show kill switch state.
- Link risky agents to recommendations or approvals.

### Team Governance

- Create teams.
- Invite users by email.
- Assign workspace/model/knowledge/agent access.
- Manage token budgets and hard limits.
- Manage spend budgets.
- Review evidence gaps.
- Show inherited access summary.

### Recommendations Workflow

- Aggregate recommendations across infrastructure, cost, routing, provider health, governance, access, cache, model graduation, and evidence.
- Review recommendation evidence.
- Simulate impact.
- Request approval.
- Apply recommended change.
- Dismiss recommendation.
- Open related page.
- Record audit events.

### Incident Workflow

- Create incidents.
- Acknowledge incidents.
- Assign owner.
- Simulate fix.
- Apply mitigation or request approval.
- Resolve incident.
- View logs.
- Link to related pages and approval inbox.

### Approval Workflow

- Review pending approval requests.
- Simulate impact.
- View exact payload.
- Approve.
- Deny.
- Request changes.
- Open related page.
- Record audit trail.

### Audit And Evidence

- View audit events.
- Filter audit logs by category.
- Export audit.
- Export evidence pack.
- Track ISO/IEC 42001 readiness support.
- Track system registry, risk assessments, human oversight, evidence, and governance gaps.

### Cost And Capacity Optimization

- View monthly spend forecast.
- View budget remaining.
- View savings opportunity.
- View GPU capacity assignment.
- Simulate rebalancing.
- Review budget circuit breakers.
- Review semantic cache savings.
- Review model graduation flywheel.
- Run resource planner simulations.

## Important Current Product Assumptions

- This is a frontend mockup.
- No backend APIs are wired.
- No real infrastructure changes are made.
- No real model provider secrets are stored in the frontend.
- Real enforcement would require backend, AI gateway, policy execution, agent execution, and persistent audit storage.
- ISO/IEC 42001 is presented as readiness support only, not certification.
- Demo Mode remains visible.
- Actions are designed to behave like the final product UX contract using local state, toast feedback, confirmation modals, and in-memory audit events.

## Suggested Analysis Prompt

Use this prompt with the inventory above:

Analyze this enterprise AI control plane product called Switchboard AI. Evaluate whether the current modules, user journeys, page structure, actions, and feature coverage clearly communicate the product value. Identify duplicated concepts, missing workflows, confusing naming, unclear CTAs, weak enterprise-governance areas, and which features should be prioritized for a real MVP. Also suggest how to simplify the product without losing the core Observe -> Detect -> Recommend -> Simulate -> Approve -> Apply -> Audit -> Optimize loop.
