import { useEffect } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient, apiRequest, getAuthToken } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { captureUtmFromUrl } from "@/lib/utm";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Book from "@/pages/Book";
import Membership from "@/pages/Membership";
import Shop from "@/pages/Shop";
import Product from "@/pages/Product";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Booked from "@/pages/Booked";
import Soon from "@/pages/Soon";

function AppRouter() {
  return (
    <Switch>
      {/*
       * 2026-05 — site is in pre-launch "coming soon" mode. The waitlist page
       * is mounted at "/" so any visitor to thelab909.com sees only the
       * email capture. The full site stays accessible via direct routes
       * (/site for the marketing home, plus /book, /shop, /membership, etc.)
       * so the team can preview while we collect the waitlist. To go live,
       * swap the "/" route back to Home and delete the /site alias.
       */}
      <Route path="/" component={Soon} />
      <Route path="/site" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/book" component={Book} />
      <Route path="/membership" component={Membership} />
      <Route path="/shop/:category" component={Shop} />
      <Route path="/product/:slug" component={Product} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/account" component={Account} />
      <Route path="/admin" component={Admin} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/booked" component={Booked} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Capture first-touch UTM tags from IG/social bio links (P7).
  useEffect(() => {
    captureUtmFromUrl();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Router hook={useHashLocation}>
              <AppRouter />
            </Router>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
