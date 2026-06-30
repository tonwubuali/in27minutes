// Payment helper. Uses Paystack Inline (the standard for Nigeria — cards, bank
// transfer, USSD) when a public key is configured. With no key it falls back to
// a no-charge demo so the app stays fully usable out of the box.
//
// To go live: set VITE_PAYSTACK_PUBLIC_KEY in your Vercel env (test key pk_test_…
// or live key pk_live_…). The customer enters their own card in Paystack's secure
// popup — the app never handles card details.

let scriptPromise = null;
function loadPaystack() {
  if (window.PaystackPop) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://js.paystack.co/v1/inline.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("Could not load Paystack"));
      document.body.appendChild(s);
    });
  }
  return scriptPromise;
}

export function paymentsConfigured() {
  return Boolean(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY);
}

// Resolves { reference, mode } on success; rejects if the customer cancels.
export async function pay({ email, amountNaira, reference, metadata }) {
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  if (!key) {
    // Demo mode — simulate a successful charge without moving money.
    await new Promise((r) => setTimeout(r, 900));
    return { reference, mode: "demo" };
  }
  await loadPaystack();
  return new Promise((resolve, reject) => {
    const handler = window.PaystackPop.setup({
      key,
      email,
      amount: Math.round(amountNaira * 100), // kobo
      currency: "NGN",
      ref: reference,
      metadata,
      callback: (resp) => resolve({ reference: resp.reference, mode: "live" }),
      onClose: () => reject(new Error("Payment cancelled")),
    });
    handler.openIframe();
  });
}
