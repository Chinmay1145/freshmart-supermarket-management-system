import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Menu, Moon, ShoppingBag, Sun } from "lucide-react";

const links = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "Help" },
] as const;

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">FreshMart</span>
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-sm font-medium text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-primary">
                    <ShoppingBag className="h-5 w-5" /> FreshMart
                  </SheetTitle>
                </SheetHeader>
                <nav aria-label="Mobile navigation" className="mt-8 flex flex-col gap-1">
                  {[...links, { to: "/contact", label: "Contact" }, { to: "/careers", label: "Careers" }].map((l) => (
                    <SheetClose asChild key={l.to}>
                      <Link
                        to={l.to}
                        className="rounded-md px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        activeProps={{ className: "rounded-md bg-accent px-3 py-3 text-sm font-medium text-accent-foreground" }}
                      >
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          {isAuthenticated ? (
            <Button asChild className="rounded-full shadow-glow">
                <Link to="/dashboard"><span className="hidden sm:inline">Go to </span>Dashboard</Link>
            </Button>
          ) : (
            <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild className="rounded-full shadow-glow">
                  <Link to="/auth/signup"><span className="hidden sm:inline">Get </span>started</Link>
              </Button>
            </>
          )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-card">
        <div className="container mx-auto grid gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <ShoppingBag className="h-5 w-5" />
              <span className="font-bold tracking-tight">FreshMart</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Retail management for supermarkets, grocers and multi-store chains — billing, stock and reporting in one
              place.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><Link to="/integrations" className="hover:text-foreground">Integrations</Link></li>
              <li><Link to="/security" className="hover:text-foreground">Security</Link></li>
              <li><Link to="/auth/signup" className="hover:text-foreground">Create account</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">About us</Link></li>
              <li><Link to="/customer-stories" className="hover:text-foreground">Customer stories</Link></li>
              <li><Link to="/careers" className="hover:text-foreground">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/blog" className="hover:text-foreground">Blog & news</Link></li>
              <li><Link to="/faq" className="hover:text-foreground">Help centre</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Get in touch</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>billing@freshmart.in</li>
              <li>+91 98765 43210</li>
              <li>14 MG Road, Pune 411001</li>
            </ul>
          </div>
        </div>
        <div className="border-t px-6 py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} FreshMart Retail Systems. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
