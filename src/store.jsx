import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, getToken, setToken } from "./api.js";

// ---------------------------------------------------------------------------
// App-wide store. Talks to the serverless API and holds the data each surface
// needs. Auth is real (JWT): the logged-in user's role decides which surface
// renders. The cart is the only purely client-side piece and is persisted so a
// refresh doesn't empty it.
// ---------------------------------------------------------------------------

const CART_KEY = "in27minutes:cart";
const NB_KEY = "in27minutes:nb";

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true); // restoring session on first load
  const [authError, setAuthError] = useState(null);

  const [products, setProducts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [agents, setAgents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [applications, setApplications] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const [cart, setCart] = useState(() => loadJSON(CART_KEY, {}));
  const [customerNeighborhoodId, setCustomerNeighborhoodId] = useState(() =>
    loadJSON(NB_KEY, null)
  );

  // Persist cart + chosen neighborhood.
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
  }, [cart]);
  useEffect(() => {
    try { localStorage.setItem(NB_KEY, JSON.stringify(customerNeighborhoodId)); } catch {}
  }, [customerNeighborhoodId]);

  // Public catalog — load once on mount.
  const loadCatalog = useCallback(async () => {
    try {
      const [p, n] = await Promise.all([api.products(), api.neighborhoods()]);
      setProducts(p.products || []);
      setNeighborhoods(n.neighborhoods || []);
      setCustomerNeighborhoodId((cur) => cur || n.neighborhoods?.[0]?.id || null);
    } catch (e) {
      console.error("catalog load failed", e);
    }
  }, []);

  // Role-scoped data — load whenever the user changes.
  const loadRoleData = useCallback(async (u) => {
    if (!u) {
      setOrders([]); setAgents([]); setApplications([]); setMetrics(null);
      return;
    }
    try {
      const o = await api.orders();
      setOrders(o.orders || []);
    } catch (e) { console.error(e); }

    if (u.role === "agent" || u.role === "admin") {
      try { setAgents((await api.agents()).agents || []); } catch (e) { console.error(e); }
    }
    if (u.role === "admin") {
      try { setApplications((await api.applications()).applications || []); } catch (e) { console.error(e); }
      try { setMetrics((await api.metrics())); } catch (e) { console.error(e); }
    }
  }, []);

  // Restore session on first load.
  useEffect(() => {
    (async () => {
      await loadCatalog();
      if (getToken()) {
        try {
          const { user: u } = await api.me();
          setUser(u);
          await loadRoleData(u);
        } catch {
          setToken(null);
        }
      }
      setBooting(false);
    })();
  }, [loadCatalog, loadRoleData]);

  // ---- Actions ----
  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const { token, user: u } = await api.login(email, password);
      setToken(token);
      setUser(u);
      await loadRoleData(u);
      return u;
    } catch (e) {
      setAuthError(e.message || "Login failed");
      throw e;
    }
  }, [loadRoleData]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setOrders([]); setAgents([]); setApplications([]); setMetrics(null);
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!user) return;
    try { setOrders((await api.orders()).orders || []); } catch (e) { console.error(e); }
  }, [user]);

  const refreshApplications = useCallback(async () => {
    try { setApplications((await api.applications()).applications || []); } catch (e) { console.error(e); }
  }, []);

  const refreshMetrics = useCallback(async () => {
    try { setMetrics(await api.metrics()); } catch (e) { console.error(e); }
  }, []);

  const addToCart = useCallback((productId, qty = 1) => {
    setCart((c) => ({ ...c, [productId]: (c[productId] || 0) + qty }));
  }, []);
  const setCartQty = useCallback((productId, qty) => {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });
  }, []);
  const clearCart = useCallback(() => setCart({}), []);

  const placeOrder = useCallback(async (payload) => {
    const { order } = await api.placeOrder(payload);
    setOrders((prev) => [order, ...prev]);
    setCart({});
    return order;
  }, []);

  const advanceOrder = useCallback(async (id) => {
    const { order } = await api.advanceOrder(id);
    setOrders((prev) => prev.map((o) => (o.id === id ? order : o)));
    return order;
  }, []);

  const submitApplication = useCallback(async (payload) => {
    const { application } = await api.submitApplication(payload);
    return application;
  }, []);

  const approveApplication = useCallback(async (id, decision = "approve") => {
    const result = await api.approveApplication(id, decision);
    await refreshApplications();
    return result;
  }, [refreshApplications]);

  // ---- Derived ----
  const value = useMemo(() => {
    const catalogById = Object.fromEntries(products.map((p) => [p.id, p]));
    const cartItems = Object.entries(cart)
      .map(([id, qty]) => (catalogById[id] ? { ...catalogById[id], qty } : null))
      .filter(Boolean);
    const cartCount = cartItems.reduce((n, i) => n + i.qty, 0);
    const cartSubtotal = cartItems.reduce((n, i) => n + i.price * i.qty, 0);
    const activeAgent = agents.find((a) => a.id === user?.agentId) || null;

    return {
      user, booting, authError,
      products, catalogById, neighborhoods, agents, orders, applications, metrics,
      cart, cartItems, cartCount, cartSubtotal,
      customerNeighborhoodId, setCustomerNeighborhood: setCustomerNeighborhoodId,
      activeAgent,
      login, logout,
      refreshOrders, refreshApplications, refreshMetrics,
      addToCart, setCartQty, clearCart,
      placeOrder, advanceOrder, submitApplication, approveApplication,
    };
  }, [
    user, booting, authError, products, neighborhoods, agents, orders, applications, metrics,
    cart, customerNeighborhoodId, login, logout, refreshOrders, refreshApplications,
    refreshMetrics, addToCart, setCartQty, clearCart, placeOrder, advanceOrder,
    submitApplication, approveApplication,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
