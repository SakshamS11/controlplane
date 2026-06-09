# AI Control Plane Mockup MVP

AI Control Plane is a polished mockup-only enterprise SaaS dashboard for demonstrating the product vision:

> Deploy AI anywhere. Govern it centrally. Operate it from one place.

This MVP is built for investor, client, and technical partner demos. It uses mock data only and does not include a backend, database, agents, cloud provisioning, Kubernetes, billing, SSO, or production AI stack deployment.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- lucide-react
- Mock data only

## Project layout

```text
apps/dashboard          Next.js mockup app
docs/mockup-scope.md    Scope notes
```

## Local setup

```bash
cd apps/dashboard
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build

```bash
cd apps/dashboard
npm run build
```

## Vercel deployment

Create a new Vercel project and set:

```text
Root Directory: apps/dashboard
Build Command: npm run build
Install Command: npm install
Output Directory: .next
```

No environment variables are required.

## Routes

- `/` landing page
- `/dashboard` overview
- `/dashboard/targets`
- `/dashboard/targets/acme`
- `/dashboard/models`
- `/dashboard/stacks`
- `/dashboard/departments`
- `/dashboard/monitoring`
- `/dashboard/audit-logs`
- `/dashboard/settings`

## Mock interactions

- Action buttons show toast notifications.
- Deploy/restart/rollback actions add local mock audit entries.
- Department model permission toggles update local state.
- No external APIs are called.
