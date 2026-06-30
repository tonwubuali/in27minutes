import React, { useMemo, useState } from "react";
import { useStore } from "../store.jsx";
import { CATEGORIES, formatMoney } from "../data/seed.js";
import { Badge, Button, Card, inputClass, toast, Skeleton } from "../components/ui.jsx";
import ProductArt from "../components/ProductArt.jsx";
import Cart from "./Cart.jsx";
import Checkout from "./Checkout.jsx";
import OrderTracking, { promiseMiss } from "./OrderTracking.jsx";

export default function CustomerApp() {
  const { products, cartCount, cartSubtotal, orders } = useStore();
  const [view, setView] = useState("browse"); // browse | checkout | track
  const [tab, setTab] = useState("shop"); // mobile nav: shop | orders | wallet
  const [trackingId, setTrackingId] = useState(null);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => products.filter((p) => (category === "All" || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase())),
    [products, category, query]
  );
  function goTrack(id) { setTrackingId(id); setView("track"); }

  if (view === "checkout") return <Checkout onBack={() => setView("browse")} onPlaced={goTrack} />;
  if (view === "track" && trackingId) return <OrderTracking orderId={trackingId} onBack={() => { setView("browse"); setTab("orders"); }} />;

  return (
    <div className="pb-24 lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:pb-0">
      {/* main column */}
      <div>
        {/* mobile panels */}
        <div className="lg:hidden">
          {tab === "orders" && <OrdersList orders={orders} onTrack={goTrack} />}
          {tab === "wallet" && <WalletPanel orders={orders} />}
        </div>

        <div className={tab === "shop" ? "block" : "hidden lg:block"}>
          <Storefront
            category={category} setCategory={setCategory} query={query} setQuery={setQuery}
            filtered={filtered} loading={products.length === 0}
          />
        </div>
      </div>

      {/* desktop aside */}
      <aside className="hidden space-y-4 lg:sticky lg:top-20 lg:block lg:self-start">
        <Cart onCheckout={() => setView("checkout")} />
        <WalletCard orders={orders} />
        {orders.length > 0 && <OrdersList orders={orders} onTrack={goTrack} compact />}
      </aside>

      {/* mobile: floating View Cart bar */}
      {cartCount > 0 && tab === "shop" && (
        <button onClick={() => setView("checkout")} className="press fixed inset-x-3 bottom-20 z-30 flex items-center justify-between rounded-2xl bg-brand-orange px-5 py-3.5 text-white shadow-pop animate-fade-up lg:hidden">
          <span className="flex items-center gap-2 text-sm font-bold"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/25 text-xs">{cartCount}</span> View cart</span>
          <span className="text-sm font-extrabold">{formatMoney(cartSubtotal + 500)}</span>
        </button>
      )}

      {/* mobile: bottom tab nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 glass border-t border-brand-line safe-b lg:hidden">
        <div className="mx-auto flex max-w-6xl items-stretch justify-around">
          <TabBtn active={tab === "shop"} onClick={() => setTab("shop")} icon="🏠" label="Shop" />
          <TabBtn active={tab === "orders"} onClick={() => setTab("orders")} icon="📦" label="Orders" badge={orders.filter((o) => o.stage !== "delivered").length} />
          <TabBtn active={tab === "wallet"} onClick={() => setTab("wallet")} icon="₦" label="Wallet" />
        </div>
      </nav>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, badge }) {
  return (
    <button onClick={onClick} className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${active ? "text-brand-orange" : "text-slate-400"}`}>
      <span className="text-lg leading-none">{icon}</span>
      {label}
      {badge > 0 && <span className="absolute right-1/4 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-orange px-1 text-[9px] text-white">{badge}</span>}
    </button>
  );
}

function Storefront({ category, setCategory, query, setQuery, filtered, loading }) {
  return (
    <>
      <Hero />
      {/* sticky search + categories */}
      <div className="sticky top-16 z-20 -mx-4 mt-4 bg-brand-cloud/85 px-4 py-3 backdrop-blur lg:mx-0 lg:px-0">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input className={`${inputClass} pl-10`} placeholder="Search anything — milk, paracetamol, a charger…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`press shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${category === c ? "bg-brand-ink text-white shadow-lift" : "bg-white text-slate-600 ring-1 ring-brand-line"}`}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      ) : (
        <div key={category + query} className="stagger mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          {filtered.length === 0 && <p className="col-span-full py-12 text-center text-sm text-slate-400">Nothing matches “{query}”.</p>}
        </div>
      )}
    </>
  );
}

function Hero() {
  const { customerNeighborhoodId, neighborhoods, setCustomerNeighborhood } = useStore();
  return (
    <Card className="overflow-hidden border-0 animate-scale-in">
      <div className="relative bg-gradient-to-br from-brand-ink to-brand-ink2 px-5 py-7 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brand-orange/25 blur-2xl" />
        <Badge tone="orange" className="animate-fade-down">● Now live at MOUAU</Badge>
        <h1 className="mt-3 text-[26px] font-extrabold leading-[1.1] tracking-tightest">Anything across campus<br />in <span className="text-brand-orange">27 minutes</span></h1>
        <p className="mt-1.5 max-w-md text-sm text-white/65">Fulfilled by a student runner in your zone.</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm backdrop-blur">
          <span className="text-white/55">Deliver to</span>
          <select value={customerNeighborhoodId || ""} onChange={(e) => setCustomerNeighborhood(e.target.value)} className="rounded-lg bg-white px-2 py-1 font-semibold text-brand-ink outline-none">
            {neighborhoods.map((n) => <option key={n.id} value={n.id}>{n.name} · {n.city}</option>)}
          </select>
        </div>
      </div>
    </Card>
  );
}

function ProductCard({ product }) {
  const { addToCart, cart } = useStore();
  const inCart = cart[product.id] || 0;
  return (
    <Card hover className="group flex flex-col overflow-hidden p-0">
      <div className="relative">
        <ProductArt product={product} className="h-28 w-full" rounded="rounded-none" />
        <button
          onClick={() => { addToCart(product.id); toast(`Added ${product.name}`, "orange"); }}
          className={`press absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full text-lg font-bold shadow-lift transition ${inCart ? "bg-brand-ink text-white" : "bg-white text-brand-ink"}`}
        >
          {inCart ? <span key={inCart} className="animate-pop text-sm">{inCart}</span> : "+"}
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-sm font-semibold leading-snug">{product.name}</p>
        <p className="text-xs text-slate-400">per {product.unit}</p>
        <span className="mt-1.5 text-[15px] font-extrabold">{formatMoney(product.price)}</span>
      </div>
    </Card>
  );
}

function OrdersList({ orders, onTrack, compact }) {
  if (orders.length === 0) return compact ? null : (
    <Card className="p-10 text-center"><p className="text-3xl">📦</p><p className="mt-2 font-bold">No orders yet</p><p className="text-sm text-slate-500">Your orders will show up here.</p></Card>
  );
  return (
    <Card className="p-4 animate-fade-up">
      <h3 className="mb-3 text-sm font-bold">{compact ? "Your orders" : "Orders"}</h3>
      <div className="space-y-2">
        {orders.map((o) => {
          const { missed } = promiseMiss(o);
          return (
            <button key={o.id} onClick={() => onTrack(o.id)} className="press flex w-full items-center justify-between rounded-2xl bg-brand-cloud px-3 py-2.5 text-left text-sm hover:bg-brand-line/40">
              <span className="font-semibold">#{o.id.replace("ord-", "")} · {o.items.length} items</span>
              <Badge tone={o.stage === "delivered" ? (missed ? "orange" : "green") : "blue"}>{o.stage === "delivered" ? (missed ? "Cashback" : "Delivered") : "Track"}</Badge>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function WalletCard({ orders }) {
  const cashback = orders.reduce((n, o) => n + promiseMiss(o).cashback, 0);
  if (cashback <= 0) return null;
  return (
    <Card className="flex items-center gap-3 bg-emerald-50 p-4 ring-emerald-200 animate-scale-in">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-lg font-bold text-white">₦</span>
      <div>
        <p className="text-xs font-semibold text-emerald-700">in27 wallet · cashback</p>
        <p className="text-xl font-extrabold text-emerald-800">{formatMoney(cashback)}</p>
      </div>
    </Card>
  );
}

function WalletPanel({ orders }) {
  const cashback = orders.reduce((n, o) => n + promiseMiss(o).cashback, 0);
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white">
          <p className="text-sm text-white/70">in27 wallet</p>
          <p className="mt-1 text-4xl font-extrabold">{formatMoney(cashback)}</p>
          <p className="mt-1 text-sm text-white/70">Cashback from missed 27-min promises.</p>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="mb-1 text-sm font-bold">How cashback works</h3>
        <p className="text-sm text-slate-500">If a delivery takes longer than 27 minutes, we automatically credit the delivery fee back to your wallet — no claim needed.</p>
      </Card>
    </div>
  );
}
