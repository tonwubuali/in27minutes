import React, { useEffect, useState } from "react";
import { PROMISE_MINUTES } from "../data/seed.js";

// Small, dependency-free UI primitives shared across all three surfaces.

export function Logo({ size = 28, withWordmark = true }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <span
        className="grid place-items-center rounded-xl bg-brand-ink text-white font-extrabold"
        style={{ width: size + 8, height: size + 8, fontSize: size * 0.5 }}
      >
        27
      </span>
      {withWordmark && (
        <span className="font-extrabold tracking-tight" style={{ fontSize: size * 0.62 }}>
          in<span className="text-brand-orange">27</span>minutes
        </span>
      )}
    </div>
  );
}

export function Badge({ children, tone = "ink" }) {
  const tones = {
    ink: "bg-brand-ink/10 text-brand-ink",
    orange: "bg-brand-orange/15 text-brand-orangeDark",
    green: "bg-emerald-100 text-emerald-700",
    gray: "bg-slate-100 text-slate-600",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-brand-orange hover:bg-brand-orangeDark text-white shadow-sm",
    dark: "bg-brand-ink hover:bg-brand-ink/90 text-white",
    ghost: "bg-transparent hover:bg-brand-ink/5 text-brand-ink",
    outline: "border border-brand-line hover:border-brand-ink/30 bg-white text-brand-ink",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-brand-line bg-white ${className}`}>{children}</div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-brand-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-brand-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20";

// Live countdown toward the 27-minute promise for a given placedAt timestamp.
// Returns minutes:seconds remaining and a flag once the window has passed.
export function useCountdown(placedAt, minutes = PROMISE_MINUTES) {
  const target = placedAt + minutes * 60 * 1000;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const remainingMs = Math.max(0, target - now);
  const passed = now >= target;
  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000);
  return { label: `${mm}:${String(ss).padStart(2, "0")}`, passed, remainingMs };
}

export function CountdownPill({ placedAt, delivered }) {
  const { label, passed } = useCountdown(placedAt);
  if (delivered) return <Badge tone="green">Delivered ✓</Badge>;
  if (passed) return <Badge tone="gray">Window passed</Badge>;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-ink px-3 py-1 text-xs font-bold text-white">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-orange" />
      {label} left
    </span>
  );
}
