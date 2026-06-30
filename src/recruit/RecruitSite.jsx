import React, { useState } from "react";
import { useStore } from "../store.jsx";
import { Badge, Button, Card, Field, inputClass } from "../components/ui.jsx";
import EarningsCalculator from "./EarningsCalculator.jsx";

// The supply-side site. in27minutes doesn't onboard businesses — it recruits
// field agents who own fulfillment for a neighborhood. Public (no login). Submits
// applications to the API, where an admin reviews and approves them.
export default function RecruitSite() {
  const { neighborhoods, submitApplication } = useStore();
  const [form, setForm] = useState({ name: "", phone: "", neighborhoodId: "", hasStorage: "yes", vehicle: "bike" });
  const [submitted, setSubmitted] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Default neighborhood once the list loads.
  const nbId = form.neighborhoodId || neighborhoods[0]?.id || "";
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.name.trim() && form.phone.trim() && nbId;

  async function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const application = await submitApplication({
        name: form.name.trim(),
        phone: form.phone.trim(),
        neighborhoodId: nbId,
        hasStorage: form.hasStorage,
        vehicle: form.vehicle,
      });
      setSubmitted({ ...application, neighborhoodName: neighborhoods.find((n) => n.id === nbId)?.name });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Could not submit application");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <Card className="p-8">
          <p className="text-4xl">🎯</p>
          <h2 className="mt-3 text-2xl font-extrabold">You're in the pipeline, {submitted.name.split(" ")[0]}!</h2>
          <p className="mt-2 text-slate-500">
            We've received your application to run fulfillment in{" "}
            <span className="font-semibold text-brand-ink">{submitted.neighborhoodName}</span>. Our
            team reviews new agents and will reach you on {submitted.phone}.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Badge tone="blue">Status: pending review</Badge>
          </div>
          <Button variant="outline" className="mt-6" onClick={() => { setSubmitted(null); setForm({ name: "", phone: "", neighborhoodId: "", hasStorage: "yes", vehicle: "bike" }); }}>
            Submit another
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid items-center gap-6 lg:grid-cols-2">
        <div className="animate-fade-up">
          <Badge tone="orange">● Now hiring MOUAU campus runners</Badge>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight">
            Earn between classes <br />as a <span className="text-brand-orange">campus runner</span>.
          </h1>
          <p className="mt-3 max-w-md text-slate-500">
            in27minutes is built on people, not warehouses. As a runner you own fulfillment for
            your zone at MOUAU — hold fast-moving stock, pick orders, and deliver across campus in
            under 27 minutes. Earn on every order and set your own hours around your timetable.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => document.querySelector("#apply")?.scrollIntoView({ behavior: "smooth" })}>
              Apply to become a runner
            </Button>
            <Button variant="outline" onClick={() => document.querySelector("#calc")?.scrollIntoView({ behavior: "smooth" })}>
              Estimate your earnings
            </Button>
          </div>
        </div>
        <Card className="bg-brand-ink p-6 text-white">
          <div className="grid grid-cols-3 gap-4 text-center">
            <HeroStat stat="₦0" label="to start" />
            <HeroStat stat="8%" label="+ delivery fee" />
            <HeroStat stat="27 min" label="the promise" />
          </div>
          <div className="mt-6 space-y-3 text-sm">
            {[
              "Earn the full delivery fee on every order",
              "Plus 8% fulfillment margin on each basket",
              "Priority routing as your rating climbs",
              "Weekly payouts, flexible hours",
            ].map((t) => (
              <p key={t} className="flex items-start gap-2 text-white/80">
                <span className="text-brand-orange">✓</span> {t}
              </p>
            ))}
          </div>
        </Card>
      </div>

      <section>
        <h2 className="text-center text-2xl font-extrabold">How being a runner works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="p-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-orange/15 font-extrabold text-brand-orangeDark">
                {i + 1}
              </span>
              <p className="mt-3 font-bold">{s.title}</p>
              <p className="mt-1 text-sm text-slate-500">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="calc">
        <EarningsCalculator />
      </section>

      <section id="apply" className="mx-auto max-w-lg">
        <Card className="p-6">
          <h2 className="text-2xl font-extrabold">Apply to become a runner</h2>
          <p className="mt-1 text-sm text-slate-500">Takes two minutes. No fees, ever.</p>

          <form className="mt-5 space-y-4" onSubmit={submit}>
            <Field label="Full name">
              <input className={inputClass} value={form.name} onChange={set("name")} placeholder="e.g. Ada Eze" />
            </Field>
            <Field label="Phone / WhatsApp">
              <input className={inputClass} value={form.phone} onChange={set("phone")} placeholder="e.g. 0803 000 0000" />
            </Field>
            <Field label="Which campus zone will you cover?">
              <select className={inputClass} value={nbId} onChange={set("neighborhoodId")}>
                {neighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>{n.name}, {n.city}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Storage space?">
                <select className={inputClass} value={form.hasStorage} onChange={set("hasStorage")}>
                  <option value="yes">Yes, I have space</option>
                  <option value="no">Not yet</option>
                </select>
              </Field>
              <Field label="Delivery method">
                <select className={inputClass} value={form.vehicle} onChange={set("vehicle")}>
                  <option value="bike">Motorbike</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="foot">On foot</option>
                  <option value="car">Car</option>
                </select>
              </Field>
            </div>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={!canSubmit || busy}>
              {busy ? "Submitting…" : "Submit application"}
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
}

function HeroStat({ stat, label }) {
  return (
    <div>
      <p className="text-2xl font-extrabold text-brand-orange">{stat}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

const STEPS = [
  { title: "Apply & get verified", body: "Tell us your neighborhood and how you'll deliver. We verify and onboard new agents quickly." },
  { title: "Stock your patch", body: "Hold a starter set of fast-moving local items so orders ship instantly — no warehouse trip." },
  { title: "Fulfill in 27 min", body: "Orders in your area land in your app. Pick, pack, and deliver before the timer runs out." },
  { title: "Get paid weekly", body: "Keep the delivery fee plus an 8% basket margin. Higher ratings unlock more orders." },
];
