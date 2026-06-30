import React, { useEffect, useRef, useState } from "react";
import { PROMISE_MINUTES } from "../data/seed.js";

// ---------------------------------------------------------------------------
// Shared UI kit + motion primitives. Dependency-free; animations come from the
// Tailwind keyframes defined in index.html plus a couple of tiny hooks here.
// ---------------------------------------------------------------------------

// Faithful SVG re-creation of the in27minutes mark: a speed-clock with motion
// lines. Scales crisply and themes with the brand palette.
export function BrandMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g stroke="#F26419" strokeWidth="3.2" strokeLinecap="round">
        <line x1="3" y1="17" x2="15" y2="17" />
        <line x1="1.5" y1="24" x2="13" y2="24" />
        <line x1="5" y1="31" x2="15" y2="31" />
      </g>
      <circle cx="30" cy="24" r="15.5" stroke="#0F1B33" strokeWidth="3.2" fill="white" />
      <line x1="30" y1="24" x2="39.5" y2="15.5" stroke="#F26419" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="30" cy="24" r="3" fill="#F26419" />
      <circle cx="30" cy="10.6" r="1.5" fill="#0F1B33" />
      <circle cx="43.2" cy="24" r="1.5" fill="#0F1B33" />
    </svg>
  );
}

export function Logo({ size = 34, withWordmark = true, light = false }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <BrandMark size={size} />
      {withWordmark && (
        <span
          className={`font-extrabold tracking-tight ${light ? "text-white" : "text-brand-ink"}`}
          style={{ fontSize: size * 0.58 }}
        >
          in<span className="text-brand-orange">27</span>minutes
        </span>
      )}
    </div>
  );
}

export function Badge({ children, tone = "ink", className = "" }) {
  const tones = {
    ink: "bg-brand-ink/10 text-brand-ink",
    orange: "bg-brand-orange/15 text-brand-orangeDark",
    green: "bg-emerald-100 text-emerald-700",
    gray: "bg-slate-100 text-slate-600",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-brand-orange hover:bg-brand-orangeDark text-white shadow-sm shadow-brand-orange/30",
    dark: "bg-brand-ink hover:bg-brand-ink2 text-white",
    ghost: "bg-transparent hover:bg-brand-ink/5 text-brand-ink",
    outline: "border border-brand-line hover:border-brand-ink/40 bg-white text-brand-ink",
  };
  return (
    <button
      className={`press inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "", hover = false, style }) {
  return (
    <div style={style} className={`rounded-2xl border border-brand-line bg-white ${hover ? "lift" : ""} ${className}`}>
      {children}
    </div>
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
  "w-full rounded-xl border border-brand-line bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20";

export function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

// Reveal on scroll: fades/slides children up the first time they enter view.
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? undefined : 0,
        animation: shown ? `fade-up .6s cubic-bezier(.22,1,.36,1) both` : "none",
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

// --- Toasts (no provider needed; fire with toast(), render <ToastHost/> once) ---
export function toast(message, tone = "ink") {
  window.dispatchEvent(new CustomEvent("in27toast", { detail: { message, tone, id: Date.now() + Math.random() } }));
}

export function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const on = (e) => {
      const t = e.detail;
      setItems((cur) => [...cur, t]);
      setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== t.id)), 2800);
    };
    window.addEventListener("in27toast", on);
    return () => window.removeEventListener("in27toast", on);
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`animate-fade-up rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg ${
            t.tone === "green" ? "bg-emerald-600 text-white" : t.tone === "orange" ? "bg-brand-orange text-white" : "bg-brand-ink text-white"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// --- 27-minute countdown ---
export function useCountdown(placedAt, minutes = PROMISE_MINUTES) {
  const target = placedAt + minutes * 60 * 1000;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const totalMs = minutes * 60 * 1000;
  const remainingMs = Math.max(0, target - now);
  const passed = now >= target;
  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000);
  return { label: `${mm}:${String(ss).padStart(2, "0")}`, passed, remainingMs, fraction: remainingMs / totalMs };
}

export function CountdownPill({ placedAt, delivered }) {
  const { label, passed } = useCountdown(placedAt);
  if (delivered) return <Badge tone="green">Delivered ✓</Badge>;
  if (passed) return <Badge tone="gray">Window passed</Badge>;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-ink px-3 py-1 text-xs font-bold text-white">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-orange" />
      </span>
      {label} left
    </span>
  );
}

// Animated circular countdown for the tracking screen.
export function CountdownRing({ placedAt, size = 168 }) {
  const { label, passed, fraction } = useCountdown(placedAt);
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, fraction)));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.15)" strokeWidth="8" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="#F26419" strokeWidth="8" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute text-center">
        {passed ? (
          <span className="text-xl font-extrabold text-white">Almost<br/>there</span>
        ) : (
          <>
            <span className="block text-4xl font-extrabold tabular-nums text-white">{label}</span>
            <span className="text-[11px] uppercase tracking-wide text-white/50">to your door</span>
          </>
        )}
      </div>
    </div>
  );
}
