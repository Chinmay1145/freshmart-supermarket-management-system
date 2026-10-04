import { useState } from "react";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  Truck,
  Tags,
  ShoppingCart,
  LogOut,
  Menu,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Boxes,
  Wallet,
  Settings,
  UserCircle,
  Undo2,
  Percent,
  IdCard,
  Bell,
  History,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PdfPreviewHost } from "@/components/pdf-preview";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/stock", label: "Stock", icon: Boxes },
  { to: "/restock", label: "AI Restock", icon: Sparkles },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/sales", label: "Sales", icon: Receipt },
  { to: "/purchases", label: "Purchases", icon: ShoppingCart },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/returns", label: "Returns", icon: Undo2 },
  { to: "/discounts", label: "Discounts", icon: Percent },
  { to: "/employees", label: "Employees", icon: IdCard },
  { to: "/expenses", label: "Expenses", icon: Wallet },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/activity", label: "Activity Log", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "My Profile", icon: UserCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const router = useRouter();

  const initials = (user?.email?.[0] ?? "U").toUpperCase();

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("flex flex-col gap-1", mobile && "mt-6")}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              collapsed && !mobile && "justify-center px-2",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {(!collapsed || mobile) && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center gap-2 px-4 py-4", collapsed && !mobile && "justify-center px-2")}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShoppingBag className="h-5 w-5" />
        </div>
        {(!collapsed || mobile) && (
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">FreshMart</span>
        )}
      </div>
      <div className="flex-1 overflow-auto px-3 py-2">
        <NavLinks mobile={mobile} />
      </div>
      {!mobile && (
        <div className="p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="mr-2 h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:flex",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-4 top-3 z-40 lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SidebarContent mobile />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          collapsed ? "lg:ml-[4.5rem]" : "lg:ml-64",
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur sm:px-6">
          <h1 className="ml-10 text-lg font-semibold tracking-tight lg:ml-0">
            {navItems.find((n) => location.pathname === n.to || location.pathname.startsWith(`${n.to}/`))?.label ??
              "FreshMart"}
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="truncate">{user?.email ?? "Account"}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.navigate({ to: "/dashboard" })}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
        <PdfPreviewHost />
      </div>
    </div>
  );
}
