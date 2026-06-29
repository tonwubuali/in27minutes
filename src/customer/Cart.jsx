import React from "react";
import { useStore } from "../store.jsx";
import { formatMoney } from "../data/seed.js";
import { Button, Card } from "../components/ui.jsx";

export const DELIVERY_FEE = 700;

export default function Cart({ onCheckout }) {
  const { cartItems, cartSubtotal, setCartQty, clearCart } = useStore();

  return (
    <Card className="p-4">
      <div id="cart-anchor" />
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold">Your cart</h3>
        {cartItems.length > 0 && (
          <button className="text-xs font-semibold text-slate-400 hover:text-brand-orange" onClick={clearCart}>
            Clear
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">Cart is empty. Add something to get started.</p>
      ) : (
        <>
          <div className="space-y-2">
            {cartItems.map((i) => (
              <div key={i.id} className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-cloud text-lg">{i.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold leading-tight">{i.name}</p>
                  <p className="text-xs text-slate-400">{formatMoney(i.price)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <QtyBtn onClick={() => setCartQty(i.id, i.qty - 1)}>−</QtyBtn>
                  <span className="w-5 text-center text-sm font-bold">{i.qty}</span>
                  <QtyBtn onClick={() => setCartQty(i.id, i.qty + 1)}>+</QtyBtn>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 border-t border-brand-line pt-3 text-sm">
            <Row label="Subtotal" value={formatMoney(cartSubtotal)} />
            <Row label="Delivery" value={formatMoney(DELIVERY_FEE)} />
            <Row label="Total" value={formatMoney(cartSubtotal + DELIVERY_FEE)} bold />
          </div>

          <Button className="mt-4 w-full" onClick={onCheckout}>
            Checkout · 27-min delivery
          </Button>
        </>
      )}
    </Card>
  );
}

function QtyBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-lg border border-brand-line text-base font-bold text-brand-ink hover:border-brand-ink/40"
    >
      {children}
    </button>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? "font-extrabold" : "text-slate-500"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
