import { Layout } from "@/components/Layout";

/**
 * Terms of Service — fitness coaching + ecommerce template.
 * Includes risk-of-injury, refunds, cancellations, and arbitration clauses.
 * Reviewed by counsel before launch. (Board memo #001, P5.)
 */
export default function Terms() {
  const updated = "May 2026";
  return (
    <Layout>
      <div className="bg-black text-white pt-28 pb-24">
        <article className="max-w-3xl mx-auto px-4 sm:px-8">
          <p className="label-mono text-lab-red mb-2">// LEGAL</p>
          <h1 className="font-display text-5xl sm:text-7xl uppercase leading-[0.9] mb-4">Terms<br />of Service</h1>
          <p className="label-mono text-white/40 mb-12">Last updated: {updated}</p>

          <Section h="1. Acceptance">
            By booking a session, buying a product, or creating an account, you agree to these
            Terms and our Privacy Policy. If you do not agree, do not use the service.
          </Section>

          <Section h="2. Eligibility">
            You must be 18+ to enter into this agreement. Minors may train only with a signed
            parent/guardian waiver on file.
          </Section>

          <Section h="3. Bookings + cancellations">
            <ul className="list-disc pl-5 space-y-2">
              <li>Sessions are confirmed when payment is captured.</li>
              <li>Cancel or reschedule 24+ hours ahead for a full refund or credit.</li>
              <li>Inside 24 hours: no refund, but one reschedule within 14 days is allowed.</li>
              <li>No-shows forfeit the session.</li>
              <li>We may cancel and fully refund if the coach is unavailable or facility is closed.</li>
            </ul>
          </Section>

          <Section h="4. Memberships">
            Recurring memberships bill on the same date each month and continue until you
            cancel. Cancel any time from your account or by emailing us; cancellation stops
            the next charge but does not refund the current period.
          </Section>

          <Section h="5. Apparel + supplements">
            Apparel: exchanges within 14 days, unworn with tags. Supplements: final sale unless
            defective. Shipping is calculated at checkout.
          </Section>

          <Section h="6. Assumption of risk">
            Strength training, sports performance work, and conditioning involve real risk of
            injury, including serious injury. By participating, you acknowledge this risk and
            confirm you are physically able to train. Disclose injuries, conditions, or
            medications. Stop and tell your coach if you feel unwell.
          </Section>

          <Section h="7. Liability waiver">
            You will sign a separate waiver before your first session. To the maximum extent
            allowed by California law, you release The LAB 909, its coaches, and contractors
            from claims arising out of ordinary risks of training. Nothing in these Terms
            limits liability for gross negligence, willful misconduct, or anything that cannot
            be limited by law.
          </Section>

          <Section h="8. Conduct">
            No harassment, no drugs, no weapons, no recording other clients without consent.
            We can remove anyone who violates these rules without refund.
          </Section>

          <Section h="9. Intellectual property">
            All site content, logos, the “Werk.” mark, photo + video reels, and brand assets
            belong to The LAB 909. Don’t copy or repost without written permission.
          </Section>

          <Section h="10. Disputes — arbitration + class waiver">
            Disputes will be resolved by binding arbitration in San Bernardino County,
            California, under JAMS rules. You and we waive the right to a jury and to
            participate in any class action. You may opt out of arbitration by emailing us
            within 30 days of agreeing to these Terms.
          </Section>

          <Section h="11. Changes">
            We may update these Terms. The updated version takes effect when posted; your
            continued use means acceptance.
          </Section>

          <Section h="12. Contact">
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
