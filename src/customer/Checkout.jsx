import React, { useState } from "react";
import { useStore } from "../store.jsx";
import { formatMoney } from "../data/seed.js";
import { Button, Card, Field, inputClass, toast } from "../components/ui.jsx";
import { DELIVERY_FEE } from "./Cart.jsx";

// Checkout collects delivery details, then POSTs a real order to the API. The
// order lands unassigned in the customer's neighborhood so the local agent can
// pick it up from their queue.
export default function Checkout({ onBack, onPlaced }) {
  const { cartItems, cartSubtotal, customerNeighborhoodId, neighborhoods, placeOrder, user } = useStore();
  const neighborhood = neighborhoods.find((n) => n.id === customerNeighborhoodId);

  const [name, setName] = useState(user?.name && user.name !== "Demo Customer" ? user.name : "");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const total = cartSubtotal + DELIVERY_FEE;
  const canPlace = name.trim() && address.trim() && cartItems.length > 0 && customerNeighborhoodId;

  async function place() {
    if (!canPlace) return;
    setBusy(true);
    setError(null);
    try {
      const order = await placeOrder({
        customerName: name.trim(),
        neighborhoodId: customerNeighborhoodId,
        address: address.trim(),
        note: note.trim(),
        deliveryFee: DELIVERY_FEE,
        items: cartItems.map((i) => ({ id: i.id, name: i.name, emoji: i.emoji, price: i.price, qty: i.qty })),
      });
      toast("Order placed — 27-min countdown started ⏱️", "orange");
      onPlaced(order.id);
    } catch (e) {
      setError(e.message || "Could not place order");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-up">
      <button onClick={onBack} className="mb-4 text-sm font-semibold text-slate-500 hover:text-brand-ink">
        ← Back to store
      </button>

      <Card className="p-5">
        <h2 className="text-lg font-extrabold">Checkout</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Delivering to <span className="font-semibold text-brand-ink">{neighborhood?.name}, {neighborhood?.city}</span> — fulfilled by your local agent.
        </p>

        <div className="mt-5 space-y-4">
          <Field label="Your name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ada E." />
          </Field>
          <Field label="Delivery address" hint="Street + landmark inside your neighborhood.">
            <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 8 Harmony Road, near the pharmacy" />
          </Field>
          <Field label="Note for agent (optional)">
            <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Gate code, floor, anything helpful" />
          </Field>
        </div>

        <div className="mt-5 rounded-xl bg-brand-cloud p-4 text-sm">
          {cartItems.map((i) => (
            <div key={i.id} className="flex justify-between py-0.5">
              <span className="text-slate-600">{i.emoji} {i.name} × {i.qty}</span>
              <span className="font-semibold">{formatMoney(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-brand-line pt-2 text-slate-500">
            <span>Delivery</span><span>{formatMoney(DELIVERY_FEE)}</span>
          </div>
          <div className="mt-1 flex justify-between text-base font-extrabold">
            <span>Total</span><span>{formatMoney(total)}</span>
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

        <Button className="mt-5 w-full" onClick={place} disabled={!canPlace || busy}>
          {busy ? "Placing…" : "Place order"}
        </Button>
        {!canPlace && <p className="mt-2 text-center text-xs text-slate-400">Add your name and address to continue.</p>}
      </Card>
    </div>
  );
}
