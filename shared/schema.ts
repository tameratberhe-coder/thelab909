import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ---------- Users ---------- */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("member"), // 'member' | 'admin'
  createdAt: integer("created_at").notNull(),
});
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, role: true })
  .extend({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(1),
  });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

/* ---------- Session Types (booking offerings) ---------- */
export const sessionTypes = sqliteTable("session_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  durationMin: integer("duration_min").notNull(),
  priceCents: integer("price_cents").notNull(),
  capacity: integer("capacity").notNull().default(1),
  imageKey: text("image_key").notNull().default("training"),
  active: integer("active").notNull().default(1),
});
export type SessionType = typeof sessionTypes.$inferSelect;

/* ---------- Bookings ---------- */
export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  sessionTypeId: integer("session_type_id").notNull(),
  startsAt: integer("starts_at").notNull(), // unix ms
  endsAt: integer("ends_at").notNull(),
  status: text("status").notNull().default("confirmed"), // 'confirmed' | 'cancelled' | 'completed'
  paymentId: text("payment_id"), // square payment id (mock)
  amountCents: integer("amount_cents").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at").notNull(),
});
export const insertBookingSchema = createInsertSchema(bookings)
  .omit({ id: true, createdAt: true, status: true, paymentId: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

/* ---------- Membership Plans ---------- */
export const membershipPlans = sqliteTable("membership_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  monthlyCents: integer("monthly_cents").notNull(),
  sessionsIncluded: integer("sessions_included"), // null = unlimited
  perksJson: text("perks_json").notNull(), // JSON array of strings
  highlight: integer("highlight").notNull().default(0),
});
export type MembershipPlan = typeof membershipPlans.$inferSelect;

/* ---------- Memberships (active subscriptions) ---------- */
export const memberships = sqliteTable("memberships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().unique(),
  planId: integer("plan_id").notNull(),
  status: text("status").notNull().default("active"), // 'active' | 'cancelled' | 'past_due'
  startedAt: integer("started_at").notNull(),
  renewsAt: integer("renews_at").notNull(),
  paymentId: text("payment_id"),
});
export type Membership = typeof memberships.$inferSelect;

/* ---------- Products (apparel + supplements) ---------- */
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'apparel' | 'supplements'
  subcategory: text("subcategory").notNull(), // 'tee' | 'hoodie' | 'cap' | 'shorts' | 'protein' | 'pre' | 'recovery' | 'bcaa'
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  imageKey: text("image_key").notNull(),
  variantsJson: text("variants_json").notNull(), // JSON array of variants {name,sku,stock}
  subscribeSavePct: integer("subscribe_save_pct"), // null if not subscribable
  active: integer("active").notNull().default(1),
});
export type Product = typeof products.$inferSelect;

/* ---------- Orders ---------- */
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("paid"), // 'paid' | 'shipped' | 'delivered' | 'cancelled'
  itemsJson: text("items_json").notNull(), // JSON array of {productId, name, variant, qty, priceCents, subscribeSave}
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull(),
  taxCents: integer("tax_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  shipName: text("ship_name").notNull(),
  shipAddress: text("ship_address").notNull(),
  shipCity: text("ship_city").notNull(),
  shipState: text("ship_state").notNull(),
  shipZip: text("ship_zip").notNull(),
  paymentId: text("payment_id"),
  createdAt: integer("created_at").notNull(),
});
export const insertOrderSchema = createInsertSchema(orders)
  .omit({ id: true, createdAt: true, status: true, paymentId: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

/* ---------- Schedule rules (coach availability) ---------- */
// Static for v1: defined in seed. Slots derived: M-F 6a-8p, Sat 7a-12p, on the hour. Past slots filtered out, booked slots filtered out.

/* ---------- Auth schemas ---------- */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;
