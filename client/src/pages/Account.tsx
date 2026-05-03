import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { money, fmtDate, fmtDateTime } from "@/lib/format";
import { imageFor } from "@/lib/images";
import type { Booking, Order, Membership, MembershipPlan, SessionType } from "@shared/schema";
import { Calendar, Package, CreditCard, LogOut, X } from "lucide-react";

type Tab = "bookings" | "membership" | "orders";

type BookingWithType = Booking & { sessionType?: SessionType };
type OrderWithItems = Order & { items: Array<{ productId: number; name: string; slug: string; variant: string; qty: number; priceCents: number; subscribeSave: boolean }> };

export default function Account() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("bookings");

  if (!user) {
    return (
      <Layout>
        <div className="bg-black text-white pt-32 pb-16 min-h-screen text-center px-6">
          <h1 className="font-display text-5xl uppercase mb-3">Sign in required</h1>
          <Link href="/login" className="label-mono text-lab-red">← Sign in</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-black text-white min-h-screen pt-28 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          {/* Hero */}
          <div className="mb-10">
            <p className="label-mono text-lab-red mb-3">// MY ACCOUNT</p>
            <h1 className="font-display text-5xl sm:text-7xl uppercase leading-[0.85] tracking-tight mb-1" data-testid="text-username">
              {user.fullName}
            </h1>
            <p className="text-white/50 text-sm">{user.email}{user.role === "admin" && <span className="ml-3 label-mono text-lab-red">// ADMIN</span>}</p>
          </div>

          <div className="grid lg:grid-cols-[220px_1fr] gap-8">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto" data-testid="account-nav">
                <TabBtn icon={Calendar} active={tab === "bookings"} onClick={() => setTab("bookings")} testId="tab-bookings">Bookings</TabBtn>
                <TabBtn icon={CreditCard} active={tab === "membership"} onClick={() => setTab("membership")} testId="tab-membership">Membership</TabBtn>
                <TabBtn icon={Package} active={tab === "orders"} onClick={() => setTab("orders")} testId="tab-orders">Orders</TabBtn>
                {user.role === "admin" && (
                  <Link href="/admin" className="label-mono text-lab-red px-4 py-3 hover-elevate rounded text-sm" data-testid="link-admin">Admin →</Link>
                )}
                <button
                  onClick={async () => { await logout(); navigate("/"); }}
                  className="label-mono px-4 py-3 hover-elevate rounded text-sm text-white/60 hover:text-lab-red flex items-center gap-2 mt-2"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </nav>
            </aside>

            <div>
              {tab === "bookings" && <BookingsTab />}
              {tab === "membership" && <MembershipTab />}
              {tab === "orders" && <OrdersTab />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function TabBtn({ children, icon: Icon, active, onClick, testId }: any) {
  return (
    <button
      onClick={onClick}
      className={`label-mono px-4 py-3 rounded text-sm flex items-center gap-2 hover-elevate ${active ? "bg-white/10 text-white" : "text-white/50"}`}
      data-testid={testId}
    >
      <Icon className="w-4 h-4" /> {children}
    </button>
  );
}

function BookingsTab() {
  const { data: bookings = [], isLoading } = useQuery<BookingWithType[]>({ queryKey: ["/api/bookings/me"] });
  const cancel = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bookings/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/bookings/me"] }),
  });

  const upcoming = bookings.filter((b) => b.startsAt > Date.now() && b.status === "confirmed");
  const past = bookings.filter((b) => b.startsAt <= Date.now() || b.status !== "confirmed");

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-archivo text-2xl uppercase">Bookings</h2>
        <Link href="/book" className="label-mono text-lab-red hover:text-white" data-testid="link-book-new">+ New booking</Link>
      </div>

      {isLoading && <p className="label-mono text-white/40">Loading…</p>}

      {!isLoading && bookings.length === 0 && (
        <div className="border border-white/10 bg-white/5 rounded p-8 text-center">
          <p className="label-mono text-white/50 mb-3">// NO BOOKINGS YET</p>
          <Link href="/book" className="bg-lab-red text-white font-archivo uppercase px-5 py-2.5 rounded inline-block thrust">Book a session</Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <p className="label-mono text-white/50 mb-3">UPCOMING</p>
          <div className="space-y-3 mb-8" data-testid="upcoming-bookings">
            {upcoming.map((b) => (
              <div key={b.id} className="border border-white/10 bg-white/5 rounded p-4 flex items-center gap-4" data-testid={`booking-${b.id}`}>
                <div className="w-16 h-16 bg-white/5 rounded overflow-hidden flex-shrink-0">
                  <img src={imageFor(b.sessionType?.imageKey ?? "training")} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-archivo uppercase truncate">{b.sessionType?.name ?? "Session"}</p>
                  <p className="label-mono text-white/40">{fmtDateTime(b.startsAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-archivo">{money(b.amountCents, { hideZero: true })}</p>
                  <button
                    onClick={() => cancel.mutate(b.id)}
                    disabled={cancel.isPending}
                    className="label-mono text-white/50 hover:text-lab-red text-[10px] mt-1 disabled:opacity-50"
                    data-testid="button-cancel-booking"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <p className="label-mono text-white/50 mb-3">PAST</p>
          <div className="space-y-3" data-testid="past-bookings">
            {past.map((b) => (
              <div key={b.id} className="border border-white/10 bg-white/5 rounded p-4 flex items-center gap-4 opacity-70">
                <div className="w-16 h-16 bg-white/5 rounded overflow-hidden flex-shrink-0">
                  <img src={imageFor(b.sessionType?.imageKey ?? "training")} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-archivo uppercase truncate">{b.sessionType?.name ?? "Session"}</p>
                  <p className="label-mono text-white/40">{fmtDateTime(b.startsAt)} · {b.status.toUpperCase()}</p>
                </div>
                <p className="font-archivo">{money(b.amountCents, { hideZero: true })}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MembershipTab() {
  const { data, isLoading } = useQuery<{ membership: Membership | null; plan?: MembershipPlan }>({ queryKey: ["/api/membership/me"] });
  const cancel = useMutation({
    mutationFn: async () => { await apiRequest("POST", "/api/membership/cancel"); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/membership/me"] }),
  });

  if (isLoading) return <p className="label-mono text-white/40">Loading…</p>;

  if (!data?.membership || !data.plan) {
    return (
      <div className="border border-white/10 bg-white/5 rounded p-8 text-center">
        <h2 className="font-archivo text-2xl uppercase mb-2">No active membership</h2>
        <p className="text-white/60 mb-5">Join a plan to unlock perks and discounts.</p>
        <Link href="/membership" className="bg-lab-red text-white font-archivo uppercase px-5 py-2.5 rounded inline-block thrust">View plans</Link>
      </div>
    );
  }

  const perks: string[] = JSON.parse(data.plan.perksJson);
  const isCancelled = data.membership.status === "cancelled";

  return (
    <div>
      <h2 className="font-archivo text-2xl uppercase mb-6">Membership</h2>
      <div className="border border-lab-red/40 bg-lab-red/10 rounded p-6 mb-6">
        <p className="label-mono text-lab-red mb-2">// ACTIVE PLAN</p>
        <h3 className="font-display text-4xl uppercase mb-1">{data.plan.name}</h3>
        <p className="text-white/60 mb-4">{data.plan.tagline}</p>
        <dl className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div><dt className="label-mono text-white/40 mb-1">PRICE</dt><dd>{money(data.plan.monthlyCents)}/MO</dd></div>
          <div><dt className="label-mono text-white/40 mb-1">STATUS</dt><dd>{data.membership.status.toUpperCase()}</dd></div>
          <div><dt className="label-mono text-white/40 mb-1">STARTED</dt><dd>{fmtDate(data.membership.startedAt)}</dd></div>
          <div><dt className="label-mono text-white/40 mb-1">{isCancelled ? "ENDS" : "RENEWS"}</dt><dd>{fmtDate(data.membership.renewsAt)}</dd></div>
        </dl>
        <div>
          <p className="label-mono text-white/40 mb-2">INCLUDED</p>
          <ul className="space-y-1.5 text-sm">{perks.map((p) => <li key={p}>· {p}</li>)}</ul>
        </div>
      </div>
      {!isCancelled && (
        <button
          onClick={() => cancel.mutate()}
          disabled={cancel.isPending}
          className="label-mono text-white/50 hover:text-lab-red disabled:opacity-50"
          data-testid="button-cancel-membership"
        >
          {cancel.isPending ? "Cancelling…" : "Cancel membership"}
        </button>
      )}
    </div>
  );
}

function OrdersTab() {
  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({ queryKey: ["/api/orders/me"] });

  return (
    <div>
      <h2 className="font-archivo text-2xl uppercase mb-6">Orders</h2>
      {isLoading && <p className="label-mono text-white/40">Loading…</p>}
      {!isLoading && orders.length === 0 && (
        <div className="border border-white/10 bg-white/5 rounded p-8 text-center">
          <p className="label-mono text-white/50 mb-3">// NO ORDERS YET</p>
          <Link href="/shop/apparel" className="bg-lab-red text-white font-archivo uppercase px-5 py-2.5 rounded inline-block thrust">Shop apparel</Link>
        </div>
      )}
      <div className="space-y-4" data-testid="order-list">
        {orders.map((o) => (
          <div key={o.id} className="border border-white/10 bg-white/5 rounded p-5" data-testid={`order-${o.id}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <div>
                <p className="font-archivo uppercase">Order #{o.id}</p>
                <p className="label-mono text-white/40">{fmtDate(o.createdAt)} · {o.status.toUpperCase()}</p>
              </div>
              <p className="font-archivo text-lab-red">{money(o.totalCents)}</p>
            </div>
            <ul className="space-y-2 border-t border-white/10 pt-3">
              {o.items.map((it, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span><span className="font-archivo">{it.name}</span> <span className="text-white/40">· {it.variant} · QTY {it.qty}</span></span>
                  <span className="font-mono">{money(it.priceCents * it.qty)}</span>
                </li>
              ))}
            </ul>
            <p className="label-mono text-white/40 text-xs mt-3">SHIP TO: {o.shipName}, {o.shipCity}, {o.shipState} {o.shipZip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
