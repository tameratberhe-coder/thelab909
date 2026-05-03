import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { money, fmtDateTime, fmtDate } from "@/lib/format";
import type { Booking, Order, MembershipPlan, SessionType } from "@shared/schema";
import { Calendar, Package, DollarSign, TrendingUp } from "lucide-react";

type Overview = {
  bookings: (Booking & { sessionType?: SessionType })[];
  orders: (Order & { items: any[] })[];
  plans: MembershipPlan[];
  counts: { bookings: number; upcomingBookings: number; orders: number; revenueCents: number };
};

export default function Admin() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery<Overview>({ queryKey: ["/api/admin/overview"], enabled: !!user });

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

  if (user.role !== "admin") {
    return (
      <Layout>
        <div className="bg-black text-white pt-32 pb-16 min-h-screen text-center px-6">
          <h1 className="font-display text-5xl uppercase mb-3">Admin only</h1>
          <p className="text-white/60 mb-4">You need admin access for this dashboard.</p>
          <Link href="/account" className="label-mono text-lab-red">← My account</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-black text-white min-h-screen pt-28 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="mb-10">
            <p className="label-mono text-lab-red mb-3">// COACH DASHBOARD</p>
            <h1 className="font-display text-5xl sm:text-7xl uppercase leading-[0.85] tracking-tight">The 909.<br />Live.</h1>
          </div>

          {isLoading && <p className="label-mono text-white/40">Loading…</p>}

          {data && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" data-testid="stats-grid">
                <Stat icon={Calendar} label="UPCOMING" value={String(data.counts.upcomingBookings)} testId="stat-upcoming" />
                <Stat icon={TrendingUp} label="TOTAL BOOKINGS" value={String(data.counts.bookings)} testId="stat-bookings" />
                <Stat icon={Package} label="ORDERS" value={String(data.counts.orders)} testId="stat-orders" />
                <Stat icon={DollarSign} label="GROSS REVENUE" value={money(data.counts.revenueCents)} testId="stat-revenue" />
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <section>
                  <h2 className="font-archivo text-xl uppercase mb-4">Upcoming sessions</h2>
                  <div className="border border-white/10 rounded overflow-hidden">
                    {data.bookings.filter((b) => b.startsAt > Date.now() && b.status === "confirmed").slice(0, 10).map((b) => (
                      <div key={b.id} className="p-4 border-b border-white/10 last:border-0 flex justify-between items-center bg-white/5" data-testid={`upcoming-${b.id}`}>
                        <div>
                          <p className="font-archivo uppercase text-sm">{b.sessionType?.name ?? "Session"}</p>
                          <p className="label-mono text-white/40">{fmtDateTime(b.startsAt)}</p>
                        </div>
                        <p className="font-archivo">{money(b.amountCents, { hideZero: true })}</p>
                      </div>
                    ))}
                    {data.bookings.filter((b) => b.startsAt > Date.now() && b.status === "confirmed").length === 0 && (
                      <p className="p-6 text-center text-white/40 label-mono text-sm">NO UPCOMING SESSIONS</p>
                    )}
                  </div>
                </section>

                <section>
                  <h2 className="font-archivo text-xl uppercase mb-4">Recent orders</h2>
                  <div className="border border-white/10 rounded overflow-hidden">
                    {data.orders.slice(0, 10).map((o) => (
                      <div key={o.id} className="p-4 border-b border-white/10 last:border-0 flex justify-between bg-white/5" data-testid={`order-${o.id}`}>
                        <div>
                          <p className="font-archivo uppercase text-sm">Order #{o.id} · {o.shipName}</p>
                          <p className="label-mono text-white/40">{fmtDate(o.createdAt)} · {o.items.length} ITEM{o.items.length === 1 ? "" : "S"}</p>
                        </div>
                        <p className="font-archivo">{money(o.totalCents)}</p>
                      </div>
                    ))}
                    {data.orders.length === 0 && (
                      <p className="p-6 text-center text-white/40 label-mono text-sm">NO ORDERS YET</p>
                    )}
                  </div>
                </section>

                <section className="lg:col-span-2">
                  <h2 className="font-archivo text-xl uppercase mb-4">All bookings</h2>
                  <div className="border border-white/10 rounded overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/10">
                        <tr className="text-left label-mono text-white/50">
                          <th className="p-3">#</th>
                          <th className="p-3">SESSION</th>
                          <th className="p-3">WHEN</th>
                          <th className="p-3">STATUS</th>
                          <th className="p-3 text-right">AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.bookings.map((b) => (
                          <tr key={b.id} className="border-t border-white/10" data-testid={`row-booking-${b.id}`}>
                            <td className="p-3 font-mono text-white/40">#{b.id}</td>
                            <td className="p-3 font-archivo">{b.sessionType?.name ?? "-"}</td>
                            <td className="p-3 text-white/70">{fmtDateTime(b.startsAt)}</td>
                            <td className="p-3"><span className={`label-mono text-xs ${b.status === "confirmed" ? "text-lab-red" : "text-white/40"}`}>{b.status.toUpperCase()}</span></td>
                            <td className="p-3 font-archivo text-right">{money(b.amountCents, { hideZero: true })}</td>
                          </tr>
                        ))}
                        {data.bookings.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-white/40 label-mono">NO BOOKINGS</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

function Stat({ icon: Icon, label, value, testId }: { icon: any; label: string; value: string; testId: string }) {
  return (
    <div className="border border-white/10 bg-white/5 rounded p-5" data-testid={testId}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-lab-red" />
        <p className="label-mono text-white/40">{label}</p>
      </div>
      <p className="font-display text-3xl">{value}</p>
    </div>
  );
}
