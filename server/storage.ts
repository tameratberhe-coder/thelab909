import {
  users, bookings, sessionTypes, membershipPlans, memberships, products, orders,
  type User, type InsertUser,
  type Booking, type InsertBooking,
  type SessionType, type MembershipPlan, type Membership,
  type Product, type Order, type InsertOrder,
} from '@shared/schema';
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, gte, sql } from "drizzle-orm";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

// Bootstrap tables (Drizzle with better-sqlite3 doesn't auto-run migrations)
sqlite.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS session_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_min INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  image_key TEXT NOT NULL DEFAULT 'training',
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_type_id INTEGER NOT NULL,
  starts_at INTEGER NOT NULL,
  ends_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  payment_id TEXT,
  amount_cents INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS membership_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  monthly_cents INTEGER NOT NULL,
  sessions_included INTEGER,
  perks_json TEXT NOT NULL,
  highlight INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  plan_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  started_at INTEGER NOT NULL,
  renews_at INTEGER NOT NULL,
  payment_id TEXT
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  image_key TEXT NOT NULL,
  variants_json TEXT NOT NULL,
  subscribe_save_pct INTEGER,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',
  items_json TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  ship_name TEXT NOT NULL,
  ship_address TEXT NOT NULL,
  ship_city TEXT NOT NULL,
  ship_state TEXT NOT NULL,
  ship_zip TEXT NOT NULL,
  payment_id TEXT,
  created_at INTEGER NOT NULL
);
`);

export const db = drizzle(sqlite);

/* ---------- Password hashing ---------- */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const target = Buffer.from(hash, "hex");
  if (test.length !== target.length) return false;
  return timingSafeEqual(test, target);
}

/* ---------- Storage interface ---------- */
export interface IStorage {
  getUser(id: number): User | undefined;
  getUserByEmail(email: string): User | undefined;
  createUser(input: InsertUser): User;
  updateUserRole(id: number, role: string): void;

  listSessionTypes(): SessionType[];
  getSessionType(id: number): SessionType | undefined;

  createBooking(b: Omit<Booking, "id" | "createdAt" | "status" | "paymentId"> & { paymentId?: string | null }): Booking;
  listBookingsForUser(userId: number): Booking[];
  listAllBookings(): Booking[];
  bookedStartsBetween(start: number, end: number): number[]; // returns startsAt list
  cancelBooking(id: number, userId: number): boolean;

  listPlans(): MembershipPlan[];
  getPlan(id: number): MembershipPlan | undefined;
  getMembershipForUser(userId: number): Membership | undefined;
  upsertMembership(userId: number, planId: number, paymentId?: string | null): Membership;
  cancelMembership(userId: number): void;

  listProducts(category?: string): Product[];
  getProductBySlug(slug: string): Product | undefined;

  createOrder(o: Omit<Order, "id" | "createdAt" | "status" | "paymentId"> & { paymentId?: string | null }): Order;
  listOrdersForUser(userId: number): Order[];
  listAllOrders(): Order[];
}

class DbStorage implements IStorage {
  getUser(id: number) { return db.select().from(users).where(eq(users.id, id)).get(); }
  getUserByEmail(email: string) { return db.select().from(users).where(eq(users.email, email)).get(); }
  createUser(input: InsertUser): User {
    const now = Date.now();
    return db.insert(users).values({
      email: input.email,
      password: hashPassword(input.password),
      fullName: input.fullName,
      phone: input.phone ?? null,
      role: "member",
      createdAt: now,
    }).returning().get();
  }
  updateUserRole(id: number, role: string) { db.update(users).set({ role }).where(eq(users.id, id)).run(); }

  listSessionTypes() { return db.select().from(sessionTypes).where(eq(sessionTypes.active, 1)).all(); }
  getSessionType(id: number) { return db.select().from(sessionTypes).where(eq(sessionTypes.id, id)).get(); }

  createBooking(b: { userId: number; sessionTypeId: number; startsAt: number; endsAt: number; amountCents: number; notes?: string | null; paymentId?: string | null }): Booking {
    const now = Date.now();
    return db.insert(bookings).values({
      userId: b.userId,
      sessionTypeId: b.sessionTypeId,
      startsAt: b.startsAt,
      endsAt: b.endsAt,
      amountCents: b.amountCents,
      notes: b.notes ?? null,
      paymentId: b.paymentId ?? null,
      status: "confirmed",
      createdAt: now,
    }).returning().get();
  }
  listBookingsForUser(userId: number) {
    return db.select().from(bookings).where(eq(bookings.userId, userId)).all()
      .sort((a, b) => b.startsAt - a.startsAt);
  }
  listAllBookings() { return db.select().from(bookings).all().sort((a, b) => b.startsAt - a.startsAt); }
  bookedStartsBetween(start: number, end: number) {
    return db.select({ s: bookings.startsAt }).from(bookings)
      .where(and(eq(bookings.status, "confirmed"), gte(bookings.startsAt, start)))
      .all().filter((r) => r.s < end).map((r) => r.s);
  }
  cancelBooking(id: number, userId: number) {
    const r = db.update(bookings).set({ status: "cancelled" }).where(and(eq(bookings.id, id), eq(bookings.userId, userId))).run();
    return r.changes > 0;
  }

  listPlans() { return db.select().from(membershipPlans).all().sort((a, b) => a.monthlyCents - b.monthlyCents); }
  getPlan(id: number) { return db.select().from(membershipPlans).where(eq(membershipPlans.id, id)).get(); }
  getMembershipForUser(userId: number) { return db.select().from(memberships).where(eq(memberships.userId, userId)).get(); }
  upsertMembership(userId: number, planId: number, paymentId?: string | null): Membership {
    const existing = this.getMembershipForUser(userId);
    const now = Date.now();
    const renews = now + 30 * 24 * 60 * 60 * 1000;
    if (existing) {
      return db.update(memberships).set({ planId, status: "active", startedAt: now, renewsAt: renews, paymentId: paymentId ?? null })
        .where(eq(memberships.id, existing.id)).returning().get();
    }
    return db.insert(memberships).values({ userId, planId, status: "active", startedAt: now, renewsAt: renews, paymentId: paymentId ?? null }).returning().get();
  }
  cancelMembership(userId: number) {
    db.update(memberships).set({ status: "cancelled" }).where(eq(memberships.userId, userId)).run();
  }

  listProducts(category?: string) {
    const all = db.select().from(products).where(eq(products.active, 1)).all();
    return category ? all.filter((p) => p.category === category) : all;
  }
  getProductBySlug(slug: string) { return db.select().from(products).where(eq(products.slug, slug)).get(); }

  createOrder(o: { userId: number; itemsJson: string; subtotalCents: number; shippingCents: number; taxCents: number; totalCents: number; shipName: string; shipAddress: string; shipCity: string; shipState: string; shipZip: string; paymentId?: string | null }): Order {
    const now = Date.now();
    return db.insert(orders).values({
      userId: o.userId,
      itemsJson: o.itemsJson,
      subtotalCents: o.subtotalCents,
      shippingCents: o.shippingCents,
      taxCents: o.taxCents,
      totalCents: o.totalCents,
      shipName: o.shipName,
      shipAddress: o.shipAddress,
      shipCity: o.shipCity,
      shipState: o.shipState,
      shipZip: o.shipZip,
      paymentId: o.paymentId ?? null,
      status: "paid",
      createdAt: now,
    }).returning().get();
  }
  listOrdersForUser(userId: number) { return db.select().from(orders).where(eq(orders.userId, userId)).all().sort((a, b) => b.createdAt - a.createdAt); }
  listAllOrders() { return db.select().from(orders).all().sort((a, b) => b.createdAt - a.createdAt); }
}

export const storage = new DbStorage();

/* ---------- Seed (idempotent) ---------- */
export function seed() {
  // Admin owner account
  const admin = storage.getUserByEmail("owner@thelab909.com");
  if (!admin) {
    const u = storage.createUser({ email: "owner@thelab909.com", password: "lab909owner", fullName: "Coach", phone: null });
    storage.updateUserRole(u.id, "admin");
  }

  // Session types
  const stCount = db.select({ c: sql<number>`count(*)` }).from(sessionTypes).get();
  if (!stCount || stCount.c === 0) {
    db.insert(sessionTypes).values([
      { slug: "consult", name: "Free Consultation", tagline: "10 min. We listen.", description: "Tell us your goal. We map a plan. No card needed.", durationMin: 15, priceCents: 0, capacity: 1, imageKey: "training", active: 1 },
      { slug: "1on1", name: "1-on-1 Private", tagline: "Just you and the coach.", description: "Private coaching designed around your body, goals, and schedule.", durationMin: 60, priceCents: 9500, capacity: 1, imageKey: "private", active: 1 },
      { slug: "sports", name: "Sports Performance", tagline: "Athletes only.", description: "Position-specific training. Speed, agility, explosive power, recovery.", durationMin: 60, priceCents: 8500, capacity: 1, imageKey: "sports", active: 1 },
      { slug: "small-group", name: "Small Group", tagline: "Pack mentality.", description: "Crew of 2 to 4. Same drills, more energy. Same accountability.", durationMin: 60, priceCents: 4500, capacity: 4, imageKey: "group", active: 1 },
      { slug: "family", name: "Family Training", tagline: "Train with your people.", description: "The whole household, one session. Adjusted intensity per athlete.", durationMin: 60, priceCents: 12500, capacity: 5, imageKey: "family", active: 1 },
      { slug: "group-fitness", name: "Group Fitness", tagline: "Class energy.", description: "Coach-led conditioning class. Drop in, push hard, leave wrecked.", durationMin: 45, priceCents: 2500, capacity: 12, imageKey: "fitness", active: 1 },
    ]).run();
  }

  // Plans
  const pCount = db.select({ c: sql<number>`count(*)` }).from(membershipPlans).get();
  if (!pCount || pCount.c === 0) {
    db.insert(membershipPlans).values([
      { slug: "drop-in", name: "Drop-in", tagline: "Pay as you go.", monthlyCents: 0, sessionsIncluded: 0, perksJson: JSON.stringify(["No commitment", "Standard session pricing", "Book any time"]), highlight: 0 },
      { slug: "starter", name: "Starter", tagline: "4 sessions / month.", monthlyCents: 16000, sessionsIncluded: 4, perksJson: JSON.stringify(["4 group sessions / month", "10% off apparel", "Priority booking"]), highlight: 0 },
      { slug: "core", name: "Core", tagline: "8 sessions / month.", monthlyCents: 28000, sessionsIncluded: 8, perksJson: JSON.stringify(["8 group sessions / month", "1 free 1-on-1 / month", "15% off store", "Free LAB tee"]), highlight: 1 },
      { slug: "unlimited", name: "Unlimited", tagline: "All in.", monthlyCents: 42000, sessionsIncluded: null, perksJson: JSON.stringify(["Unlimited group sessions", "2 free 1-on-1s / month", "20% off store", "Free LAB tee + cap", "Bring a guest 1x / month"]), highlight: 0 },
      { slug: "family", name: "Family", tagline: "Up to 4 members.", monthlyCents: 65000, sessionsIncluded: null, perksJson: JSON.stringify(["Unlimited for up to 4 family members", "Family priority booking", "20% off store", "Free LAB gear pack"]), highlight: 0 },
    ]).run();
  }

  // Products
  const prodCount = db.select({ c: sql<number>`count(*)` }).from(products).get();
  if (!prodCount || prodCount.c === 0) {
    const sizes = JSON.stringify([
      { name: "S", sku: "S", stock: 24 }, { name: "M", sku: "M", stock: 32 },
      { name: "L", sku: "L", stock: 28 }, { name: "XL", sku: "XL", stock: 18 },
      { name: "XXL", sku: "XXL", stock: 12 },
    ]);
    const oneSize = JSON.stringify([{ name: "One size", sku: "OS", stock: 50 }]);
    const flavorsP = JSON.stringify([
      { name: "Chocolate", sku: "CHOC", stock: 80 }, { name: "Vanilla", sku: "VAN", stock: 60 },
      { name: "Cookies & Cream", sku: "CC", stock: 40 },
    ]);
    const flavorsPre = JSON.stringify([
      { name: "Fruit Punch", sku: "FP", stock: 50 }, { name: "Blue Raspberry", sku: "BR", stock: 50 },
    ]);
    db.insert(products).values([
      // Apparel
      { slug: "lab-werk-tee", name: "WERK Tee", category: "apparel", subcategory: "tee", tagline: "Heavyweight cotton. Black. Red WERK chest hit.", description: "Pre-shrunk 240 GSM cotton with a relaxed athletic cut. Screen-printed WERK across the chest in signature LAB red. Built to be wrecked, washed, and worn again.", priceCents: 3800, imageKey: "tee-werk", variantsJson: sizes, subscribeSavePct: null, active: 1 },
      { slug: "lab-909-tee", name: "909 Tee", category: "apparel", subcategory: "tee", tagline: "Inland Empire. Etched in.", description: "White-on-black 909 wordmark tee. Tribute to the area code that made us. Soft-hand premium ringspun.", priceCents: 3500, imageKey: "tee-909", variantsJson: sizes, subscribeSavePct: null, active: 1 },
      { slug: "lab-pressure-hoodie", name: "Pressure Hoodie", category: "apparel", subcategory: "hoodie", tagline: "PRESSURE MAKES DIAMONDS.", description: "Heavy 400 GSM pullover hoodie. Black with red LAB 909 chest mark and the PRESSURE manifesto on the back. Built for cold-morning warmups and cool-down walks.", priceCents: 8900, imageKey: "hoodie-pressure", variantsJson: sizes, subscribeSavePct: null, active: 1 },
      { slug: "lab-cap-red", name: "Signature Red Cap", category: "apparel", subcategory: "cap", tagline: "The cap on the coach. Now on you.", description: "Curved-brim 6-panel cotton dad cap. Red. White raised LAB embroidery. Adjustable strap.", priceCents: 3200, imageKey: "cap-red", variantsJson: oneSize, subscribeSavePct: null, active: 1 },
      { slug: "lab-training-shorts", name: "Training Shorts", category: "apparel", subcategory: "shorts", tagline: "7\" inseam. Built to move.", description: "Lightweight 4-way stretch performance shorts with zip pocket and reflective LAB hit. Mesh liner.", priceCents: 4800, imageKey: "shorts", variantsJson: sizes, subscribeSavePct: null, active: 1 },
      // Supplements
      { slug: "lab-whey", name: "WERK Whey Protein", category: "supplements", subcategory: "protein", tagline: "25g whey isolate. 2 lb tub.", description: "Cold-filtered whey protein isolate. 25g protein, 1g sugar, 120 kcal. Mixes clean, no clumps. Third-party tested.", priceCents: 5400, imageKey: "supp-whey", variantsJson: flavorsP, subscribeSavePct: 15, active: 1 },
      { slug: "lab-pre", name: "Pressure Pre-Workout", category: "supplements", subcategory: "pre", tagline: "Clean pump. Sharp focus.", description: "200mg caffeine, 3.2g beta-alanine, 6g L-citrulline, 2g creatine. No artificial dyes. 30 servings.", priceCents: 4200, imageKey: "supp-pre", variantsJson: flavorsPre, subscribeSavePct: 15, active: 1 },
      { slug: "lab-recovery", name: "Recovery Stack", category: "supplements", subcategory: "recovery", tagline: "Glutamine + electrolytes + tart cherry.", description: "Post-session recovery formula. 5g L-glutamine, full electrolyte panel, 500mg tart cherry extract. Mix with water after every session.", priceCents: 3800, imageKey: "supp-recovery", variantsJson: flavorsPre, subscribeSavePct: 15, active: 1 },
      { slug: "lab-bcaa", name: "BCAA 2:1:1", category: "supplements", subcategory: "bcaa", tagline: "Intra-workout fuel.", description: "Branched-chain amino acids in clinical 2:1:1 ratio. 7g BCAAs per scoop. Sip during long sessions to preserve muscle.", priceCents: 3200, imageKey: "supp-bcaa", variantsJson: flavorsPre, subscribeSavePct: 15, active: 1 },
    ]).run();
  }
}

seed();
