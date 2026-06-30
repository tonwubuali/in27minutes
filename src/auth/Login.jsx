import React, { useState } from "react";
import { useStore } from "../store.jsx";
import { Logo, BrandMark, Button, Field, inputClass } from "../components/ui.jsx";

// Single sign-in for all surfaces — the user's role decides which app they land
// in. Demo accounts are one click away. Localized for the MOUAU launch.
const DEMO = [
  { label: "Student", email: "customer@in27minutes.com", tone: "bg-brand-orange/10 text-brand-orangeDark" },
  { label: "Runner · New Campus", email: "chidinma@in27minutes.com", tone: "bg-blue-100 text-blue-700" },
  { label: "Runner · Old Campus", email: "emeka@in27minutes.com", tone: "bg-blue-100 text-blue-700" },
  { label: "Admin", email: "admin@in27minutes.com", tone: "bg-brand-ink/10 text-brand-ink" },
];

export default function Login({ onBecomeAgent }) {
  const { login, authError } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e?.preventDefault();
    setBusy(true);
    try { await login(email.trim(), password); } catch {} finally { setBusy(false); }
  }
  async function quick(demoEmail) {
    setEmail(demoEmail); setPassword("demo1234"); setBusy(true);
    try { await login(demoEmail, "demo1234"); } catch {} finally { setBusy(false); }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-ink p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative animate-fade-down"><Logo size={32} light /></div>
        <div className="relative">
          <div className="mb-6 inline-flex animate-float"><BrandMark size={92} /></div>
          <h1 className="animate-fade-up text-4xl font-extrabold leading-tight">
            Anything across <span className="text-brand-orange">MOUAU</span>,<br />delivered in 27 minutes.
          </h1>
          <p className="mt-3 max-w-md animate-fade-up text-white/60" style={{ animationDelay: "80ms" }}>
            One platform, three views: students order, campus runners fulfill, and ops runs the
            network across Umudike. Sign in to any of them.
          </p>
        </div>
        <p className="relative text-xs text-white/30">Now launching at Michael Okpara University of Agriculture, Umudike</p>
      </div>

      {/* Form */}
      <div className="grid place-items-center p-6">
        <div className="w-full max-w-sm animate-scale-in">
          <div className="mb-6 lg:hidden"><Logo size={28} /></div>
          <h2 className="text-2xl font-extrabold">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Use a demo account or your credentials.</p>

          <div className="mt-5 grid grid-cols-2 gap-2 stagger">
            {DEMO.map((d, i) => (
              <button
                key={d.email}
                style={{ "--i": i }}
                onClick={() => quick(d.email)}
                disabled={busy}
                className={`press rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50 ${d.tone}`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-brand-line" /> or <span className="h-px flex-1 bg-brand-line" />
          </div>

          <form className="space-y-3" onSubmit={submit}>
            <Field label="Email">
              <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@in27minutes.com" autoComplete="username" />
            </Field>
            <Field label="Password">
              <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </Field>
            {authError && <p className="animate-fade-in text-sm font-medium text-red-600">{authError}</p>}
            <Button type="submit" className="w-full" disabled={busy || !email || !password}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Want to earn as a campus runner?{" "}
            <button onClick={onBecomeAgent} className="font-bold text-brand-orange hover:underline">Become a runner →</button>
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">All demo accounts use password <code>demo1234</code></p>
        </div>
      </div>
    </div>
  );
}
