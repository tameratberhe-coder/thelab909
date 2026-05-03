import { Layout } from "@/components/Layout";

/**
 * Privacy Policy — fitness coaching + ecommerce template.
 * Edit business specifics inline. Reviewed by counsel before launch.
 * (Board memo #001, P5.)
 */
export default function Privacy() {
  const updated = "May 2026";
  return (
    <Layout>
      <div className="bg-black text-white pt-28 pb-24">
        <article className="max-w-3xl mx-auto px-4 sm:px-8 prose-lab">
          <p className="label-mono text-lab-red mb-2">// LEGAL</p>
          <h1 className="font-display text-5xl sm:text-7xl uppercase leading-[0.9] mb-4">Privacy<br />Policy</h1>
          <p className="label-mono text-white/40 mb-12">Last updated: {updated}</p>

          <Section h="1. Who we are">
            The LAB 909 (“we,” “us,” “our”) operates a sports performance and fitness training
            facility in the Inland Empire and the website at thelab909.com. This policy explains
            what we collect, why we collect it, and how to exercise your rights.
          </Section>

          <Section h="2. What we collect">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account info:</strong> name, email, phone, password (hashed).</li>
              <li><strong>Booking info:</strong> session type, date/time, notes you submit, attendance.</li>
              <li><strong>Health intake:</strong> injury history, training goals, emergency contact — only what you choose to share.</li>
              <li><strong>Payment:</strong> handled by Stripe. We never see or store full card numbers.</li>
              <li><strong>Device + analytics:</strong> IP, browser, pages viewed, UTM parameters, referrers.</li>
              <li><strong>Photo / video / likeness:</strong> captured during sessions and used for marketing, social, and editorial purposes under the mandatory release in our participant agreement.</li>
            </ul>
          </Section>

          <Section h="3. How we use it">
            To run your sessions, process payments, send confirmations, prevent fraud, improve
            the site, and (only if you opt in) send marketing. We do not sell your data.
          </Section>

          <Section h="4. Sharing">
            With service providers we need to operate: Stripe (payments), Netlify (hosting),
            email/SMS providers, and analytics. We disclose information when required by law.
          </Section>

          <Section h="5. Your rights (CCPA / GDPR)">
            You can request access, correction, deletion, or a copy of your data. California
            residents have the right to know and delete, and to opt out of any “sale” or
            “share” (we do neither). Email <a href="mailto:hello@thelab909.com" className="text-lab-red underline">hello@thelab909.com</a> to make a request.
          </Section>

          <Section h="6. Cookies">
            We use first-party cookies for sign-in and small UTM tags to learn which channels
            send athletes our way. You can clear cookies in your browser any time.
          </Section>

          <Section h="7. Minors">
            Athletes under 18 must have a parent or guardian sign the liability waiver and this
            privacy notice on their behalf. We do not knowingly collect data from anyone under 13.
          </Section>

          <Section h="8. Security">
            Passwords are hashed. Payments are tokenized through Stripe. No system is 100%
            secure — if we ever have a breach affecting your data, we will notify you.
          </Section>

          <Section h="9. Changes">
            We will post any changes here with a new “last updated” date. Material changes
            will be emailed to active members.
          </Section>

          <Section h="10. Contact">
            The LAB 909 · Inland Empire, CA · <a href="mailto:hello@thelab909.com" className="text-lab-red underline">hello@thelab909.com</a>
          </Section>
        </article>
      </div>
    </Layout>
  );
}

function Section({ h, children }: { h: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-archivo text-xl sm:text-2xl uppercase mb-3">{h}</h2>
      <div className="text-white/75 text-base leading-relaxed">{children}</div>
    </section>
  );
}
