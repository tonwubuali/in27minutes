// Postgres access for the Vercel serverless API, backed by Neon.
// Schema is created lazily and seed data is version-gated: bumping SEED_VERSION
// causes a one-time reseed on the next request after deploy, so reference data
// (campus zones, agents, catalog) can evolve without manual SQL.
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) console.warn("DATABASE_URL is not set.");
export const sql = neon(connectionString || "postgres://invalid");

// Bump this string whenever seed data should be refreshed in existing databases.
const SEED_VERSION = "2-mouau";

let schemaReady = null;
export function ensureSchema() {
  if (!schemaReady) schemaReady = createAndSeed();
  return schemaReady;
}

async function createAndSeed() {
  await sql`CREATE TABLE IF NOT EXISTS meta (key text PRIMARY KEY, value text)`;
  await sql`CREATE TABLE IF NOT EXISTS neighborhoods (id text PRIMARY KEY, name text NOT NULL, city text NOT NULL)`;
  await sql`CREATE TABLE IF NOT EXISTS agents (id text PRIMARY KEY, name text NOT NULL, neighborhood_id text NOT NULL, rating real DEFAULT 5, deliveries int DEFAULT 0, status text DEFAULT 'active', joined text)`;
  await sql`CREATE TABLE IF NOT EXISTS users (id serial PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL, name text NOT NULL, role text NOT NULL, agent_id text)`;
  await sql`CREATE TABLE IF NOT EXISTS products (id text PRIMARY KEY, name text NOT NULL, category text NOT NULL, price int NOT NULL, unit text, emoji text)`;
  await sql`CREATE TABLE IF NOT EXISTS orders (id text PRIMARY KEY, source text, customer_name text, neighborhood_id text, agent_id text, address text, note text, items jsonb NOT NULL, stage text NOT NULL, placed_at bigint NOT NULL, delivery_fee int DEFAULT 0, delivered_at bigint)`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at bigint`;
  await sql`CREATE TABLE IF NOT EXISTS applications (id text PRIMARY KEY, name text, phone text, neighborhood_id text, neighborhood_name text, has_storage text, vehicle text, status text DEFAULT 'pending', submitted_at bigint)`;

  const rows = await sql`SELECT value FROM meta WHERE key = 'seed_version'`;
  if (rows[0]?.value === SEED_VERSION) return; // already on current seed
  await seed();
  await sql`INSERT INTO meta (key, value) VALUES ('seed_version', ${SEED_VERSION})
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
}

async function seed() {
  // Fresh start for reference + demo data (keeps this a clean launch dataset).
  await sql`TRUNCATE neighborhoods, agents, users, products, orders, applications`;

  // MOUAU (Michael Okpara University of Agriculture, Umudike) delivery zones.
  const neighborhoods = [
    ["nb-newcampus", "New Campus", "MOUAU"],
    ["nb-oldcampus", "Old Campus", "MOUAU"],
    ["nb-gate", "Main Gate / Ndoro Rd", "MOUAU"],
    ["nb-umudike", "Umudike Town", "Umuahia"],
  ];
  for (const [id, name, city] of neighborhoods)
    await sql`INSERT INTO neighborhoods (id, name, city) VALUES (${id}, ${name}, ${city})`;

  // Field agents = campus runners who own fulfillment for a zone.
  const agents = [
    ["agent-chidinma", "Chidinma U.", "nb-newcampus", 4.9, 138, "2026-05-02"],
    ["agent-emeka", "Emeka N.", "nb-oldcampus", 4.8, 96, "2026-05-20"],
  ];
  for (const [id, name, nb, rating, deliveries, joined] of agents)
    await sql`INSERT INTO agents (id, name, neighborhood_id, rating, deliveries, status, joined)
              VALUES (${id}, ${name}, ${nb}, ${rating}, ${deliveries}, 'active', ${joined})`;

  const hash = (pw) => bcrypt.hashSync(pw, 10);
  const users = [
    ["customer@in27minutes.com", hash("demo1234"), "Demo Student", "customer", null],
    ["chidinma@in27minutes.com", hash("demo1234"), "Chidinma U.", "agent", "agent-chidinma"],
    ["emeka@in27minutes.com", hash("demo1234"), "Emeka N.", "agent", "agent-emeka"],
    ["admin@in27minutes.com", hash("demo1234"), "Ops Admin", "admin", null],
  ];
  for (const [email, ph, name, role, agentId] of users)
    await sql`INSERT INTO users (email, password_hash, name, role, agent_id) VALUES (${email}, ${ph}, ${name}, ${role}, ${agentId})`;

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
  for (const [id, name, cat, price, unit, emoji] of products)
    await sql`INSERT INTO products (id, name, category, price, unit, emoji) VALUES (${id}, ${name}, ${cat}, ${price}, ${unit}, ${emoji})`;

  const now = Date.now();
  const orders = [
    { id: "ord-1042", source: "seed", customer_name: "Chika O.", neighborhood_id: "nb-newcampus", agent_id: "agent-chidinma", address: "Block C, New Campus Hostels", note: "", items: [ { id: "p-milk", name: "Whole Milk 1L", emoji: "🥛", price: 1800, qty: 2 }, { id: "p-bread", name: "Agege Bread", emoji: "🍞", price: 1200, qty: 1 } ], stage: "picking", placed_at: now - 6 * 60 * 1000, delivery_fee: 500 },
    { id: "ord-1043", source: "seed", customer_name: "Ifeanyi A.", neighborhood_id: "nb-newcampus", agent_id: null, address: "Faculty of Agriculture, New Campus", note: "Call on arrival", items: [ { id: "p-parac", name: "Paracetamol 500mg", emoji: "💊", price: 900, qty: 1 }, { id: "p-water", name: "Bottled Water (6-pack)", emoji: "💧", price: 1600, qty: 1 } ], stage: "confirmed", placed_at: now - 1 * 60 * 1000, delivery_fee: 500 },
  ];
  for (const o of orders)
    await sql`INSERT INTO orders (id, source, customer_name, neighborhood_id, agent_id, address, note, items, stage, placed_at, delivery_fee)
              VALUES (${o.id}, ${o.source}, ${o.customer_name}, ${o.neighborhood_id}, ${o.agent_id}, ${o.address}, ${o.note}, ${JSON.stringify(o.items)}, ${o.stage}, ${o.placed_at}, ${o.delivery_fee})`;

  await sql`INSERT INTO applications (id, name, phone, neighborhood_id, neighborhood_name, has_storage, vehicle, status, submitted_at)
            VALUES ('app-seed-1', 'Tobenna E.', '0803 111 2222', 'nb-oldcampus', 'Old Campus', 'yes', 'bike', 'pending', ${now - 3600 * 1000})`;
}
