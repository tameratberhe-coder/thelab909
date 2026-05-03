import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, User as UserIcon, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/book", label: "Book" },
  { href: "/membership", label: "Membership" },
  { href: "/shop/apparel", label: "Apparel" },
  { href: "/shop/supplements", label: "Supplements" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const { user, logout } = useAuth();
  const { count } = useCart();
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
            <Link
              href="/cart"
              className="relative p-2 rounded hover-elevate active-elevate-2"
              data-testid="link-cart"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-lab-red text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center" data-testid="text-cart-count">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <Link
                href="/account"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded label-mono hover-elevate active-elevate-2"
                data-testid="link-account"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden lg:inline">{user.fullName.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex label-mono px-3 py-2 rounded hover-elevate active-elevate-2"
                data-testid="link-login"
              >
                Sign In
              </Link>
            )}

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
              <div className="h-px bg-white/10 my-2" />
              {user ? (
                <>
                  <Link href="/account" onClick={() => setMenuOpen(false)} className="label-mono py-3 px-3 rounded hover-elevate">My Account</Link>
                  <button onClick={async () => { await logout(); setMenuOpen(false); }} className="text-left label-mono py-3 px-3 rounded hover-elevate flex items-center gap-2"><LogOut className="w-4 h-4" /> Log out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="label-mono py-3 px-3 rounded hover-elevate">Sign in</Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="label-mono py-3 px-3 rounded hover-elevate">Create account</Link>
                </>
              )}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div>
            <p className="label-mono text-white/40 mb-4">Train</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/book" className="hover:text-lab-red">Book a session</Link></li>
              <li><Link href="/membership" className="hover:text-lab-red">Memberships</Link></li>
              <li><Link href="/book" className="hover:text-lab-red">Free consultation</Link></li>
            </ul>
          </div>
          <div>
            <p className="label-mono text-white/40 mb-4">Shop</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop/apparel" className="hover:text-lab-red">Apparel</Link></li>
              <li><Link href="/shop/supplements" className="hover:text-lab-red">Supplements</Link></li>
              <li><Link href="/cart" className="hover:text-lab-red">Cart</Link></li>
            </ul>
          </div>
          <div>
            <p className="label-mono text-white/40 mb-4">Account</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/account" className="hover:text-lab-red">My account</Link></li>
              <li><Link href="/login" className="hover:text-lab-red">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-lab-red">Create account</Link></li>
            </ul>
          </div>
          <div>
            <p className="label-mono text-white/40 mb-4">Connect</p>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.instagram.com/thelab909/" target="_blank" rel="noopener" className="hover:text-lab-red">@thelab909</a></li>
              <li><a href="https://www.facebook.com/thelab909trainingfacility" target="_blank" rel="noopener" className="hover:text-lab-red">Facebook</a></li>
              <li><span className="text-white/40">Inland Empire · 909</span></li>
            </ul>
          </div>
        </div>
        <div className="py-4 select-none pointer-events-none">
          <Logo variant="white" className="w-full h-auto opacity-30" />
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 label-mono text-white/40">
          <span>© 2019–{new Date().getFullYear()} The LAB 909. All rights reserved.</span>
          <span>Inland Empire · Southern California · 909</span>
        </div>
      </div>
    </footer>
  );
}
