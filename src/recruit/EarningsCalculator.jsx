import React, { useMemo, useState } from "react";
import { formatMoney } from "../data/seed.js";
import { Card } from "../components/ui.jsx";

// Interactive earnings estimator. Helps a prospective agent see what the
// opportunity is worth at their chosen volume — same economics the agent app uses
// (full delivery fee + 8% basket margin).
const DELIVERY_FEE = 700;
const MARGIN = 0.08;

export default function EarningsCalculator() {
  const [ordersPerDay, setOrdersPerDay] = useState(20);
  const [avgBasket, setAvgBasket] = useState(6000);
  const [daysPerWeek, setDaysPerWeek] = useState(6);

  const { perOrder, perDay, perWeek, perMonth } = useMemo(() => {
    const perOrder = DELIVERY_FEE + avgBasket * MARGIN;
    const perDay = perOrder * ordersPerDay;
    const perWeek = perDay * daysPerWeek;
    return { perOrder, perDay, perWeek, perMonth: perWeek * 4.3 };
  }, [ordersPerDay, avgBasket, daysPerWeek]);

  return (
    <Card className="overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <div className="p-6">
          <h2 className="text-2xl font-extrabold">What could you earn?</h2>
          <p className="mt-1 text-sm text-slate-500">Drag the sliders to match your plan.</p>

          <div className="mt-6 space-y-6">
            <Slider label="Orders per day" value={ordersPerDay} min={5} max={60} step={1} onChange={setOrdersPerDay} display={ordersPerDay} />
            <Slider label="Average basket" value={avgBasket} min={2000} max={20000} step={500} onChange={setAvgBasket} display={formatMoney(avgBasket)} />
            <Slider label="Days per week" value={daysPerWeek} min={1} max={7} step={1} onChange={setDaysPerWeek} display={daysPerWeek} />
          </div>
        </div>

        <div className="bg-brand-ink p-6 text-white">
          <p className="text-sm text-white/60">Estimated take-home</p>
          <p className="mt-1 text-5xl font-extrabold text-brand-orange">{formatMoney(Math.round(perMonth))}</p>
          <p className="text-sm text-white/60">per month</p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Mini label="Per order" value={formatMoney(Math.round(perOrder))} />
            <Mini label="Per day" value={formatMoney(Math.round(perDay))} />
            <Mini label="Per week" value={formatMoney(Math.round(perWeek))} />
          </div>

          <p className="mt-6 text-xs text-white/40">
            Estimate only. Actual earnings vary with order volume, basket size, ratings, and
            surge windows. Based on the full delivery fee plus an 8% fulfillment margin.
          </p>
        </div>
      </div>
    </Card>
  );
}

function Slider({ label, value, min, max, step, onChange, display }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-sm font-extrabold text-brand-orangeDark">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-orange"
      />
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 p-2">
      <p className="text-sm font-extrabold">{value}</p>
      <p className="text-[11px] text-white/50">{label}</p>
    </div>
  );
}
