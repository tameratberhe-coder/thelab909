import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { ArrowRight } from "lucide-react";

export default function Signup() {
  const { signup } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      await signup({ email, password, fullName, phone: phone || undefined });
      navigate("/account");
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (msg.includes("409")) setErr("Email already registered. Try signing in.");
      else setErr("Could not create account. Check your details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-screen pt-32 pb-16 bg-black text-white">
        <div className="max-w-md mx-auto px-6">
          <p className="label-mono text-lab-red mb-3">// 02 NEW ATHLETE</p>
          <h1 className="font-display text-5xl sm:text-6xl uppercase leading-none tracking-tight mb-2">Lock in.</h1>
          <p className="text-white/60 mb-10 text-sm">Create your LAB 909 account to book sessions, manage your membership, and shop.</p>

          <form onSubmit={onSubmit} className="space-y-5" data-testid="form-signup">
            <div>
              <label className="label-mono text-white/50 mb-2 block">Full name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 px-4 py-3 rounded text-white focus:border-lab-red focus:outline-none"
                data-testid="input-fullName"
              />
            </div>
            <div>
              <label className="label-mono text-white/50 mb-2 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/15 px-4 py-3 rounded text-white focus:border-lab-red focus:outline-none"
                data-testid="input-email"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label-mono text-white/50 mb-2 block">Phone <span className="text-white/30">(optional)</span></label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/15 px-4 py-3 rounded text-white focus:border-lab-red focus:outline-none"
                data-testid="input-phone"
              />
            </div>
            <div>
              <label className="label-mono text-white/50 mb-2 block">Password <span className="text-white/30">(6+ characters)</span></label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/15 px-4 py-3 rounded text-white focus:border-lab-red focus:outline-none"
                data-testid="input-password"
                autoComplete="new-password"
              />
            </div>

            {err && <p className="text-lab-red text-sm" data-testid="text-error">{err}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-lab-red text-white font-archivo uppercase tracking-wider py-4 rounded thrust hover:bg-white hover:text-lab-red flex items-center justify-center gap-2 disabled:opacity-50"
              data-testid="button-submit"
            >
              {busy ? "Creating…" : "Create account"} <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-white/50">Already a member?</span>
              <Link href="/login" className="label-mono text-white hover:text-lab-red" data-testid="link-login">
                Sign in →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
