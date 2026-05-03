import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { ArrowRight } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login({ email, password });
      navigate("/account");
    } catch (e: any) {
      setErr("Invalid email or password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-screen pt-32 pb-16 bg-black text-white">
        <div className="max-w-md mx-auto px-6">
          <p className="label-mono text-lab-red mb-3">// 01 SIGN IN</p>
          <h1 className="font-display text-5xl sm:text-6xl uppercase leading-none tracking-tight mb-2">Welcome back.</h1>
          <p className="text-white/60 mb-10 text-sm">Members. Athletes. Family. Sign in to keep training.</p>

          <form onSubmit={onSubmit} className="space-y-5" data-testid="form-login">
            <div>
              <label className="label-mono text-white/50 mb-2 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/15 px-4 py-3 rounded text-white focus:border-lab-red focus:outline-none transition-colors"
                data-testid="input-email"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label-mono text-white/50 mb-2 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/15 px-4 py-3 rounded text-white focus:border-lab-red focus:outline-none transition-colors"
                data-testid="input-password"
                autoComplete="current-password"
              />
            </div>

            {err && <p className="text-lab-red text-sm" data-testid="text-error">{err}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-lab-red text-white font-archivo uppercase tracking-wider py-4 rounded thrust hover:bg-white hover:text-lab-red flex items-center justify-center gap-2 disabled:opacity-50"
              data-testid="button-submit"
            >
              {busy ? "Signing in…" : "Sign in"} <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-white/50">New to LAB 909?</span>
              <Link href="/signup" className="label-mono text-white hover:text-lab-red" data-testid="link-signup">
                Create account →
              </Link>
            </div>
          </form>

          <div className="mt-12 p-5 border border-white/10 bg-white/5 rounded">
            <p className="label-mono text-white/40 mb-2">Demo credentials</p>
            <p className="text-xs text-white/70 font-mono">owner@thelab909.com / lab909owner</p>
            <p className="text-xs text-white/40 mt-1">Admin account for the demo dashboard.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
