import React, { useEffect, useRef, useState } from "react";

// Uber-style live map: a stylized campus map with a route that fills in and a
// runner marker that drives from the pickup point toward the drop-off pin as the
// order advances through its stages.
const STAGE_FRACTION = { confirmed: 0.05, assigned: 0.18, picking: 0.33, delivering: 0.74, delivered: 1 };

// Route across a stylised campus (pickup bottom-left → drop-off top-right).
const ROUTE = "M38 168 C 96 168 110 120 150 118 C 196 116 196 64 268 52";

export default function LiveMap({ stage = "confirmed", originLabel = "Runner", destinationLabel = "You" }) {
  const pathRef = useRef(null);
  const [len, setLen] = useState(0);
  const [pt, setPt] = useState({ x: 38, y: 168 });
  const frac = STAGE_FRACTION[stage] ?? 0;

  useEffect(() => { if (pathRef.current) setLen(pathRef.current.getTotalLength()); }, []);
  useEffect(() => {
    if (!pathRef.current || !len) return;
    const p = pathRef.current.getPointAtLength(len * frac);
    setPt({ x: p.x, y: p.y });
  }, [frac, len]);

  const delivered = stage === "delivered";

  return (
    <div className="relative overflow-hidden rounded-3xl ring-1 ring-brand-line/70 shadow-soft">
      <svg viewBox="0 0 320 200" className="block h-56 w-full">
        {/* base */}
        <rect width="320" height="200" fill="#EAF0F7" />
        {/* greens */}
        <rect x="18" y="30" width="60" height="40" rx="8" fill="#E0EFE4" />
        <rect x="240" y="120" width="70" height="60" rx="8" fill="#E0EFE4" />
        {/* building blocks */}
        {[[96,28],[150,40],[210,30],[40,110],[120,150],[250,40],[180,150]].map(([x,y],i)=>(
          <rect key={i} x={x} y={y} width="34" height="26" rx="4" fill="#DCE4EF" />
        ))}
        {/* roads */}
        <g stroke="#fff" strokeWidth="10" strokeLinecap="round" opacity=".9">
          <line x1="0" y1="100" x2="320" y2="100" />
          <line x1="150" y1="0" x2="150" y2="200" />
          <line x1="40" y1="0" x2="40" y2="200" />
          <line x1="260" y1="0" x2="260" y2="200" />
        </g>

        {/* route — remaining (dashed) then progress (solid orange) */}
        <path ref={pathRef} d={ROUTE} fill="none" stroke="#C7D2E1" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="2 9" />
        {len > 0 && (
          <path d={ROUTE} fill="none" stroke="#F26419" strokeWidth="4.5" strokeLinecap="round"
                strokeDasharray={len} strokeDashoffset={len * (1 - frac)}
                style={{ transition: "stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)" }} />
        )}

        {/* pickup dot */}
        <circle cx="38" cy="168" r="5.5" fill="#0F1B33" />
        <circle cx="38" cy="168" r="2.5" fill="#fff" />

        {/* destination pin */}
        <g transform="translate(268 52)">
          {!delivered && <circle r="13" fill="#F26419" opacity=".18"><animate attributeName="r" values="9;17;9" dur="1.8s" repeatCount="indefinite" /></circle>}
          <path d="M0 -13 C 7 -13 11 -8 11 -2 C 11 5 0 12 0 12 C 0 12 -11 5 -11 -2 C -11 -8 -7 -13 0 -13 Z" fill="#0F1B33" />
          <circle cx="0" cy="-3" r="4" fill="#fff" />
        </g>

        {/* runner marker */}
        <g style={{ transform: `translate(${pt.x}px, ${pt.y}px)`, transition: "transform 1.1s cubic-bezier(.22,1,.36,1)" }}>
          <circle r="13" fill="#fff" stroke="#F26419" strokeWidth="2.5" filter="url(#sh)" />
          <text textAnchor="middle" dominantBaseline="central" fontSize="14">{delivered ? "✅" : "🛵"}</text>
        </g>
        <defs>
          <filter id="sh" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0F1B33" floodOpacity="0.25" />
          </filter>
        </defs>
      </svg>

      <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
        <span className="glass rounded-full px-2.5 py-1 text-[11px] font-bold text-brand-ink shadow-soft">📍 {originLabel}</span>
      </div>
      <div className="pointer-events-none absolute right-3 top-3">
        <span className="glass rounded-full px-2.5 py-1 text-[11px] font-bold text-brand-ink shadow-soft">🏁 {destinationLabel}</span>
      </div>
    </div>
  );
}
