// Thin client for the serverless API. Centralizes the base URL, auth token, and
// JSON handling so the rest of the app never touches fetch directly.

const TOKEN_KEY = "in27minutes:token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* no JSON body */
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  // auth
  login: (email, password) => request("/login", { method: "POST", body: { email, password } }),
  me: () => request("/me"),

  // catalog
  products: () => request("/products"),
  neighborhoods: () => request("/neighborhoods"),
  agents: () => request("/agents"),

  // orders
  orders: () => request("/orders"),
  placeOrder: (order) => request("/orders", { method: "POST", body: order }),
  advanceOrder: (id) => request(`/orders/${id}/advance`, { method: "POST" }),

  // applications
  applications: () => request("/applications"),
  submitApplication: (app) => request("/applications", { method: "POST", body: app }),
  approveApplication: (id, decision = "approve") =>
    request(`/applications/${id}/approve`, { method: "POST", body: { decision } }),

  // admin
  metrics: () => request("/metrics"),
};
