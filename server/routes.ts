import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { storage, verifyPassword } from "./storage";
import { insertUserSchema, loginSchema, insertBookingSchema, insertOrderSchema, type User } from "@shared/schema";
import { randomBytes } from "node:crypto";

// In-memory session store (token -> userId). Production would use a real session store.
const sessions = new Map<string, number>();

function getUserFromReq(req: Request): User | undefined {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return undefined;
  const token = auth.slice(7);
  const userId = sessions.get(token);
  if (!userId) return undefined;
  return storage.getUser(userId);
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  if (user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  (req as any).user = user;
  next();
}

// Mock Square payment processor — in production swap with @square/web-sdk + Square Payments API
function mockChargeCard(amountCents: number, sourceId: string): { ok: boolean; paymentId: string } {
  // Always succeed in demo mode. Returns a fake payment id.
  return { ok: true, paymentId: `sq_${randomBytes(8).toString("hex")}_${amountCents}` };
}

function publicUser(u: User) {
  return { id: u.id, email: u.email, fullName: u.fullName, phone: u.phone, role: u.role };
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  /* ---------- Auth ---------- */
  app.post("/api/auth/signup", async (req, res) => {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const existing = storage.getUserByEmail(parsed.data.email);
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const u = storage.createUser(parsed.data);
    const token = randomBytes(24).toString("hex");
    sessions.set(token, u.id);
    res.json({ token, user: publicUser(u) });
  });

  app.post("/api/auth/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const u = storage.getUserByEmail(parsed.data.email);
    if (!u || !verifyPassword(parsed.data.password, u.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = randomBytes(24).toString("hex");
    sessions.set(token, u.id);
    res.json({ token, user: publicUser(u) });
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) sessions.delete(auth.slice(7));
    res.json({ ok: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const u = getUserFromReq(req);
    if (!u) return res.status(401).json({ error: "Not authenticated" });
    res.json({ user: publicUser(u) });
  });

  /* ---------- Session types & slots ---------- */
  app.get("/api/session-types", (_req, res) => {
    res.json(storage.listSessionTypes());
  });

  // Generate available slots for a given date (YYYY-MM-DD) based on coach schedule.
  // Mon/Tue/Thu: 5–10am + 2:30–8pm hourly · Fri: 5–10am hourly · Sat: 7am · Wed/Sun closed.
  // Slot times are minute-offsets from midnight (e.g. 870 = 14:30). Excludes past + already-booked.
  app.get("/api/slots", (req, res) => {
    const date = String(req.query.date ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "Invalid date" });
    // Build slots in local time (Pacific)
    const [y, m, d] = date.split("-").map(Number);
    const startOfDay = new Date(y, m - 1, d, 0, 0, 0).getTime();
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59).getTime();
    const dow = new Date(y, m - 1, d).getDay(); // 0=Sun
    // Morning block 5–10am (hourly starts: 5, 6, 7, 8, 9)
    const morning = [5, 6, 7, 8, 9].map((h) => h * 60);
    // Afternoon/evening block 2:30–8pm (hourly starts: 2:30, 3:30, 4:30, 5:30, 6:30)
    const evening = [14 * 60 + 30, 15 * 60 + 30, 16 * 60 + 30, 17 * 60 + 30, 18 * 60 + 30];
    let mins: number[] = [];
    if (dow === 1 || dow === 2 || dow === 4) mins = [...morning, ...evening]; // Mon, Tue, Thu
    else if (dow === 5) mins = morning; // Fri
    else if (dow === 6) mins = [7 * 60]; // Sat 7am only
    else mins = []; // Wed, Sun closed
    const now = Date.now();
    const booked = new Set(storage.bookedStartsBetween(startOfDay, endOfDay));
    const slots = mins
      .map((min) => new Date(y, m - 1, d, Math.floor(min / 60), min % 60, 0).getTime())
      .filter((ts) => ts > now && !booked.has(ts))
      .map((ts) => ({ ts, label: new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) }));
    res.json({ date, slots, dow });
  });

  /* ---------- Bookings ---------- */
  app.post("/api/bookings", requireAuth, (req, res) => {
    const parsed = insertBookingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const user = (req as any).user as User;
    const st = storage.getSessionType(parsed.data.sessionTypeId);
    if (!st) return res.status(404).json({ error: "Unknown session type" });
    // validate slot is still available
    const dayStart = new Date(parsed.data.startsAt); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(parsed.data.startsAt); dayEnd.setHours(23,59,59,999);
    const booked = new Set(storage.bookedStartsBetween(dayStart.getTime(), dayEnd.getTime()));
    if (booked.has(parsed.data.startsAt)) return res.status(409).json({ error: "Slot already booked" });
    if (parsed.data.startsAt <= Date.now()) return res.status(400).json({ error: "Slot is in the past" });
    // payment (mock)
    let paymentId: string | null = null;
    if (st.priceCents > 0) {
      const sourceId = String(req.body.sourceId ?? "cnon:card-nonce-ok");
      const charge = mockChargeCard(st.priceCents, sourceId);
      if (!charge.ok) return res.status(402).json({ error: "Payment failed" });
      paymentId = charge.paymentId;
    }
    const booking = storage.createBooking({
      userId: user.id,
      sessionTypeId: st.id,
      startsAt: parsed.data.startsAt,
      endsAt: parsed.data.startsAt + st.durationMin * 60_000,
      amountCents: st.priceCents,
      notes: parsed.data.notes ?? null,
      paymentId,
    });
    res.json({ booking, sessionType: st });
  });

  app.get("/api/bookings/me", requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const list = storage.listBookingsForUser(user.id);
    const types = storage.listSessionTypes();
    res.json(list.map((b) => ({ ...b, sessionType: types.find((t) => t.id === b.sessionTypeId) })));
  });

  app.delete("/api/bookings/:id", requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const id = Number(req.params.id);
    const ok = storage.cancelBooking(id, user.id);
    res.json({ ok });
  });

  /* ---------- Memberships ---------- */
  app.get("/api/plans", (_req, res) => res.json(storage.listPlans()));

  app.get("/api/membership/me", requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const m = storage.getMembershipForUser(user.id);
    if (!m) return res.json({ membership: null });
    const plan = storage.getPlan(m.planId);
    res.json({ membership: m, plan });
  });

  app.post("/api/membership/subscribe", requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const planId = Number(req.body.planId);
    const plan = storage.getPlan(planId);
    if (!plan) return res.status(404).json({ error: "Unknown plan" });
    let paymentId: string | null = null;
    if (plan.monthlyCents > 0) {
      const charge = mockChargeCard(plan.monthlyCents, String(req.body.sourceId ?? "cnon:card-nonce-ok"));
      if (!charge.ok) return res.status(402).json({ error: "Payment failed" });
      paymentId = charge.paymentId;
    }
    const m = storage.upsertMembership(user.id, planId, paymentId);
    res.json({ membership: m, plan });
  });

  app.post("/api/membership/cancel", requireAuth, (req, res) => {
    const user = (req as any).user as User;
    storage.cancelMembership(user.id);
    res.json({ ok: true });
  });

  /* ---------- Products ---------- */
  app.get("/api/products", (req, res) => {
    const cat = req.query.category ? String(req.query.category) : undefined;
    res.json(storage.listProducts(cat));
  });
  app.get("/api/products/:slug", (req, res) => {
    const p = storage.getProductBySlug(String(req.params.slug));
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  });

  /* ---------- Orders / Checkout ---------- */
  app.post("/api/orders", requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const items: Array<{ productId: number; variant: string; qty: number; subscribeSave?: boolean }> = req.body.items ?? [];
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Cart empty" });
    const ship = req.body.ship ?? {};
    const required = ["name", "address", "city", "state", "zip"];
    for (const k of required) if (!ship[k]) return res.status(400).json({ error: `Missing shipping ${k}` });

    // build line items + price
    const allProducts = storage.listProducts();
    const lineItems: any[] = [];
    let subtotal = 0;
    for (const it of items) {
      const p = allProducts.find((x) => x.id === it.productId);
      if (!p) return res.status(400).json({ error: `Unknown product ${it.productId}` });
      let unit = p.priceCents;
      if (it.subscribeSave && p.subscribeSavePct) unit = Math.round(unit * (100 - p.subscribeSavePct) / 100);
      const qty = Math.max(1, Math.min(99, Math.floor(it.qty || 1)));
      subtotal += unit * qty;
      lineItems.push({ productId: p.id, name: p.name, slug: p.slug, variant: it.variant, qty, priceCents: unit, subscribeSave: !!it.subscribeSave });
    }
    const shipping = subtotal >= 7500 ? 0 : 795; // free over $75
    const tax = Math.round(subtotal * 0.0875);
    const total = subtotal + shipping + tax;

    const charge = mockChargeCard(total, String(req.body.sourceId ?? "cnon:card-nonce-ok"));
    if (!charge.ok) return res.status(402).json({ error: "Payment failed" });

    const order = storage.createOrder({
      userId: user.id,
      itemsJson: JSON.stringify(lineItems),
      subtotalCents: subtotal,
      shippingCents: shipping,
      taxCents: tax,
      totalCents: total,
      shipName: ship.name, shipAddress: ship.address, shipCity: ship.city, shipState: ship.state, shipZip: ship.zip,
      paymentId: charge.paymentId,
    });
    res.json({ order });
  });

  app.get("/api/orders/me", requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const list = storage.listOrdersForUser(user.id);
    res.json(list.map((o) => ({ ...o, items: JSON.parse(o.itemsJson) })));
  });

  /* ---------- Admin ---------- */
  app.get("/api/admin/overview", requireAdmin, (_req, res) => {
    const allBookings = storage.listAllBookings();
    const allOrders = storage.listAllOrders();
    const types = storage.listSessionTypes();
    const plans = storage.listPlans();
    res.json({
      bookings: allBookings.map((b) => ({ ...b, sessionType: types.find((t) => t.id === b.sessionTypeId) })),
      orders: allOrders.map((o) => ({ ...o, items: JSON.parse(o.itemsJson) })),
      plans,
      counts: {
        bookings: allBookings.length,
        upcomingBookings: allBookings.filter((b) => b.startsAt > Date.now() && b.status === "confirmed").length,
        orders: allOrders.length,
        revenueCents: allBookings.reduce((s, b) => s + (b.status !== "cancelled" ? b.amountCents : 0), 0)
                    + allOrders.reduce((s, o) => s + o.totalCents, 0),
      },
    });
  });

  return httpServer;
}
