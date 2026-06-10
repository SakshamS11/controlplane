# Current Product Audit

Date: 2026-06-10  
Scope: Existing frontend mockup only. No UI redesign or product changes were made during this audit.

## 1. Current Routes And Pages

### Route Map

| Route | Page Purpose | Status |
| --- | --- | --- |
| `/` | Redirects users directly to `/dashboard`; login page has been removed. | Exists |
| `/dashboard` | Main command center overview for fleet, workspaces, actions, charts, resource planner summary, alerts, and events. | Exists |
| `/dashboard/targets` | Deployment targets / servers list and mock agent install flow. | Exists |
| `/dashboard/targets/acme` | Detailed control-room view for one server, including metrics, services, and deployment timeline. | Exists |
| `/dashboard/monitoring` | Observability page with filters, KPIs, charts, provider health, service health, and alerts. | Exists |
| `/dashboard/stacks` | Stack template catalog with deploy/view actions. | Exists |
| `/dashboard/models` | Unified model/provider catalog with provider health and model integration form. | Exists |
| `/dashboard/routing-policies` | Routing policy rules, provider incident action, and model suggestions. | Exists |
| `/dashboard/workspaces` | AI workspace configuration, launch modal, and workspace list. | Exists |
| `/dashboard/knowledge-bases` | Knowledge base list, source connection setup, sync/index state, and access boundary. | Exists |
| `/dashboard/agents` | Custom agent configuration and agent list. | Exists |
| `/dashboard/departments` | Teams/departments, member invites, token limits, individual limits, and model permission matrix. | Exists |
| `/dashboard/audit-logs` | Filterable audit log table. | Exists |
| `/dashboard/resource-planner` | Resource planning, recommendations, simulator, access matrix, workspaces, KBs, and agents summary. | Exists |
| `/dashboard/settings` | Settings, thresholds, providers, and policy impact preview. | Exists |

### Sidebar Structure

- Command Center
  - Overview
- Operate
  - Servers
  - Monitoring
  - Stacks
- AI Platform
  - Models & Providers
  - Routing Policies
- Workspaces
  - AI Workspaces
  - Knowledge Bases
  - Agents
- Govern
  - Teams
  - Audit Logs
- Optimize
  - Resource Planner
- Settings
  - Settings

### Missing Or Broken Routes

- No visible route exists for `Compliance Readiness` / `/dashboard/compliance`.
- No visible route exists for `Cost & Capacity` / `/dashboard/cost-capacity`.
- Sidebar and current route structure do not include these two modules yet.
- Non-Acme server names in `/dashboard/targets` link to `#` rather than individual detail pages.

## 2. Page-By-Page Audit

### `/dashboard`

- Above the fold: Page header, first four KPI cards, quick setup actions, control-room module grid, priority status panel.
- Main KPI/cards: Online agents, deployment targets, monthly requests, estimated cost, avg latency, models connected, active AI stacks, open alerts, resource planner impact.
- Tables: Published AI workspaces table.
- Charts: Compact request volume area chart, cost by model donut chart, department usage bar chart.
- Forms/modals: Add server modal, add model modal, workspace launch modal.
- Buttons/actions: View server details, Add Server, Add Model, Create Workspace, Invite Users, launch/copy/invite/manage workspace, generate ops report.
- Mock data used: `targets`, `workspaces`, `alerts`, `deploymentEvents`, `requestVolume`, `costByModel`, `requestsByDepartment`, `operationalThresholds`, `modelCatalog`.
- Current user journey: User lands in an operational hub, can jump to major modules, launch workspaces, inspect top actions, and open server/model setup flows.
- Dense/confusing: The page mixes navigation hub, workspace launcher, charts, alerts, planner summary, and modals. The top status message is useful but not yet framed as a single clear AI Ops status decision.
- Useful to preserve: Quick actions, workspace launcher, action queue, compact charts, and the ability to reach major product areas without relying on the sidebar.

### `/dashboard/targets`

- Above the fold: Page header with Add server action, three summary cards, server table.
- Main KPI/cards: 3 servers online, 1 warning, fast path to Acme demo.
- Tables: Deployment targets table.
- Charts: None.
- Forms/modals: Add server modal showing mock install command.
- Buttons/actions: Add server, copy install command, View server details.
- Mock data used: `targets`.
- Current user journey: User reviews fleet state, opens Acme server detail, or copies a mock agent install command.
- Dense/confusing: Server table lacks GPU utilization, VRAM, top recommendation, and last heartbeat columns despite the data existing in places. Non-Acme rows do not lead to detail pages.
- Useful to preserve: Simple fleet list, clear Acme demo path, and mock agent install command flow.

### `/dashboard/targets/acme`

- Above the fold: Header with Deploy Stack and View Logs, health score panel, server summary, operator actions.
- Main KPI/cards: Agent status, region, stack, GPU, CPU usage, disk usage.
- Tables: Running services table inside tabbed workspace.
- Charts: CPU/RAM, GPU utilization, latency.
- Forms/modals: No modal; deployment progress is inline.
- Buttons/actions: Deploy Stack, Restart Service, Upgrade Stack, View Logs, Rollback, service restart, open deployment report.
- Mock data used: `targets[0]`, `services`, `timeline`, `cpuRamSeries`.
- Current user journey: User can see server health, switch tabs between metrics/services/deployment, simulate deploy, and restart services.
- Dense/confusing: Risky actions like Rollback and service restart do not require confirmation. Header says health score 96 while requested product spec later says 94; current mock is internally okay but not aligned with later desired content.
- Useful to preserve: Strong control-room feel, tabbed focus, service table, deployment timeline/progress, and clear operator actions.

### `/dashboard/monitoring`

- Above the fold: Monitoring KPIs and filter panel.
- Main KPI/cards: Fleet GPU, requests, avg latency, error rate, estimated cost, open issues.
- Tables: None formal; service health and provider cards.
- Charts: Fleet GPU, request volume, average latency, error rate, cost trend, requests by department, cost by model.
- Forms/modals: Filter controls only.
- Buttons/actions: Reset filters, open affected servers, review model routing, tune alert thresholds, refresh monitoring data, open alert.
- Mock data used: `targets`, `providerHealth`, `alerts`, `requestVolume`, `requestsByDepartment`, `costByModel`, `operationalThresholds`.
- Current user journey: User filters by time, server, provider, severity, metric view; then sees charts and operational cards.
- Dense/confusing: Charts still dominate a large part of the page. Filters are useful but affect visible subsets inconsistently; chart data does not truly change with filters.
- Useful to preserve: KPI-first layout, global filters, provider health cards, and threshold awareness.

### `/dashboard/stacks`

- Above the fold: Header and stack template cards.
- Main KPI/cards: None separate; each stack is a card.
- Tables: None.
- Charts: None.
- Forms/modals: None.
- Buttons/actions: Deploy, View template.
- Mock data used: `stacks`.
- Current user journey: User browses stack templates and simulates a deployment or template preview.
- Dense/confusing: Missing stack KPIs, sensitivity fit, production readiness, and richer stack comparison. Only four stack templates currently exist.
- Useful to preserve: Simple card catalog and deploy/view template actions.

### `/dashboard/models`

- Above the fold: KPI cards, provider health, model integration form starts soon after.
- Main KPI/cards: 3 local models, 3 external providers, 128k monthly requests, provider health cards.
- Tables: Model catalog table.
- Charts: None.
- Forms/modals: Inline model/provider integration form.
- Buttons/actions: Refresh provider status, apply OpenAI routing policy, route sensitive work to Qwen 32B, test connection, add model, filter model catalog, manage model policy.
- Mock data used: `modelCatalog`, `providerHealth`.
- Current user journey: User sees provider health, adds a model, then manages catalog rows.
- Dense/confusing: Add model form is long and always visible; it may push catalog discovery down. There is no staged drawer/modal.
- Useful to preserve: Provider health down-detector concept, model catalog as source of truth, active model options feeding other pages, and secret-reference language.

### `/dashboard/routing-policies`

- Above the fold: OpenAI degradation incident card, policy KPI cards, routing rule form/list layout.
- Main KPI/cards: Policy count, model suggestions, confidential safe, audit covered.
- Tables: Routing policy table.
- Charts: None.
- Forms/modals: Inline routing rule form.
- Buttons/actions: Route to Claude, Route to Qwen, save routing policy, edit policy.
- Mock data used: Local `policySeed`, `modelCatalog`.
- Current user journey: User can respond to a provider degradation, create/edit a routing rule, and review suggestions.
- Dense/confusing: Fallback policy and blocked models are free-text fields, which feels less governed than the rest of the app. Incident action and policy editing are useful but visually separate.
- Useful to preserve: Provider incident action, model picker from active catalog, audit event on route changes.

### `/dashboard/workspaces`

- Above the fold: KPI cards and a two-column layout with workspace form and list.
- Main KPI/cards: Workspace count, published links, knowledge scoped, audit enabled.
- Tables: Workspace list table.
- Charts: None.
- Forms/modals: Inline workspace configuration form, launch modal.
- Buttons/actions: Save workspace, Launch, Copy URL, Invite, Edit, Disable/Publish toggle, Open, Copy URL, Invite users, Manage policy.
- Mock data used: `initialWorkspaces`, `departments`, `modelCatalog`, local options for KBs and agents.
- Current user journey: User can create/edit a workspace, select active models, select KBs/departments/agents, launch/copy/invite users.
- Dense/confusing: The create/edit form is long and always visible; not staged. Disable/publish is an icon-only action with no confirmation. Launch mechanics are clear in the modal.
- Useful to preserve: Workspace as core object, launch modal, active model filtering, link copy/invite/manage policy actions.

### `/dashboard/knowledge-bases`

- Above the fold: KPI cards, knowledge source setup form, and knowledge list starts beside it.
- Main KPI/cards: Knowledge bases count, documents indexed/syncing, department scoped, audit covered.
- Tables: Knowledge base table.
- Charts: None.
- Forms/modals: Inline knowledge source setup form with source type, connection fields, credentials reference, sync cadence, assignment, access permissions.
- Buttons/actions: Connect selected source, test connection, save knowledge base, sync now, manage KB policy.
- Mock data used: Local `knowledgeSeed`, `sourceTypes`, `sourceConnectionCopy`.
- Current user journey: User chooses a source, connects/tests it, assigns workspace/department/access, saves and manages KBs.
- Dense/confusing: Manual text inputs for assigned workspace/departments/access are flexible but not guided. Source connection status is local only.
- Useful to preserve: Source-specific connection step, retrieval authorization boundary, sync/index status, and policy-oriented framing.

### `/dashboard/agents`

- Above the fold: KPI cards and agent create/list layout.
- Main KPI/cards: Agent count, tool groups, human approval, audit enforced.
- Tables: Agent list table.
- Charts: None.
- Forms/modals: Inline agent configuration form.
- Buttons/actions: Save agent, edit agent.
- Mock data used: Local `agentSeed`, `modelCatalog`.
- Current user journey: User configures an agent’s department, models, KBs, tools, approval, external restriction, and usage.
- Dense/confusing: No kill switch, confirmation, operating hours, owner, spend cap, or tool registry. Knowledge and tools are free-text.
- Useful to preserve: Governed-agent mental model, model checklist from active catalog, approval/external restriction fields.

### `/dashboard/departments`

- Above the fold: KPI cards and Team Control Center tabs.
- Main KPI/cards: Department count, users, active policies, governed tokens.
- Tables: Department/user access table, model permission matrix.
- Charts: None.
- Forms/modals: Add member form, token sliders and numeric inputs.
- Buttons/actions: Add user, remove user, toggle hard limit, update token budgets, toggle model permissions.
- Mock data used: `departments`, `initialDepartmentTokenBudgets`, `initialUserTokenBudgets`, `initialPermissions`, local team members and policy summaries.
- Current user journey: User adds people, reviews inherited access, adjusts department/user token limits, toggles model permissions.
- Dense/confusing: Access matrices appear inside tabs and are useful, but the page lacks department summary cards before controls. Knowledge/agent access matrices are not here.
- Useful to preserve: Email-based team membership, token controls, local toggles, and clear inheritance explanation.

### `/dashboard/audit-logs`

- Above the fold: Header, filter buttons, audit table.
- Main KPI/cards: None.
- Tables: Audit log table.
- Charts: None.
- Forms/modals: None.
- Buttons/actions: Filter audit logs.
- Mock data used: `auditRows` from `AppStateProvider`, seeded by `auditLogs`.
- Current user journey: User filters by event type and reviews timestamp/actor/action/target/severity/status.
- Dense/confusing: No evidence-oriented labels, categories beyond core types, or summary KPIs. Useful but basic.
- Useful to preserve: Global audit state updates from mock actions across pages.

### `/dashboard/resource-planner`

- Above the fold: Planner KPI strip, team usage overview, recommendation cards, capacity balancing.
- Main KPI/cards: Departments optimized, potential savings, under-allocated teams, over-allocated teams, governance risks; recommendation cards; capacity balancing stats.
- Tables: Team usage overview, access matrix, KB governance table.
- Charts: None.
- Forms/modals: Add team member form, policy simulator with sliders/selectors, access matrix toggles.
- Buttons/actions: Add/remove member, route GPT-5 to Claude/Qwen, save simulation, apply department suggestion, toggle access matrix.
- Mock data used: Local departments, team usage, recommendations, capacities, workspaces, KB details, custom agents, routing suggestions, `modelCatalog`.
- Current user journey: User reviews usage/capacity posture, sees recommendations, applies a department-specific resource suggestion, simulates budget/GPU/concurrency/model/KB/agent changes, checks projected effects.
- Dense/confusing: Very large page with many concepts: team membership, routing controls, simulator, matrices, workspaces, KBs, agents, logic explanation. Strong ideas but too much on one page without progressive disclosure.
- Useful to preserve: Differentiated Resource Planner concept, capacity balancing logic, auto-suggested resource plan, projected effect panel, and access matrix.

### `/dashboard/settings`

- Above the fold: Alert threshold controls and settings tiles.
- Main KPI/cards: Settings tiles and policy impact preview, not classic KPIs.
- Tables: Connected providers list.
- Charts: None.
- Forms/modals: Range and number inputs for thresholds.
- Buttons/actions: Configure setting tile, adjust thresholds.
- Mock data used: `operationalThresholds`, local `settings`, local `providers`.
- Current user journey: User tunes thresholds, sees policy impact, reviews provider connection states.
- Dense/confusing: Settings tiles are placeholders and do not open real forms. Good threshold customization exists but could be more clearly connected to alerts.
- Useful to preserve: Safe operating range customization and policy impact preview.

## 3. Component Inventory

### Shared Components

- `AppStateProvider`: stores toasts, audit rows, permissions, token budgets, thresholds, and model catalog.
- `DashboardShell`: global layout with collapsible sidebar, top bar, page content area.
- `TopBar`: compact global header with product sentence, alert pill, governance pill.
- `PageHeader`: consistent page title, eyebrow, description, and optional action.
- `Section`: page padding wrapper.
- `Card`: shared white surface with border/shadow.
- `MetricCard`: reusable KPI card with icon, label, value, detail.
- `StatusBadge`: shared badge style based on status string.
- `ActionButton`: primary/secondary/danger button.
- `DataTable`: generic responsive table.
- `ChartCard`: shared chart wrapper.
- `EmptyMock`: empty state helper, currently not heavily used.
- `Modal`: generic centered modal.
- `MockAction`: action button that triggers toast and audit.
- Chart components: `AreaMetricChart`, `MultiLineChart`, `BarMetricChart`, `DonutChart`.

### Page-Local Components

- Overview: `CompactKpi`, `CompactChart`, `ModuleTile`, `LaunchInfo`.
- Monitoring: `MonitoringKpi`, `FilterButton`.
- Workspaces: `WorkspaceLaunchModal`, `InfoRow`, `Checklist`.
- Departments: local tabs, token controls, permission matrix.
- Resource Planner: `Toggle`, `Selector`, local access matrix.
- Agents: `ModelChecklist`.

### Duplicate/Inconsistent Components

- KPI cards are implemented several ways: `MetricCard`, `CompactKpi`, `MonitoringKpi`, and custom cards on many pages.
- Toggle switches are duplicated in Departments and Resource Planner.
- Checklist/multi-select patterns are duplicated in Workspaces, Agents, and Resource Planner.
- Tables use `DataTable` in many places, but several pages create raw tables manually.
- Buttons mix `ActionButton`, raw `button`, and `Link` styled as buttons.
- Tab styles are duplicated in server detail, teams, and Resource Planner.
- Modal exists, but forms are often inline instead of staged drawers/modals.

## 4. Current Design System

- Colours: Current app uses deep near-black sidebar, bright teal/cyan brand accent, slate text, emerald/amber/red status tones, and some indigo. Recent palette variables are teal-centric, not Sovereign Violet.
- Typography: Default system/Next font stack; typography is clean and readable but not strongly branded.
- Spacing: Generally spacious in shell and cards; dense in long forms/tables and Resource Planner.
- Card style: White cards, 8px-ish rounded corners, light borders, soft shadows. Professional but somewhat generic.
- Table density: Operationally useful but moderately dense; long pages often rely on wide tables.
- Badge styles: Central `StatusBadge` maps healthy/warning/critical families; easy to scan, but unknown statuses fall back to neutral.
- Chart colours: Teal, violet, lime, sky, coral, amber in shared charts; some page-level charts still pass older cyan/indigo/green/orange/red values directly.
- Premium/generic feel: More premium than the first version due to dark shell and richer palette, but still reads like a polished admin dashboard rather than a fully distinct enterprise AI operating system.
- Hierarchy: Clear on server detail and monitoring. Overview is useful but busy; Resource Planner has strong content but weak progressive hierarchy.

## 5. User Journey Audit

### Understand Overall AI Health

- Current path: `/dashboard` -> KPI strip, priority status, action queue, alerts, fleet summary.
- Strength: User can quickly see servers, models, alerts, workspaces, and planner summary.
- Gap: Overall AI Ops Status is not a single authoritative panel with reason, risk, and recommended actions.

### See Servers Needing Attention

- Current path: `/dashboard` action queue or `/dashboard/targets`.
- Strength: Legal Sandbox offline and Claims GPU warning are visible in multiple places.
- Gap: Server list lacks full operational columns like GPU %, VRAM, top recommendation, and last heartbeat.

### Create/Manage AI Workspace

- Current path: `/dashboard` quick action -> `/dashboard/workspaces#workspace-form`.
- Strength: Workspace form includes interface, launch URL, publish status, models, KBs, departments, agents, routing, budget, external rules.
- Gap: The flow is inline and long; it does not feel like a polished staged create/publish workflow yet.

### Control Team Access To Models/Knowledge/Agents

- Current path: `/dashboard/departments`, `/dashboard/workspaces`, `/dashboard/resource-planner`.
- Strength: Model access is toggle-based, token limits are adjustable, workspace and resource planner show KB/agent access.
- Gap: Knowledge and agent access are not first-class tabs in Teams. Access controls are split across several pages.

### Understand Cost/Capacity Recommendations

- Current path: `/dashboard/resource-planner`.
- Strength: Capacity balancing and department-specific suggestions are compelling and differentiated.
- Gap: Cost/capacity has no dedicated route. Some numbers differ from overview and monitoring; savings story is not yet unified.

### Investigate Audit Event Or Alert

- Current path: `/dashboard/audit-logs` or `/dashboard/monitoring`.
- Strength: Audit events update from many mock actions; monitoring alerts can be filtered/opened.
- Gap: Audit logs are simple and not evidence-oriented. Alerts do not deep-link to detailed investigation workflows.

## 6. Top 10 Improvement Opportunities

1. Problem: No single authoritative AI Ops Status block.
   - Affected: `/dashboard`, `PageHeader`, KPI cards.
   - Why it matters: The user needs instant answer to "what is unhealthy and what should I do?"
   - Recommended direction: Add mission-control status panel with status, reasons, top risks, and primary recommendations.
   - Effort: Medium.

2. Problem: Brand system is currently teal-centric, not Sovereign Violet.
   - Affected: `globals.css`, `ui.tsx`, charts, page-level accent classes.
   - Why it matters: The product needs a memorable premium identity.
   - Recommended direction: Establish official CSS variables and usage rules centered on Sovereign Violet.
   - Effort: Medium.

3. Problem: Missing `Compliance Readiness` and `Cost & Capacity` modules.
   - Affected: Navigation and routes.
   - Why it matters: These are key enterprise buyer narratives: governance evidence and financial control.
   - Recommended direction: Add mock routes and sidebar entries.
   - Effort: Medium.

4. Problem: Forms are long inline panels.
   - Affected: Workspaces, Models, Agents, Knowledge Bases, Routing.
   - Why it matters: Inline forms make pages feel dense and hide the main operational list.
   - Recommended direction: Move complex create/edit flows into staged modal/drawer patterns.
   - Effort: High.

5. Problem: KPI components are inconsistent.
   - Affected: Shared components and nearly every page.
   - Why it matters: Decision hierarchy feels different page to page.
   - Recommended direction: Standardize Health, Cost, Usage, Governance, Capacity, and Recommendation cards.
   - Effort: Medium.

6. Problem: Resource Planner is conceptually strong but overloaded.
   - Affected: `/dashboard/resource-planner`.
   - Why it matters: Differentiated feature risks feeling like a long configuration page.
   - Recommended direction: Add executive summary first, then progressive sections/tabs for simulator, matrices, evidence, and summaries.
   - Effort: High.

7. Problem: Server list lacks operational depth.
   - Affected: `/dashboard/targets`.
   - Why it matters: Fleet management should answer which target needs attention and why.
   - Recommended direction: Add GPU %, VRAM, heartbeat, top recommendation, and filters.
   - Effort: Low.

8. Problem: Risky actions do not require confirmation.
   - Affected: server detail, workspaces, agents future kill switch, access revocation.
   - Why it matters: Enterprise control planes need deliberate, auditable destructive actions.
   - Recommended direction: Add shared `ConfirmationModal` and apply it to stop/rollback/disable/revoke/kill actions.
   - Effort: Medium.

9. Problem: Audit logs are basic and not compliance-evidence oriented.
   - Affected: `/dashboard/audit-logs`.
   - Why it matters: Enterprise users need evidence and governance language.
   - Recommended direction: Add KPIs, category filters, evidence labels, and export evidence pack mock action.
   - Effort: Medium.

10. Problem: Access control is spread across pages.
    - Affected: Teams, Workspaces, Agents, Resource Planner, Knowledge Bases.
    - Why it matters: Admins may not know where to change access.
    - Recommended direction: Make Teams the primary place for people/access, while Workspaces/Agents/KBs show scoped policy summaries.
    - Effort: High.

## 7. Build Status

- Command attempted: `npm run build`
- Working directory: `apps/dashboard`
- Result: Build did not start in this shell.
- Error: `npm : The term 'npm' is not recognized as the name of a cmdlet, function, script file, or operable program.`
- Interpretation: The local PowerShell environment cannot find `npm`, so this audit cannot confirm whether the Next.js production build passes.
- Package script exists: `apps/dashboard/package.json` defines `"build": "next build"`.

