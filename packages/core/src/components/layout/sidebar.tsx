"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Separator,
} from "@simplilms/ui";
import { cn } from "@simplilms/ui";
import { createBrowserClient } from "@simplilms/auth";
import { SIDEBAR_NAV, type NavItem } from "../../lib/constants";
import type { UserRole } from "@simplilms/database";
import { toast } from "sonner";

interface SidebarProps {
  role: UserRole;
  userName: string;
  userEmail: string;
  tenantName: string;
  tenantLogoUrl?: string | null;
  tenantLogoFallback?: string;
}

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href + "/"));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  role,
  userName,
  userEmail,
  tenantName,
  tenantLogoUrl,
  tenantLogoFallback,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = SIDEBAR_NAV[role] ?? SIDEBAR_NAV.student;

  async function handleSignOut() {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Failed to sign out");
      return;
    }

    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-2">
        {tenantLogoUrl ? (
          <img
            src={tenantLogoUrl}
            alt={tenantName}
            className="h-8 w-8 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-yellow via-brand-amber to-brand-orange">
            <span className="text-sm font-bold text-white">
              {tenantLogoFallback || tenantName.charAt(0)}
            </span>
          </div>
        )}
        <span className="font-heading text-lg font-bold">{tenantName}</span>
      </div>

      <Separator className="my-3" />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2">
        <NavLinks
          items={navItems}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <Separator className="my-3" />

      {/* User info + sign out */}
      <div className="px-3 py-2">
        <div className="mb-3">
          <p className="text-sm font-medium truncate">{userName}</p>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
        <div className="flex h-full flex-col py-4">{sidebarContent}</div>
      </aside>

      {/* Mobile trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col py-4">{sidebarContent}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
