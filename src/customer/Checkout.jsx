import React, { useState } from "react";
import { useStore } from "../store.jsx";
import { formatMoney } from "../data/seed.js";
import { Button, Card, Field, inputClass, toast } from "../components/ui.jsx";
import { DELIVERY_FEE } from "./Cart.jsx";
import { pay, paymentsConfigured } from "../lib/payments.js";
import ProductArt from "../components/ProductArt.jsx";

export default function Checkout({ onBack, onPlaced }) {
  const { cartItems, cartSubtotal, customerNeighborhoodId, neighborhoods, placeOrder, user } = useStore();
  const neighborhood = neighborhoods.find((n) => n.id === customerNeighborhoodId);

  const [name, setName] = useState(user?.name && user.name !== "Demo Student" ? user.name : "");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const total = cartSubtotal + DELIVERY_FEE;
  const canPlace = name.trim() && email.trim() && address.trim() && cartItems.length > 0 && customerNeighborhoodId;

  async function payAndPlace() {
    if (!canPlace) return;
    setBusy(true); setError(null);
    try {
      const reference = "in27-" + Date.now();
      const result = await pay({ email: email.trim(), amountNaira: total, reference, metadata: { zone: neighborhood?.name } });
      const order = await placeOrder({
        customerName: name.trim(), neighborhoodId: customerNeighborhoodId, address: address.trim(), note: note.trim(),
        deliveryFee: DELIVERY_FEE,
        items: cartItems.map((i) => ({ id: i.id, name: i.name, emoji: i.emoji, price: i.price, qty: i.qty })),
      });
      toast(result.mode === "demo" ? "Demo payment ✓ — countdown started" : "Payment received ⏱️", "orange");
      onPlaced(order.id);
    } catch (e) {
      setError(e.message || "Payment could not be completed");
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-up pb-10">
      <button onClick={onBack} className="press mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-ink">← Back to store</button>

      <Card className="p-5">
        <h2 className="text-xl font-extrabold">Checkout</h2>
        <p className="mt-0.5 text-sm text-slate-500">Delivering to <span className="font-semibold text-brand-ink">{neighborhood?.name}, {neighborhood?.city}</span> — by your campus runner.</p>

        <div className="mt-5 space-y-4">
          <Field label="Your name"><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ada E." /></Field>
          <Field label="Email" hint="For your receipt and payment."><input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
          <Field label="Delivery address" hint="Hostel / block / landmark on campus."><input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Block C, New Campus Hostels" /></Field>
          <Field label="Note for runner (optional)"><input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Gate code, room number…" /></Field>
        </div>

        <div className="mt-5 rounded-2xl bg-brand-cloud p-4 text-sm">
          {cartItems.map((i) => (
            <div key={i.id} className="flex items-center gap-2 py-1">
              <ProductArt product={i} className="h-8 w-8" rounded="rounded-lg" />
              <span className="flex-1 text-slate-600">{i.name} × {i.qty}</span>
              <span className="font-semibold">{formatMoney(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-brand-line pt-2 text-slate-500"><span>Delivery</span><span>{formatMoney(DELIVERY_FEE)}</span></div>
          <div className="mt-1 flex justify-between text-base font-extrabold"><span>Total</span><span>{formatMoney(total)}</span></div>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

        <Button className="mt-5 w-full" onClick={payAndPlace} disabled={!canPlace || busy}>
          {busy ? "Processing…" : `Pay ${formatMoney(total)}`}
        </Button>
        <p className="mt-2 text-center text-xs text-slate-400">
          🔒 {paymentsConfigured() ? "Secured by Paystack — card, transfer or USSD" : "Demo mode — no real charge. Add a Paystack key to go live."}
        </p>
        {!canPlace && <p className="mt-1 text-center text-xs text-slate-400">Fill your name, email and address to continue.</p>}
      </Card>
    </div>
  );
}
