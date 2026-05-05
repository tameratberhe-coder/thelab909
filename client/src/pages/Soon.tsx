// BRAND NOTE: 'Werk' (with an E) is the intentional spelling.
// Do not auto-correct to 'Work' on any content update.
// See Lab909_OwnershipHandoff.pdf section 06.

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { LabA } from "@/components/LabA";
import { ArrowRight, Check } from "lucide-react";

/**
 * /soon - coming-soon waitlist landing page. Currently mounted at "/" so it
 * IS the public homepage; the rest of the site lives behind direct routes
 * (/site, /book, /shop/..., etc.) so the team can still preview while the
 * waitlist is live.
 *
 * Submissions are captured by Netlify Forms. The static form decl in
 * client/index.html (name="waitlist", with `name`, `email`, `bot-field`) is
 * what Netlify scans at deploy time; the React form below mirrors those
 * fields and POSTs to "/" with `form-name=waitlist` so Netlify catches it.
 */
export default function Soon() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !email.includes("@")) {
      setError("Drop a real email so we can reach you.");
      return;
    }
    setSubmitting(true);
    try {
      const body = new URLSearchParams();
      body.append("form-name", "waitlist");
      body.append("name", name);
      body.append("email", email);
      body.append("bot-field", hp);
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) throw new Error(`Submit failed (${res.status})`);
      setSubmitted(true);
    } catch (err) {
      setError("Couldn't submit just now. Try again or DM @thelab909 on IG.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      {/* Background: heavy red radial + grain */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(225,29,42,0.18) 0%, rgba(225,29,42,0.06) 35%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <Logo className="h-8 w-auto" />
        <p className="label-mono text-white/40 text-xs hidden sm:block">// EST. INLAND EMPIRE</p>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex items-center px-6 sm:px-10 pb-16">
        <div className="max-w-5xl mx-auto w-full grid md:grid-cols-[1.1fr_1fr] gap-12 items-center">
          {/* Left: copy */}
          <div>
            <p className="label-mono text-lab-red mb-5">// COMING SOON</p>
            <h1 className="font-display text-6xl sm:text-8xl uppercase leading-[0.85] tracking-tight mb-6">
              ALL WE<br />
              KNOW IS<br />
              <span className="text-lab-red">WERK.</span>
            </h1>
            <p className="text-white/75 text-lg sm:text-xl leading-relaxed mb-3 max-w-md">
              The Inland Empire's next training ground is loading.
            </p>
            <p className="text-white/55 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
              Sports performance, speed, vertical, fitness. Coached by people who actually train.
              Drop your name. First heads through the door get founding-rate access.
            </p>
            <div className="hidden md:flex items-center gap-3 label-mono text-white/40 text-xs">
              <span className="w-8 h-px bg-white/30" />
              <span>The LAB 909 · 909, CA</span>
            </div>
          </div>

          {/* Right: form card */}
          <div className="relative">
            <div className="absolute -inset-px bg-gradient-to-br from-lab-red/40 via-lab-red/10 to-transparent rounded-lg blur-sm" />
            <div className="relative border border-white/15 bg-black/70 backdrop-blur-sm rounded-lg p-7 sm:p-9">
              {!submitted ? (
                <>
                  <p className="label-mono text-white/50 mb-2">// THE LIST</p>
                  <h2 className="font-archivo text-3xl uppercase mb-5 leading-none">
                    Get on it.
                  </h2>
                  <form
                    onSubmit={onSubmit}
                    name="waitlist"
                    method="POST"
                    data-netlify="true"
                    data-netlify-honeypot="bot-field"
                    className="space-y-4"
                  >
                    {/* Netlify form name mirror */}
                    <input type="hidden" name="form-name" value="waitlist" />
                    {/* Honeypot: bots fill this, humans don't see it */}
                    <p className="hidden">
                      <label>
                        Don't fill this out:{" "}
                        <input
                          name="bot-field"
                          value={hp}
                          onChange={(e) => setHp(e.target.value)}
                        />
                      </label>
                    </p>

                    <div>
                      <label htmlFor="name" className="label-mono text-white/50 text-xs mb-2 block">
                        NAME
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="First & last"
                        className="w-full bg-white/5 border border-white/15 px-4 py-3 rounded text-white placeholder:text-white/25 focus:border-lab-red focus:outline-none transition-colors"
                        data-testid="input-soon-name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="label-mono text-white/50 text-xs mb-2 block">
                        EMAIL
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@where.com"
                        className="w-full bg-white/5 border border-white/15 px-4 py-3 rounded text-white placeholder:text-white/25 focus:border-lab-red focus:outline-none transition-colors"
                        data-testid="input-soon-email"
                      />
                    </div>

                    {error && (
                      <p className="text-lab-red text-sm" data-testid="text-soon-error">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-lab-red text-white font-archivo uppercase tracking-wider py-3 rounded thrust hover:bg-white hover:text-lab-red disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      data-testid="button-soon-submit"
                    >
                      {submitting ? "Locking you in…" : "Lock me in"}
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="label-mono text-white/35 text-[10px] leading-relaxed pt-1">
                      No spam. No selling your data. Just a heads-up when doors open and a chance at founding pricing.
                    </p>
                    <p className="label-mono text-white/35 text-[10px] leading-relaxed">
                      By joining you agree to our{" "}
                      <a href="/#/privacy" className="underline hover:text-white/60">
                        Privacy Policy.
                      </a>
                    </p>
                  </form>
                </>
              ) : (
                <div className="py-4" data-testid="soon-success">
                  <div className="w-12 h-12 bg-lab-red rounded-full flex items-center justify-center mb-5">
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  </div>
                  <p className="label-mono text-lab-red mb-2">// YOU'RE ON IT</p>
                  <h2 className="font-archivo text-3xl uppercase mb-3 leading-none">
                    Locked in,<br />
                    {name ? name.split(" ")[0] + "." : "champ."}
                  </h2>
                  <p className="text-white/70 text-sm leading-relaxed mb-6">
                    We got your spot. We'll hit you at <span className="text-white">{email}</span> the second doors open.
                    In the meantime, follow{" "}
                    <a
                      href="https://www.instagram.com/thelab909/"
                      target="_blank"
                      rel="noopener"
                      className="text-lab-red underline"
                    >
                      @thelab909
                    </a>{" "}
                    for the build-out.
                  </p>
                  <a
                    href="https://www.instagram.com/thelab909/"
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 border border-white/30 text-white label-mono px-5 py-3 rounded-full hover:bg-white hover:text-black thrust"
                  >
                    Follow @thelab909 <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 sm:px-10 py-6 border-t border-white/10 flex flex-col sm:flex-row gap-2 sm:gap-6 items-center justify-between">
        <p className="label-mono text-white/40 text-xs">
          <span className="text-lab-red"><LabA /></span> &nbsp;© {new Date().getFullYear()} The LAB 909
        </p>
        <p className="label-mono text-white/30 text-xs">
          hello@thelab909.com
        </p>
      </footer>
    </div>
  );
}
