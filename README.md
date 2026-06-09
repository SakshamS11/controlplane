# Protected Dashboard Preview

This repository contains a mockup-only Next.js dashboard preview.

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

Use:

```text
Root Directory: apps/dashboard
Build Command: npm run build
Install Command: npm install
Output Directory: .next
```

No environment variables are required.

## Access

The deployed preview includes a client-side dummy login for casual access control. Share credentials privately with intended viewers.

For real privacy, make the GitHub repository private and enable Vercel Deployment Protection or password protection.
