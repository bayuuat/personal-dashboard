"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Menu, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Job Sniper", icon: Briefcase },
  { href: "/mana-uang", label: "Mana Uang", icon: Wallet },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const activePath = useMemo(() => {
    if (pathname?.startsWith("/mana-uang")) return "/mana-uang";
    return "/";
  }, [pathname]);

  return (
    <>
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="outline" size="icon" onClick={() => setOpen((prev) => !prev)}>
          <Menu />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      {open && (
        <button
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-[4.5rem] items-center border-b border-sidebar-border px-5">
          <Link href="/" className="group" onClick={() => setOpen(false)}>
            <p className="text-xl font-semibold italic tracking-tight text-foreground">Dashboard.</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Personal workspace</p>
          </Link>
        </div>

        <nav className="flex flex-col gap-1.5 px-3 py-4">
          <p className="px-3 pb-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4 shrink-0 opacity-90" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
