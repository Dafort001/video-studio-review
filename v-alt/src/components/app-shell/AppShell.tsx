"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import type { NavGroup } from "./types";

type AppShellProps = {
  groups: NavGroup[];
  children: React.ReactNode;
  homeHref?: string;
  badge?: React.ReactNode;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  activeMatch?: "exact" | "prefix";
  maxWidthClassName?: string;
  desktopHeader?: boolean;
  areaLabel?: React.ReactNode;
  mainClassName?: string;
};

export function AppShell({
  groups,
  children,
  homeHref = "/",
  badge,
  headerRight,
  footer,
  activeMatch = "prefix",
  maxWidthClassName,
  desktopHeader = false,
  areaLabel,
  mainClassName,
}: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(
      groups
        .filter((group) => group.collapsible && group.label)
        .map((group) => [group.label as string, Boolean(group.defaultOpen)]),
    ),
  );

  const isActive = (url: string) => {
    const targetPath = url.split(/[?#]/, 1)[0];
    if (targetPath === "/dashboard") return pathname === targetPath;
    return activeMatch === "exact"
      ? pathname === targetPath
      : pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  };

  const closeMobile = () => setSidebarOpen(false);
  const itemLink = (
    item: NavGroup["items"][number],
    { sub = false }: { sub?: boolean } = {},
  ) => {
    const Icon = item.icon;
    const active = isActive(item.url);
    return (
      <li key={item.title}>
        <Link
          href={item.url}
          onClick={closeMobile}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            sub ? "font-normal" : "font-medium",
            active
              ? "bg-primary text-primary-foreground"
              : sub
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-foreground hover:bg-muted",
          )}
        >
          <Icon className={cn("shrink-0", sub ? "size-4" : "size-5")} />
          <span className="truncate">{item.title}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        id="dashboard-sidebar"
        aria-label="Kundenbereich Navigation"
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 transform border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4">
            <Link href={homeHref} className="flex items-center">
              <Logo size="sm" showText />
            </Link>
            <button
              type="button"
              className="rounded-md p-2 hover:bg-muted lg:hidden"
              onClick={closeMobile}
              aria-label="Menü schließen"
            >
              <X className="size-5 text-muted-foreground" />
            </button>
          </div>

          {badge ? <div className="px-4 pb-2">{badge}</div> : null}

          <nav className="flex-1 overflow-y-auto p-3">
            <div className="space-y-4">
              {groups.map((group, groupIndex) => {
                const key = group.label ?? `group-${groupIndex}`;
                if (group.collapsible && group.label) {
                  const open = openSections[group.label];
                  const SectionIcon = group.icon;
                  return (
                    <div key={key}>
                      <button
                        type="button"
                        onClick={() => setOpenSections((current) => ({
                          ...current,
                          [group.label as string]: !current[group.label as string],
                        }))}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        aria-expanded={open}
                      >
                        <span className="flex items-center gap-3">
                          {SectionIcon ? <SectionIcon className="size-5 shrink-0" /> : null}
                          {group.label}
                        </span>
                        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
                      </button>
                      {open ? (
                        <ul className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                          {group.items.map((item) => itemLink(item, { sub: true }))}
                        </ul>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <div key={key}>
                    {group.label ? (
                      <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {group.label}
                      </div>
                    ) : null}
                    <ul className="space-y-1">{group.items.map((item) => itemLink(item))}</ul>
                  </div>
                );
              })}
            </div>
          </nav>

          {footer ? <div className="border-t border-sidebar-border p-4">{footer}</div> : null}
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header
          className={cn(
            "sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur",
            desktopHeader ? "" : "lg:hidden",
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 lg:px-8">
            <button
              type="button"
              className="rounded-md p-2 text-foreground hover:bg-muted lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menü öffnen"
              aria-controls="dashboard-sidebar"
              aria-expanded={sidebarOpen}
            >
              <Menu className="size-6" />
            </button>
            <div className="ml-auto flex items-center gap-3">
              {headerRight}
              {areaLabel ? (
                <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
                  {areaLabel}
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <main className={cn("flex-1", mainClassName ?? "p-4 lg:p-8")}>
          {maxWidthClassName ? (
            <div className={cn("mx-auto", maxWidthClassName)}>{children}</div>
          ) : children}
        </main>
      </div>
    </div>
  );
}
