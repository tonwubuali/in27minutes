import React, { useState } from "react";
import { useStore } from "../store.jsx";
import { BrandMark, Button } from "../components/ui.jsx";

const KEY = "in27:onboarded";
export function needsOnboarding() {
  try { return !localStorage.getItem(KEY); } catch { return false; }
}
function markDone() { try { localStorage.setItem(KEY, "1"); } catch {} }

// First-run student onboarding: welcome → pick campus zone → the promise.
export default function Onboarding({ onDone }) {
  const { neighborhoods, customerNeighborhoodId, setCustomerNeighborhood } = useStore();
  const [step, setStep] = useState(0);
  const steps = ["welcome", "zone", "promise"];

  function finish() { markDone(); onDone(); }
  const next = () => (step < 2 ? setStep(step + 1) : finish());

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-ink to-brand-ink2" />
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-brand-orange/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-sheet-up rounded-t-3xl bg-white p-6 shadow-float safe-b sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-brand-line sm:hidden" />

        {steps[step] === "welcome" && (
          <div className="text-center animate-fade-in">
            <div className="mx-auto mb-4 inline-flex animate-float"><BrandMark size={72} /></div>
            <h2 className="text-2xl font-extrabold">Welcome to in27minutes</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">Anything you need on campus — groceries, pharmacy, snacks, essentials — delivered by a student runner in 27 minutes.</p>
          </div>
        )}

        {steps[step] === "zone" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-extrabold">Where are you on campus?</h2>
            <p className="mt-1 text-sm text-slate-500">We'll match you with a runner in your zone.</p>
            <div className="mt-4 grid gap-2">
              {neighborhoods.map((n) => {
                const active = customerNeighborhoodId === n.id;
                return (
                  <button key={n.id} onClick={() => setCustomerNeighborhood(n.id)} className={`press flex items-center justify-between rounded-2xl border p-3.5 text-left text-sm transition ${active ? "border-brand-orange bg-brand-orange/5" : "border-brand-line"}`}>
                    <span><span className="font-semibold">{n.name}</span> <span className="text-slate-400">· {n.city}</span></span>
                    <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${active ? "bg-brand-orange text-white" : "ring-1 ring-brand-line"}`}>{active ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {steps[step] === "promise" && (
          <div className="text-center animate-fade-in">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-orange/10 text-3xl">⏱️</div>
            <h2 className="text-2xl font-extrabold">The 27-minute promise</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">Every order is timed. If your runner takes longer than 27 minutes, we credit your delivery fee back as <span className="font-semibold text-emerald-700">cashback</span> — automatically.</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-brand-orange" : "w-1.5 bg-brand-line"}`} />)}
          </div>
          <div className="flex gap-2">
            {step === 0 && <button onClick={finish} className="px-3 text-sm font-semibold text-slate-400 hover:text-brand-ink">Skip</button>}
            <Button onClick={next}>{step < 2 ? "Continue" : "Start ordering"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
