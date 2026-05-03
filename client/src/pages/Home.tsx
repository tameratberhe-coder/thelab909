import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Ticker } from "@/components/Ticker";
import { AutoVideo } from "@/components/AutoVideo";
import { Logo } from "@/components/Logo";
import { Layout } from "@/components/Layout";
import { ChevronDivider } from "@/components/ChevronDivider";
import { REELS } from "@/lib/videos";

export default function Home() {
  return (
    <Layout>
    <div className="bg-black text-white">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden isolate" data-testid="hero">
        <div className="absolute inset-0 -z-30">
          <AutoVideo
            src={REELS.hero.src}
            poster={REELS.hero.poster}
            className="w-full h-full"
            objectPosition="center"
            testid="video-hero"
          />
        </div>
        {/* Hero overlay (D1): lifted from ~78% top / 22% mid / 85% bottom
            to a lighter 45% top / 10% mid / 70% bottom so the reel actually
            reads. "WERK." still wins because it's red, not because we drowned
            the footage. */}
        <div className="absolute inset-0 -z-20 pointer-events-none" style={{
          backgroundImage: `linear-gradient(105deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.20) 40%, rgba(0,0,0,0.10) 65%, rgba(0,0,0,0.55) 100%), linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.70) 100%)`,
        }} />

        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 pt-32 pb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-4 py-1.5 mb-8" data-testid="hero-eyebrow">
            <span className="w-2 h-2 rounded-full bg-lab-red animate-pulse" />
            <span className="label-mono">Inland Empire · Est. 2019</span>
          </div>

          <h1 className="font-display text-white" data-testid="hero-title">
            <span className="block text-[clamp(80px,16vw,260px)]">ALL WE</span>
            <span className="block text-[clamp(80px,16vw,260px)] pl-[8%]">KNOW IS</span>
            <span className="block text-[clamp(80px,16vw,260px)] text-lab-red">WERK.</span>
          </h1>

          <p className="max-w-xl mt-8 text-lg sm:text-xl text-white/85" data-testid="hero-sub">
            A sports performance and fitness training facility in the 909. Built for athletes, families, and anyone tired of going through the motions.
          </p>

          {/* One primary CTA per section (D2): hero owns "Book a Consultation."
             "See the Work" demoted to a text link. It's a navigation aid, not
             a competing decision. */}
          <div className="flex flex-wrap items-center gap-6 mt-8" data-testid="hero-ctas">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-white text-black font-bold uppercase tracking-wider text-sm px-6 py-4 rounded-full thrust hover:bg-lab-red hover:text-white"
              data-testid="cta-book"
            >
              Book a Consultation <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#film"
              onClick={(e) => { e.preventDefault(); document.getElementById("film")?.scrollIntoView({ behavior: "smooth" }); }}
              className="label-mono text-white/70 hover:text-white border-b border-white/30 hover:border-white pb-1 transition-colors"
              data-testid="cta-watch"
            >
              See the work ↓
            </a>
          </div>

          {/* Credentials strip. Proof above the fold (P3). Edit values in lib/credentials.ts. */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl" data-testid="hero-credentials">
            {[
              { b: "Sport", s: "Strength · Speed · Conditioning" },
              { b: "6+ yrs", s: "Coaching since 2019" },
              { b: "D-1 prep", s: "Athletes placed in college programs" },
              { b: "Cert.", s: "NASM-CPT · USAW · CPR/AED" },
            ].map((s) => (
              <div key={s.b} className="border-l-2 border-lab-red pl-4">
                <div className="font-archivo text-xl sm:text-2xl leading-none">{s.b}</div>
                <div className="label-mono text-white/60 mt-2 text-[11px] leading-snug">{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="bg-black text-white py-24 sm:py-32 px-4 sm:px-8" data-testid="manifesto">
        <div className="max-w-[1400px] mx-auto">
          <p className="label-mono text-white/50 mb-8">/ Manifesto</p>
          <h2 className="font-display leading-[0.85]">
            <span className="block text-[clamp(72px,14vw,220px)]">PRESSURE</span>
            <span className="block text-[clamp(72px,14vw,220px)] text-lab-red pl-[6%]">MAKES</span>
            <span className="block text-[clamp(72px,14vw,220px)]">DIAMONDS.</span>
          </h2>
          <div className="border-t border-white/10 mt-16 pt-10 grid md:grid-cols-2 gap-12">
            <h3 className="font-archivo text-2xl sm:text-3xl leading-tight">We&apos;re not a gym. We&apos;re a training facility, built for people who want to know what they&apos;re capable of.</h3>
            <div className="text-white/80 space-y-5 text-lg">
              <p>No mirrors to perform in. No machines to hide behind. Just turf, iron, and a coach watching every rep. The work is the work, and we don&apos;t let you skip it.</p>
              <p>You bring the effort. We bring the standard. That&apos;s the deal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section break (D3): chevron mark used as a system divider, not a letterform. */}
      <ChevronDivider className="px-4 sm:px-8" />

      <Ticker />

      {/* TRAIN: video cards */}
      <section className="bg-black text-white py-24 sm:py-32 px-4 sm:px-8" data-testid="train">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-end mb-12">
            <p className="label-mono text-white/50">/ Train with purpose</p>
            <h2 className="font-display text-right leading-[0.9]">
              <span className="block text-[clamp(56px,10vw,160px)]">EVERY REP.</span>
              <span className="block text-[clamp(56px,10vw,160px)] text-lab-red">EVERY DAY.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:row-span-2 relative aspect-[3/4] md:aspect-auto overflow-hidden rounded-sm group" data-testid="card-private">
              <AutoVideo src={REELS.jp.src} poster={REELS.jp.poster} className="absolute inset-0" testid="video-card-private" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-6 sm:p-8">
                <span className="inline-block self-start bg-lab-red text-white label-mono px-3 py-1 rounded-full mb-3">Private coaching</span>
                <h3 className="font-archivo text-3xl sm:text-4xl leading-none">1-ON-1<br/>TRAINING</h3>
                <p className="text-white/70 text-sm mt-3 max-w-md">Private coaching designed around your body, goals, and schedule.</p>
                {/* Demoted to text link (D2). The hero owns the primary book CTA. */}
                <Link href="/book" className="mt-5 inline-flex items-center gap-2 label-mono text-lab-red border-b border-lab-red/60 pb-1 self-start hover:text-white hover:border-white" data-testid="card-private-cta">
                  Book a session <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="md:col-span-2 relative aspect-[16/10] overflow-hidden rounded-sm group" data-testid="card-sports">
              <AutoVideo src={REELS.aq.src} poster={REELS.aq.poster} className="absolute inset-0" testid="video-card-sports" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/20" />
              <div className="relative h-full flex flex-col justify-end p-6 sm:p-8">
                <span className="inline-block self-start bg-lab-red text-white label-mono px-3 py-1 rounded-full mb-3">Sports performance</span>
                <h3 className="font-archivo text-3xl sm:text-5xl leading-none">BUILT FOR<br/>ATHLETES</h3>
                <Link href="/book" className="mt-5 inline-flex items-center gap-2 label-mono text-white border-b border-white/40 pb-1 self-start hover:text-lab-red hover:border-lab-red" data-testid="card-sports-cta">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="md:col-span-2 relative aspect-[16/10] overflow-hidden rounded-sm bg-lab-red text-white p-6 sm:p-8 group" data-testid="card-follow">
              <span className="absolute top-6 left-6 bg-white text-lab-red label-mono px-3 py-1 rounded-full">@thelab909</span>
              <div className="h-full flex flex-col justify-end">
                <h3 className="font-archivo text-3xl sm:text-5xl leading-none">FOLLOW<br/>THE WERK.</h3>
                <a href="https://www.instagram.com/thelab909/" target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-2 label-mono border-b border-white/60 pb-1 self-start hover:text-black hover:border-black">
                  Instagram <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS list */}
      <section className="bg-black text-white py-24 sm:py-32 px-4 sm:px-8 border-t border-white/10" data-testid="programs">
        <div className="max-w-[1400px] mx-auto">
          <p className="label-mono text-white/50 mb-6">/ Programs</p>
          <h2 className="font-display leading-[0.9] mb-6">
            <span className="block text-[clamp(56px,12vw,180px)]">PICK</span>
            <span className="block text-[clamp(56px,12vw,180px)]">YOUR LANE.</span>
          </h2>
          <p className="text-lg text-white/70 max-w-xl mb-12">Six ways to train. Every program built around your goal, not a template. Start with a free consultation, leave with a plan.</p>

          {/* Chevron divider (D3): one appearance per long section, never on CTAs. */}
          <div className="border-t border-white/10">
            {[
              { n: "01", h: "Sports Performance", c: "Athletes", d: "Position-specific training for athletes: football, basketball, soccer, track, baseball. Speed, agility, explosive power, recovery, built around your season." },
              { n: "02", h: "1-on-1 Private", c: "Solo", d: "Private coaching designed around your body, your goals, your schedule. The most direct path to a stronger version of you." },
              { n: "03", h: "Family Training", c: "Crew", d: "The whole family in the gym at once. Different intensities, same standard. We bring out the best in each athlete." },
              { n: "04", h: "Small Group", c: "Group of 4", d: "Train with a small crew of athletes pushing the same direction. Same drills, more energy, same accountability." },
              { n: "05", h: "Group Fitness", c: "Class", d: "Coach-led conditioning class. Drop in, push hard, leave wrecked. Built for the community member who hates gyms." },
              { n: "06", h: "Free Consultation", c: "Start here", d: "Tell us your goal. We map a plan. No card needed, no commitment. Just a real conversation about what you want from your training." },
            ].map((p) => (
              <Link
                key={p.n}
                href="/book"
                className="relative grid grid-cols-[60px_1fr_auto] sm:grid-cols-[110px_1fr_auto] items-center gap-4 sm:gap-8 border-b border-white/10 py-6 sm:py-8 group transition-colors overflow-hidden"
                data-testid={`row-program-${p.n}`}
              >
                <span className="absolute inset-0 bg-lab-red translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)]" />
                <span className="relative font-archivo text-3xl sm:text-5xl text-lab-red group-hover:text-white">{p.n}</span>
                <div className="relative">
                  <h3 className="font-archivo text-2xl sm:text-4xl leading-none mb-2 group-hover:text-white">{p.h}</h3>
                  <p className="text-white/70 text-sm sm:text-base group-hover:text-white/90">{p.d}</p>
                </div>
                <span className="relative bg-white/10 text-white label-mono px-3 py-1 rounded-full whitespace-nowrap group-hover:bg-white group-hover:text-lab-red">
                  {p.c}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHITE STATEMENT */}
      <section className="bg-white text-black py-24 sm:py-32 px-4 sm:px-8 relative overflow-hidden" data-testid="statement">
        <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-archivo text-[clamp(180px,30vw,500px)] text-black/[0.04] select-none whitespace-nowrap">WERK.</span>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="font-archivo uppercase text-3xl sm:text-5xl lg:text-6xl leading-tight">
            &ldquo;We coach people who refuse to settle for the bare minimum.&rdquo;
          </p>
          <p className="label-mono mt-6">// The LAB 909</p>
        </div>
      </section>

      {/* FILM: featured master + reel grid */}
      <section id="film" className="bg-black text-white py-24 sm:py-32 px-4 sm:px-8" data-testid="film">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between mb-12 gap-8 flex-wrap">
            <div>
              <p className="label-mono text-white/50 mb-6">/ Film</p>
              <h2 className="font-display leading-[0.9]">
                <span className="block text-[clamp(56px,12vw,180px)]">THIS IS</span>
                <span className="block text-[clamp(56px,12vw,180px)] text-lab-red">THE WERK.</span>
              </h2>
            </div>
            <p className="label-mono text-white/40 max-w-xs">No music, no narration. Just the reps, the breath, the sound of the work.</p>
          </div>

          {/* Featured */}
          <div className="grid md:grid-cols-[2fr_1fr] gap-8 items-end mb-16">
            <div className="aspect-[9/16] max-w-md mx-auto md:mx-0 bg-black border border-white/10 overflow-hidden rounded-sm">
              <AutoVideo src={REELS.master.src} poster={REELS.master.poster} testid="video-film-master" />
            </div>
            <div>
              <p className="label-mono text-lab-red">// THE FILM</p>
              <h3 className="font-archivo text-3xl sm:text-5xl leading-none mt-2 mb-6">PRESSURE.MOV</h3>
              <p className="text-white/80 text-lg mb-2 leading-snug">This is what werk looks like.</p>
              <p className="text-white/65 mb-6 leading-relaxed">Inland Empire's training ground for the athletes nobody's watching yet. Faster. Stronger. Higher off the ground. Press play, then come build.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/book" className="inline-flex items-center gap-2 bg-lab-red text-white label-mono px-5 py-3 rounded-full hover:bg-white hover:text-lab-red thrust">
                  Book a session <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a href="https://www.instagram.com/thelab909/" target="_blank" rel="noopener" className="inline-flex items-center gap-2 border border-white/30 text-white label-mono px-5 py-3 rounded-full hover:bg-white hover:text-black thrust">
                  More on IG <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Reel grid */}
          <p className="label-mono text-white/50 mb-6">/ More from the floor</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[REELS.alex, REELS.aq, REELS.sdsu, REELS.jp, REELS.app1, REELS.app2, REELS.cinematic, REELS.wide].map((r) => (
              <div
                key={r.id}
                className={`relative ${r.orientation === "landscape" ? "aspect-video col-span-2" : "aspect-[9/16]"} overflow-hidden rounded-sm group bg-zinc-900 border border-white/5`}
                data-testid={`reel-${r.id}`}
              >
                <AutoVideo src={r.src} poster={r.poster} testid={`video-reel-${r.id}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <p className="font-archivo text-sm sm:text-base leading-none mb-1">{r.label}</p>
                  <p className="label-mono text-white/60 text-[10px]">{r.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section break (D3) before the faces gallery. */}
      <ChevronDivider className="px-4 sm:px-8" />

      {/* FACES: True Power Media photoshoot, real LAB athletes/coaches. */}
      <section className="bg-black text-white py-24 sm:py-32 px-4 sm:px-8" data-testid="faces">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between mb-12 gap-8 flex-wrap">
            <div>
              <p className="label-mono text-white/50 mb-6">/ Faces of the LAB</p>
              <h2 className="font-display leading-[0.9]">
                <span className="block text-[clamp(56px,12vw,180px)]">REAL</span>
                <span className="block text-[clamp(56px,12vw,180px)] text-lab-red">PEOPLE.</span>
              </h2>
            </div>
            <p className="label-mono text-white/40 max-w-xs">Photography by True Power Media. No models, no stock. Just the people who train here.</p>
          </div>

          {/* 4-up dramatic grid. Alternating subjects, no labels.
             The photos do the talking. Tall 3:4 portrait crop forces
             the eye onto the subject. Hover scale + slow gradient pulse
             keeps it cinematic. */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {[
              "/photos/coach-portrait.jpg",   // male coach, head-on
              "/photos/apparel-red.jpg",      // woman in red LAB top
              "/photos/hero-tunnel.jpg",      // woman in the hex tunnel
              "/photos/apparel-hood-1.jpg",   // male athlete, white LAB tank
            ].map((src) => (
              <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-sm bg-black border border-white/5 group">
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover scale-[1.02] group-hover:scale-[1.10] transition-transform duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)]"
                />
                {/* Cinematic gradient: heavy bottom vignette, slight top fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30 pointer-events-none" />
                {/* Side vignette adds drama on hover */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.55)_100%)] opacity-60 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" />
              </div>
            ))}
          </div>

          <p className="label-mono text-white/30 mt-8 text-[11px]">→ Photography by True Power Media</p>
        </div>
      </section>

      <ChevronDivider className="px-4 sm:px-8" />

      {/* COACH */}
      <section className="bg-black text-white py-24 sm:py-32 px-4 sm:px-8" data-testid="coach">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-zinc-900">
            <img
              src="/photos/coach-portrait.jpg"
              alt="Head Coach, The LAB 909"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <span className="absolute top-5 left-5 bg-lab-red text-white label-mono px-3 py-1 rounded-full">Head Coach</span>
          </div>
          <div>
            <p className="label-mono text-white/50 mb-4">/ Coach</p>
            <h2 className="font-archivo text-4xl sm:text-6xl leading-[0.95] mb-6">COACHED BY SOMEONE WHO&apos;S <span className="text-lab-red">DONE THE WERK.</span></h2>
            <p className="text-white/80 text-lg mb-4">The LAB 909 was founded, and is still run, by a coach who came up the same way he coaches now: with intention, accountability, and zero patience for shortcuts.</p>
            <p className="text-white/80 text-lg mb-8">Every session, every set, every cue is delivered by the person whose name is on the door.</p>
            {/* Demoted to text link (D2): the final red block owns the primary CTA. */}
            <Link href="/book" className="inline-flex items-center gap-2 label-mono text-lab-red border-b border-lab-red/60 pb-1 hover:text-white hover:border-white">
              Book with the head coach <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA: red */}
      <section className="bg-lab-red text-white py-24 sm:py-32 px-4 sm:px-8 relative overflow-hidden" data-testid="cta-block">
        <div aria-hidden className="absolute right-0 bottom-0 pointer-events-none select-none opacity-15">
          <Logo variant="black" className="h-[clamp(220px,40vw,560px)] w-auto" />
        </div>
        <div className="relative max-w-[1400px] mx-auto">
          <p className="label-mono text-white/70 mb-6">/ Ready?</p>
          <h2 className="font-display leading-[0.9]">
            <span className="block text-[clamp(64px,13vw,220px)]">STOP THINKING</span>
            <span className="block text-[clamp(64px,13vw,220px)] text-black">ABOUT IT.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg text-white/95">Free 10-minute consultation. Tell us your goal, we&apos;ll build the plan.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/book" className="inline-flex items-center gap-2 bg-black text-white font-bold uppercase tracking-wider text-sm px-6 py-4 rounded-full thrust hover:bg-white hover:text-black" data-testid="cta-book-final">
              Book a Consultation <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
    </Layout>
  );
}
