// Postgres access for the Vercel serverless API, backed by Neon.
// Uses the @neondatabase/serverless HTTP driver, which is built for serverless
// (no long-lived connections to exhaust). Schema is created and seeded lazily on
// first use so there's no separate migration step to run after deploy.
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  // Don't throw at import time on Vercel build; throw on first query instead.
  console.warn("DATABASE_URL is not set. Set it in your Vercel project env vars.");
}

export const sql = neon(connectionString || "postgres://invalid");

let schemaReady = null;

export function ensureSchema() {
  // Cache per warm lambda instance so we only run DDL/seed once.
  if (!schemaReady) schemaReady = createAndSeed();
  return schemaReady;
}

async function createAndSeed() {
  await sql`CREATE TABLE IF NOT EXISTS neighborhoods (
    id text PRIMARY KEY, name text NOT NULL, city text NOT NULL
  )`;
  await sql`CREATE TABLE IF NOT EXISTS agents (
    id text PRIMARY KEY, name text NOT NULL, neighborhood_id text NOT NULL,
    rating real DEFAULT 5, deliveries int DEFAULT 0, status text DEFAULT 'active', joined text
  )`;
  await sql`CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL,
    name text NOT NULL, role text NOT NULL, agent_id text
  )`;
  await sql`CREATE TABLE IF NOT EXISTS products (
    id text PRIMARY KEY, name text NOT NULL, category text NOT NULL,
    price int NOT NULL, unit text, emoji text
  )`;
  await sql`CREATE TABLE IF NOT EXISTS orders (
    id text PRIMARY KEY, source text, customer_name text, neighborhood_id text,
    agent_id text, address text, note text, items jsonb NOT NULL,
    stage text NOT NULL, placed_at bigint NOT NULL, delivery_fee int DEFAULT 0
  )`;
  await sql`CREATE TABLE IF NOT EXISTS applications (
    id text PRIMARY KEY, name text, phone text, neighborhood_id text, neighborhood_name text,
    has_storage text, vehicle text, status text DEFAULT 'pending', submitted_at bigint
  )`;

  const [{ count }] = await sql`SELECT count(*)::int AS count FROM users`;
  if (count > 0) return; // already seeded

  await seed();
}

async function seed() {
  const neighborhoods = [
    ["nb-greenview", "Greenview", "Lagos"],
    ["nb-marina", "Marina", "Lagos"],
    ["nb-lekki1", "Lekki Phase 1", "Lagos"],
    ["nb-yaba", "Yaba", "Lagos"],
  ];
  for (const [id, name, city] of neighborhoods) {
    await sql`INSERT INTO neighborhoods (id, name, city) VALUES (${id}, ${name}, ${city})
              ON CONFLICT (id) DO NOTHING`;
  }

  const agents = [
    ["agent-amara", "Amara O.", "nb-greenview", 4.9, 612, "2025-11-02"],
    ["agent-tunde", "Tunde B.", "nb-lekki1", 4.8, 430, "2026-01-14"],
  ];
  for (const [id, name, nb, rating, deliveries, joined] of agents) {
    await sql`INSERT INTO agents (id, name, neighborhood_id, rating, deliveries, status, joined)
              VALUES (${id}, ${name}, ${nb}, ${rating}, ${deliveries}, 'active', ${joined})
              ON CONFLICT (id) DO NOTHING`;
  }

  const hash = (pw) => bcrypt.hashSync(pw, 10);
  const users = [
    ["customer@in27minutes.com", hash("demo1234"), "Demo Customer", "customer", null],
    ["amara@in27minutes.com", hash("demo1234"), "Amara O.", "agent", "agent-amara"],
    ["tunde@in27minutes.com", hash("demo1234"), "Tunde B.", "agent", "agent-tunde"],
    ["admin@in27minutes.com", hash("demo1234"), "Ops Admin", "admin", null],
  ];
  for (const [email, ph, name, role, agentId] of users) {
    await sql`INSERT INTO users (email, password_hash, name, role, agent_id)
              VALUES (${email}, ${ph}, ${name}, ${role}, ${agentId})
              ON CONFLICT (email) DO NOTHING`;
  }

  const products = [
    ["p-milk", "Whole Milk 1L", "Groceries", 1800, "carton", "🥛"],
    ["p-bread", "Agege Bread", "Groceries", 1200, "loaf", "🍞"],
    ["p-eggs", "Eggs (crate of 30)", "Groceries", 4500, "crate", "🥚"],
    ["p-rice", "Rice 5kg", "Groceries", 9800, "bag", "🍚"],
    ["p-banana", "Bananas", "Groceries", 1500, "bunch", "🍌"],
    ["p-parac", "Paracetamol 500mg", "Pharmacy", 900, "pack", "💊"],
    ["p-plaster", "Adhesive Plasters", "Pharmacy", 1100, "box", "🩹"],
    ["p-vitc", "Vitamin C 1000mg", "Pharmacy", 2600, "tube", "🍊"],
    ["p-water", "Bottled Water (6-pack)", "Food & Drinks", 1600, "pack", "💧"],
    ["p-coffee", "Instant Coffee", "Food & Drinks", 3800, "jar", "☕"],
    ["p-chips", "Plantain Chips", "Food & Drinks", 800, "pack", "🍟"],
    ["p-juice", "Orange Juice 1L", "Food & Drinks", 2200, "carton", "🧃"],
    ["p-charger", "USB-C Charger", "Electronics", 6500, "unit", "🔌"],
    ["p-cable", "Phone Cable", "Electronics", 3200, "unit", "🔋"],
    ["p-bulb", "LED Bulb", "Electronics", 2400, "unit", "💡"],
    ["p-tissue", "Toilet Roll (9-pack)", "Home", 3500, "pack", "🧻"],
    ["p-soap", "Hand Soap", "Home", 1700, "bottle", "🧴"],
    ["p-detergent", "Laundry Detergent", "Home", 4200, "pack", "🧼"],
  ];
  for (const [id, name, cat, price, unit, emoji] of products) {
    await sql`INSERT INTO products (id, name, category, price, unit, emoji)
              VALUES (${id}, ${name}, ${cat}, ${price}, ${unit}, ${emoji})
              ON CONFLICT (id) DO NOTHING`;
  }

  const now = Date.now();
  const orders = [
    {
      id: "ord-1042", source: "seed", customer_name: "Chidi N.", neighborhood_id: "nb-greenview",
      agent_id: "agent-amara", address: "12 Palm Avenue, Greenview", note: "",
      items: [
        { id: "p-milk", name: "Whole Milk 1L", emoji: "🥛", price: 1800, qty: 2 },
        { id: "p-bread", name: "Agege Bread", emoji: "🍞", price: 1200, qty: 1 },
      ],
      stage: "picking", placed_at: now - 6 * 60 * 1000, delivery_fee: 700,
    },
    {
      id: "ord-1043", source: "seed", customer_name: "Bisi A.", neighborhood_id: "nb-greenview",
      agent_id: null, address: "5 Hillcrest Close, Greenview", note: "",
      items: [
        { id: "p-parac", name: "Paracetamol 500mg", emoji: "💊", price: 900, qty: 1 },
        { id: "p-water", name: "Bottled Water (6-pack)", emoji: "💧", price: 1600, qty: 1 },
      ],
      stage: "confirmed", placed_at: now - 1 * 60 * 1000, delivery_fee: 700,
    },
  ];
  for (const o of orders) {
    await sql`INSERT INTO orders (id, source, customer_name, neighborhood_id, agent_id, address, note, items, stage, placed_at, delivery_fee)
              VALUES (${o.id}, ${o.source}, ${o.customer_name}, ${o.neighborhood_id}, ${o.agent_id}, ${o.address}, ${o.note}, ${JSON.stringify(o.items)}, ${o.stage}, ${o.placed_at}, ${o.delivery_fee})
              ON CONFLICT (id) DO NOTHING`;
  }

  await sql`INSERT INTO applications (id, name, phone, neighborhood_id, neighborhood_name, has_storage, vehicle, status, submitted_at)
            VALUES ('app-seed-1', 'Ngozi K.', '0803 111 2222', 'nb-marina', 'Marina', 'yes', 'bike', 'pending', ${now - 3600 * 1000})
            ON CONFLICT (id) DO NOTHING`;
}
