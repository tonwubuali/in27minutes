# in27minutes

AI-native, hyperlocal commerce. Customers order anything and a **field agent in their
neighborhood** fulfills it in **27 minutes**. in27minutes doesn't onboard businesses — it
onboards the agents who own fulfillment for each neighborhood.

Full-stack MVP: a React frontend and a real backend (Vercel serverless functions + Neon
Postgres) with login, four roles, and an end-to-end order flow.

## The surfaces

One sign-in; the logged-in user's **role** decides which app loads.

1. **Customer** — storefront, search, cart, checkout (pick your neighborhood), live 27-minute
   order tracking.
2. **Field Agent** — every order placed in the agent's neighborhood lands in their live queue.
   Accept → pick → out for delivery → delivered. Plus local inventory and earnings.
3. **Admin / Ops** — review & approve agent applications (approving creates a live agent + a
   login), see all orders and agents, and a metrics overview.
4. **Become an Agent** (public, no login) — recruitment landing, earnings calculator, and the
   application form that feeds the admin pipeline.

### Demo accounts (password `demo1234` for all)
- `customer@in27minutes.com` — customer
- `amara@in27minutes.com` — agent (Greenview)
- `tunde@in27minutes.com` — agent (Lekki Phase 1)
- `admin@in27minutes.com` — admin

### See it end-to-end
1. Sign in as **customer**, set neighborhood to *Greenview*, add items, check out.
2. Sign out, sign in as **amara@in27minutes.com** — the order is in the **Live queue**; advance it.
3. Sign back in as the customer and open the order — the timeline/countdown reflect the agent's
   actions (it polls every few seconds).
4. As **admin**, approve a pending application and watch a new agent + login get created.

## Architecture

- **Frontend:** Vite + React. Tailwind via Play CDN (brand palette wired into `index.html`), so
  there's no CSS build step.
- **Backend:** Vercel serverless functions in `/api` (Node, ESM).
- **Database:** Neon Postgres via `@neondatabase/serverless`. Schema is created and seeded lazily
  on first request — no migration step to run.
- **Auth:** JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`). The token is stored client-side and sent
  as a Bearer header; role-based checks live in `api/_lib/auth.js`.

```
api/
  _lib/db.js              Neon client, schema + seed
  _lib/auth.js            JWT, CORS, role guard (withApi)
  login.js  me.js
  products.js  neighborhoods.js  agents.js
  orders.js               GET (role-scoped) + POST (create)
  orders/[id]/advance.js  advance order stage
  applications.js         POST (public) + GET (admin)
  applications/[id]/approve.js
  metrics.js
src/
  api.js                  fetch client (token + JSON)
  store.jsx               app state, talks to the API
  auth/Login.jsx
  customer/  agent/  admin/  recruit/
  components/ui.jsx        shared UI + 27-min countdown
```

## Run locally

You need [Node.js](https://nodejs.org) 18+ and a free [Neon](https://neon.tech) database.

```bash
npm install
npm i -g vercel        # Vercel CLI runs the frontend + /api functions together
cp .env.example .env   # then fill in DATABASE_URL and JWT_SECRET
vercel dev
```

Open the printed URL (usually http://localhost:3000). The DB self-seeds on first load.

> `npm run dev` runs only the Vite frontend — the `/api` routes won't exist, so use `vercel dev`.

## Deploy (GitHub → Vercel → Neon)

1. **Neon:** create a project, copy the **pooled** connection string
   (`...-pooler...?sslmode=require`).
2. **GitHub:** push this folder to a new repo.
   ```bash
   git init && git add -A && git commit -m "in27minutes MVP"
   git branch -M main
   git remote add origin https://github.com/<you>/in27minutes.git
   git push -u origin main
   ```
3. **Vercel:** New Project → Import the repo (framework auto-detects as Vite). Add two
   Environment Variables before deploying:
   - `DATABASE_URL` = your Neon pooled connection string
   - `JWT_SECRET` = any long random string
4. Deploy. Open the URL and sign in with a demo account. The database seeds itself on first hit.

Set the same env vars for Preview/Production scopes in Vercel so previews work too.

### Custom domain (in27minutes.com)
In the Vercel project: **Settings → Domains → Add** `in27minutes.com` (and `www.in27minutes.com`).
Vercel shows the DNS records to set at your registrar:
- Apex `in27minutes.com` → **A** record `76.76.21.21`, or use Vercel's nameservers.
- `www` → **CNAME** `cname.vercel-dns.com`.

DNS propagates in minutes-to-hours; Vercel issues the SSL certificate automatically. Set
`www` to redirect to the apex (or vice-versa) in the same Domains panel.

## Economics modeled (placeholder — tune in `api/_lib/db.js` / the agent code)
- Agent keeps the **full delivery fee** (₦700 seed) per order, plus an **8% basket margin**.
- The recruitment calculator and the agent earnings view use the same formula.

## Next steps
- Payments at checkout; agent geolocation + live ETAs; push notifications.
- Per-agent real inventory (the inventory view is currently illustrative).
- Rate limiting and password reset on the auth endpoints.
