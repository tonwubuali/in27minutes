import React from "react";

// Consistent, on-brand vector illustrations for each product. Duotone: navy
// (#0F1B33) line/shape + orange (#F26419) accent on a soft tinted panel.
// Rendered inside a square; scales crisply at any size.

const INK = "#0F1B33";
const ORANGE = "#F26419";

const ART = {
  "p-milk": (
    <g>
      <path d="M22 26h20l-2-8-3-4h-10l-3 4z" fill="#fff" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="22" y="26" width="20" height="24" rx="2.5" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <rect x="26" y="33" width="12" height="10" rx="1.5" fill={ORANGE} opacity=".9" />
    </g>
  ),
  "p-bread": (
    <g>
      <path d="M16 34c0-7 6-12 16-12s16 5 16 12v2a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3z" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <path d="M24 24c0 4 0 12 0 17M32 22v19M40 24c0 4 0 12 0 17" stroke={ORANGE} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  ),
  "p-eggs": (
    <g>
      <rect x="14" y="34" width="36" height="12" rx="3" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <ellipse cx="23" cy="30" rx="6" ry="8" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <ellipse cx="32" cy="28" rx="6" ry="8" fill={ORANGE} opacity=".9" />
      <ellipse cx="41" cy="30" rx="6" ry="8" fill="#fff" stroke={INK} strokeWidth="2.2" />
    </g>
  ),
  "p-rice": (
    <g>
      <path d="M20 24h24l-2 26a2 2 0 0 1-2 2H24a2 2 0 0 1-2-2z" fill="#fff" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="26" y="30" width="12" height="10" rx="1.5" fill={ORANGE} opacity=".9" />
      <path d="M22 24c0-4 4-6 10-6s10 2 10 6" fill="none" stroke={INK} strokeWidth="2.2" />
    </g>
  ),
  "p-banana": (
    <g>
      <path d="M16 26c2 14 12 22 26 20-6 4-22 4-27-7-2-5-1-11 1-13z" fill={ORANGE} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M42 44c0-2 1-3 3-4" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  ),
  "p-parac": (
    <g>
      <rect x="18" y="20" width="28" height="24" rx="3" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <g fill={ORANGE}><circle cx="25" cy="27" r="2.6"/><circle cx="32" cy="27" r="2.6"/><circle cx="39" cy="27" r="2.6"/><circle cx="25" cy="37" r="2.6"/><circle cx="32" cy="37" r="2.6"/><circle cx="39" cy="37" r="2.6"/></g>
    </g>
  ),
  "p-plaster": (
    <g>
      <rect x="16" y="26" width="32" height="12" rx="6" transform="rotate(-30 32 32)" fill={ORANGE} stroke={INK} strokeWidth="2.2" />
      <rect x="27" y="27" width="10" height="10" rx="2" transform="rotate(-30 32 32)" fill="#fff" stroke={INK} strokeWidth="1.6" />
    </g>
  ),
  "p-vitc": (
    <g>
      <circle cx="28" cy="32" r="13" fill={ORANGE} stroke={INK} strokeWidth="2.2" />
      <path d="M28 19v26M15 32h26" stroke="#fff" strokeWidth="2" opacity=".5" />
      <circle cx="42" cy="22" r="6" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <path d="M42 19v6M39 22h6" stroke={ORANGE} strokeWidth="2" />
    </g>
  ),
  "p-water": (
    <g>
      <path d="M27 17h10v5l2 4v24a2 2 0 0 1-2 2H27a2 2 0 0 1-2-2V26l2-4z" fill="#fff" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="25" y="34" width="14" height="12" fill={ORANGE} opacity=".85" />
      <rect x="28" y="13" width="8" height="4" rx="1" fill={INK} />
    </g>
  ),
  "p-coffee": (
    <g>
      <path d="M20 28h20v10a10 10 0 0 1-20 0z" fill="#fff" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M40 30h4a4 4 0 0 1 0 8h-4" fill="none" stroke={INK} strokeWidth="2.2" />
      <path d="M26 22c0-2 2-2 2-4M32 22c0-2 2-2 2-4" stroke={ORANGE} strokeWidth="2.2" strokeLinecap="round" />
      <rect x="20" y="34" width="20" height="4" fill={ORANGE} opacity=".85" />
    </g>
  ),
  "p-chips": (
    <g>
      <path d="M22 18h20l-2 32a2 2 0 0 1-2 2H26a2 2 0 0 1-2-2z" fill={ORANGE} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="26" y="26" width="12" height="14" rx="2" fill="#fff" opacity=".9" />
    </g>
  ),
  "p-juice": (
    <g>
      <path d="M24 24h16v26a2 2 0 0 1-2 2H26a2 2 0 0 1-2-2z" fill={ORANGE} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M24 24l4-8h8l4 8" fill="#fff" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M40 14l2 14" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  ),
  "p-charger": (
    <g>
      <rect x="22" y="20" width="20" height="20" rx="4" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <rect x="28" y="14" width="3" height="7" rx="1.5" fill={INK} /><rect x="33" y="14" width="3" height="7" rx="1.5" fill={INK} />
      <path d="M32 40v6a4 4 0 0 0 4 4h4" fill="none" stroke={ORANGE} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="32" cy="30" r="3.5" fill={ORANGE} />
    </g>
  ),
  "p-cable": (
    <g>
      <rect x="26" y="14" width="12" height="9" rx="2" fill={INK} />
      <path d="M32 23v8c0 6-10 6-10 12s12 7 12 0" fill="none" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" />
      <rect x="29" y="44" width="6" height="8" rx="2" fill={INK} />
    </g>
  ),
  "p-bulb": (
    <g>
      <path d="M32 14a13 13 0 0 0-8 23c2 2 3 3 3 6h10c0-3 1-4 3-6a13 13 0 0 0-8-23z" fill={ORANGE} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="27" y="44" width="10" height="5" rx="1.5" fill={INK} /><rect x="28" y="49" width="8" height="3" rx="1.5" fill={INK} />
      <path d="M28 28a5 5 0 0 1 8 0" fill="none" stroke="#fff" strokeWidth="2" />
    </g>
  ),
  "p-tissue": (
    <g>
      <ellipse cx="32" cy="24" rx="13" ry="5" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <path d="M19 24v18c0 3 6 5 13 5s13-2 13-5V24" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <ellipse cx="32" cy="24" rx="5" ry="2" fill={ORANGE} />
      <path d="M32 29v14" stroke={ORANGE} strokeWidth="2" opacity=".6" />
    </g>
  ),
  "p-soap": (
    <g>
      <rect x="24" y="28" width="16" height="22" rx="3" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <rect x="29" y="18" width="6" height="6" rx="1.5" fill={INK} />
      <path d="M35 21h6v4h-6" fill="none" stroke={INK} strokeWidth="2.2" />
      <rect x="27" y="38" width="10" height="9" rx="1.5" fill={ORANGE} opacity=".9" />
    </g>
  ),
  "p-detergent": (
    <g>
      <rect x="20" y="22" width="24" height="28" rx="3" fill={ORANGE} stroke={INK} strokeWidth="2.2" />
      <rect x="25" y="29" width="14" height="9" rx="1.5" fill="#fff" />
      <circle cx="32" cy="33.5" r="3" fill={ORANGE} />
    </g>
  ),
};

const CATEGORY_TINT = {
  Groceries: "#FFF3EC",
  Pharmacy: "#EAF3FF",
  "Food & Drinks": "#FFF7E8",
  Electronics: "#EFEFFB",
  Home: "#EAF7F0",
};

export default function ProductArt({ product, className = "", rounded = "rounded-xl" }) {
  const art = ART[product.id];
  const tint = CATEGORY_TINT[product.category] || "#F1F5F9";
  return (
    <div className={`grid place-items-center overflow-hidden ${rounded} ${className}`} style={{ background: tint }}>
      <svg viewBox="0 0 64 64" className="h-[78%] w-[78%]" aria-label={product.name} role="img">
        {art || <text x="32" y="38" textAnchor="middle" fontSize="22">{product.emoji}</text>}
      </svg>
    </div>
  );
}
