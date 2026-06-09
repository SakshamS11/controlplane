"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";
import { DEMO_AUTH_KEY, DEMO_EMAIL_HASH, DEMO_PASSWORD_HASH } from "@/components/ui";

function demoHash(value: string) {
  let hash = 5381;
  for (const char of value) {
    hash = ((hash << 5) + hash) + char.charCodeAt(0);
    hash = hash >>> 0;
  }
  return hash.toString(16);
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem(DEMO_AUTH_KEY) === "true") {
      router.replace("/dashboard");
    }
  }, [router]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (demoHash(email.trim().toLowerCase()) === DEMO_EMAIL_HASH && demoHash(password) === DEMO_PASSWORD_HASH) {
      window.localStorage.setItem(DEMO_AUTH_KEY, "true");
      router.replace("/dashboard");
      return;
    }
    setError("Invalid demo credentials.");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#080d18] px-6 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/8 p-6 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-300 text-slate-950">
            <Lock size={20} />
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-medium text-emerald-100">
            <ShieldCheck size={14} />
            Protected demo
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Sign in to view the demo</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">This Vercel preview is intentionally gated to reduce casual copying or browsing.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-200">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-md border border-white/10 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-cyan-300"
              placeholder="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-200">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-md border border-white/10 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-cyan-300"
              placeholder="Enter demo password"
            />
          </div>
          {error ? <p className="rounded-md border border-red-300/20 bg-red-300/10 px-3 py-2 text-sm text-red-100" role="alert">{error}</p> : null}
          <button className="min-h-11 w-full rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/20 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#080d18]">
            Sign in
          </button>
        </form>

        <p className="mt-5 text-xs leading-5 text-slate-400">Credentials are shared privately by the project owner.</p>
      </section>
    </main>
  );
}
