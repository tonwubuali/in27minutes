import React, { useState } from "react";
import { useStore } from "../store.jsx";
import { Logo, Button, Card, Field, inputClass } from "../components/ui.jsx";

// Single sign-in for all surfaces — the user's role (returned by the API)
// decides which app they land in. Demo accounts are one click away.
const DEMO = [
  { label: "Customer", email: "customer@in27minutes.com", tone: "bg-brand-orange/10 text-brand-orangeDark" },
  { label: "Agent · Greenview", email: "amara@in27minutes.com", tone: "bg-blue-100 text-blue-700" },
  { label: "Agent · Lekki", email: "tunde@in27minutes.com", tone: "bg-blue-100 text-blue-700" },
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
    try {
      await login(email.trim(), password);
    } catch {
      /* authError shown below */
    } finally {
      setBusy(false);
    }
  }

  async function quick(demoEmail) {
    setEmail(demoEmail);
    setPassword("demo1234");
    setBusy(true);
    try {
      await login(demoEmail, "demo1234");
    } catch {
      /* shown below */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between bg-brand-ink p-10 text-white lg:flex">
        <Logo size={30} />
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">
            Anything, delivered in <span className="text-brand-orange">27 minutes</span>.
          </h1>
          <p className="mt-3 max-w-md text-white/60">
            One platform, three views: customers order, neighborhood field agents fulfill, and
            ops runs the network. Sign in to any of them.
          </p>
        </div>
        <p className="text-xs text-white/30">AI-native hyperlocal commerce</p>
      </div>

      {/* Form */}
      <div className="grid place-items-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <Logo size={28} />
          </div>
          <h2 className="text-2xl font-extrabold">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Use a demo account or your credentials.</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {DEMO.map((d) => (
              <button
                key={d.email}
                onClick={() => quick(d.email)}
                disabled={busy}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50 ${d.tone}`}
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
            {authError && <p className="text-sm font-medium text-red-600">{authError}</p>}
            <Button type="submit" className="w-full" disabled={busy || !email || !password}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Want to fulfill orders in your area?{" "}
            <button onClick={onBecomeAgent} className="font-bold text-brand-orange hover:underline">
              Become an agent →
            </button>
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">All demo accounts use password <code>demo1234</code></p>
        </div>
      </div>
    </div>
  );
}
