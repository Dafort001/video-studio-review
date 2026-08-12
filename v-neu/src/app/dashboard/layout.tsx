"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldCheck, User } from "lucide-react";
import { SessionProvider, signOut, useSession } from "next-auth/react";

import { AppShell } from "@/components/app-shell/AppShell";
import { getPiximmoCustomerNavGroups } from "@/components/app-shell/nav-config";
import { NotificationsBell } from "@/components/NotificationsBell";

function initialsFor(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts.at(-1)?.charAt(0) ?? ""}`.toUpperCase();
}

function CustomerPortalShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const name = user?.name?.trim() || "Kundenkonto";
  const email = user?.email || "";

  return (
    <AppShell
      groups={getPiximmoCustomerNavGroups(isAdmin)}
      homeHref="/"
      desktopHeader
      areaLabel="Kundenbereich"
      headerRight={<NotificationsBell />}
      maxWidthClassName="max-w-[1600px]"
      footer={(
        <div>
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initialsFor(name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">{name}</div>
              <div className="truncate text-xs text-muted-foreground">{email}</div>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <User className="h-4 w-4" />
              Profil bearbeiten
            </Link>
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-2 rounded-md bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/15"
              >
                <ShieldCheck className="h-4 w-4" />
                Zum Adminbereich
              </Link>
            )}
            <button
              type="button"
              onClick={() => { void signOut({ redirectTo: "/auth/signin" }); }}
              className="flex w-full items-center gap-2 rounded-md px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </AppShell>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard/admin")) return <>{children}</>;
  return <SessionProvider><CustomerPortalShell>{children}</CustomerPortalShell></SessionProvider>;
}
