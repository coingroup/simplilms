"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@simplilms/ui";
import { createBrowserClient } from "@simplilms/auth";
import { toast } from "sonner";

interface TopbarProps {
  userName: string;
  /** The mobile menu trigger is rendered by the Sidebar component */
  mobileMenuTrigger?: React.ReactNode;
}

export function Topbar({ userName, mobileMenuTrigger }: TopbarProps) {
  const router = useRouter();

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

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-2">
        {mobileMenuTrigger}
      </div>

      <div className="flex items-center gap-2">
        <Link href="/profile">
          <Button variant="ghost" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{userName}</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
