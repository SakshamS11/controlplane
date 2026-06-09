import Link from "next/link";
import { ArrowRight, CheckCircle2, Cloud, Layers, MonitorDot, ShieldCheck, Sparkles, Workflow } from "lucide-react";

const capabilities = [
  "Deployment target inventory",
  "Private AI stack templates",
  "Cloud and local model catalog",
  "Department model permissions",
  "Infrastructure monitoring",
  "Enterprise audit trail"
];

const steps = [
  "Connect deployment target",
  "Install lightweight agent",
  "Deploy AI stack",
  "Govern model access",
  "Monitor usage, health, cost, and audit logs"
];

export default function LandingPage() {
  return (
    <main className="bg-white text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,145,178,0.28),transparent_45%,rgba(79,70,229,0.22))]" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col px-6 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-400 text-slate-950"><Cloud size={20} /></div>
              <div>
                <div className="font-semibold">AI Control Plane</div>
                <div className="text-xs text-slate-400">Deploy AI anywhere. Govern it centrally.</div>
              </div>
            </div>
            <Link href="/dashboard" className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-950">View Dashboard</Link>
          </nav>

          <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1fr_520px]">
            <div>
              <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-cyan-200">One operating layer for enterprise AI infrastructure.</p>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight md:text-6xl">Operate enterprise AI infrastructure from one control plane.</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                Deploy private AI stacks, connect cloud model providers, govern model access, monitor infrastructure health, and audit AI operations across cloud, on-prem, and third-party environments.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">View Dashboard <ArrowRight size={16} /></Link>
                <Link href="/dashboard/targets/acme" className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white">See Demo Flow <Workflow size={16} /></Link>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/8 p-4 shadow-2xl backdrop-blur">
              <div className="rounded-lg bg-white p-4 text-slate-950">
                <div className="grid grid-cols-2 gap-3">
                  {["4 targets", "8 models", "5 stacks", "128k requests"].map((item) => <div key={item} className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-semibold">{item}</div>)}
                </div>
                <div className="mt-4 rounded-md border border-slate-200 p-4">
                  <div className="mb-3 text-sm font-semibold">Fleet health</div>
                  {["Acme Azure GPU Server", "Claims On-Prem Node", "AWS Private AI Node"].map((item, index) => (
                    <div key={item} className="flex items-center justify-between border-t border-slate-100 py-3 text-sm first:border-t-0">
                      <span>{item}</span>
                      <span className={index === 1 ? "text-amber-600" : "text-emerald-600"}>{index === 1 ? "Warning" : "Healthy"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-20 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-2xl font-semibold">The problem</h2>
          <p className="mt-4 leading-7 text-slate-600">Companies are adopting AI across OpenAI, Anthropic, local models, GPU servers, cloud accounts, and internal tools, but operations are fragmented across disconnected systems.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">The solution</h2>
          <p className="mt-4 leading-7 text-slate-600">AI Control Plane gives teams one dashboard to deploy, govern, monitor, and operate enterprise AI infrastructure across private and external environments.</p>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-semibold">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-sm font-semibold text-white">{index + 1}</div>
                <div className="mt-4 text-sm font-semibold">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-semibold">Platform capabilities</h2>
            <p className="mt-3 max-w-2xl text-slate-600">A polished demo surface for investors, clients, and technical partners to understand the long-term platform.</p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Open demo dashboard <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {capabilities.map((item) => <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><CheckCircle2 className="text-emerald-600" size={18} /> <span className="text-sm font-medium">{item}</span></div>)}
        </div>
      </section>
    </main>
  );
}
