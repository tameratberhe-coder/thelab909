import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronRight } from "lucide-react";
import { Logo } from "@/components/Logo";

// Public nav: only surfaces that actually transact. Apparel / Supplements / Membership /
// Cart / Account live in code but aren't ready for public traffic until backend ships.
// (Board memo #001, P9.)
const NAV = [
  { href: "/book", label: "Book" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = loc === "/" || loc === "";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
          isHome ? "bg-black/0 backdrop-blur-0" : "bg-black/95 backdrop-blur-md border-b border-white/10"
        } ${isHome ? "text-white" : ""}`}
        data-testid="site-header"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center hover-elevate active-elevate-2 px-2 -mx-2 py-1 rounded" data-testid="link-home" aria-label="The LAB 909 home">
            <Logo variant="white" className="h-6 w-auto" testid="logo-header" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => {
              const active = loc.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`label-mono px-3 py-2 rounded transition-colors hover-elevate active-elevate-2 ${
                    active ? "text-lab-red" : ""
                  }`}
                  data-testid={`nav-${n.href.replace(/\//g, "-")}`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            {/* Cart / Account / Sign-In hidden from public surfaces until backend transacts (P9). */}
            <Link
              href="/book"
              className="hidden sm:inline-flex items-center gap-1.5 bg-white text-black font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full thrust hover:bg-lab-red hover:text-white"
              data-testid="link-book-now"
            >
              Book Now <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <button
              className="md:hidden p-2 rounded hover-elevate active-elevate-2"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              data-testid="button-menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-black border-t border-white/10 text-white" data-testid="mobile-menu">
            <nav className="flex flex-col p-4 gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className="label-mono py-3 px-3 rounded hover-elevate"
                  data-testid={`mobile-nav-${n.href.replace(/\//g, "-")}`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10 mt-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-12">
          <div>
            <p className="label-mono text-white/40 mb-4">Train</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/book" className="hover:text-lab-red">Book a session</Link></li>
              <li><Link href="/book" className="hover:text-lab-red">Free consultation</Link></li>
            </ul>
          </div>
          <div>
            <p className="label-mono text-white/40 mb-4">Connect</p>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.instagram.com/thelab909/" target="_blank" rel="noopener" className="hover:text-lab-red">@thelab909</a></li>
              <li><a href="https://www.facebook.com/thelab909trainingfacility" target="_blank" rel="noopener" className="hover:text-lab-red">Facebook</a></li>
            </ul>
          </div>
          <div>
            <p className="label-mono text-white/40 mb-4">Legal</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-lab-red">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-lab-red">Terms of Service</Link></li>
              <li><a href="/lab909-waiver.pdf" target="_blank" rel="noopener" className="hover:text-lab-red">Liability Waiver</a></li>
            </ul>
          </div>
        </div>
        <div className="py-4 select-none pointer-events-none">
          <Logo variant="white" className="w-full h-auto opacity-30" />
        </div>
        <div className="mt-8 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 label-mono text-white/40">
          <span>© 2019–{new Date().getFullYear()} The LAB 909. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
