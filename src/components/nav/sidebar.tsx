"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, COMING_SOON_NAV } from "@/components/nav/nav-items";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";

export function Sidebar({ fullName }: { fullName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/40 p-4 md:flex">
      <p className="px-2 py-3 text-lg font-semibold tracking-tight">FluxoOS</p>

      <nav className="mt-4 flex flex-1 flex-col gap-1">
        {PRIMARY_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}

        <p className="mt-6 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
          Em breve
        </p>
        {COMING_SOON_NAV.map((item) => (
          <div
            key={item.label}
            className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground/50"
          >
            <item.icon className="size-4" />
            {item.label}
          </div>
        ))}
      </nav>

      <div className="mt-4 border-t border-border pt-4">
        <p className="truncate px-2 text-sm font-medium">{fullName}</p>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="mt-1 w-full justify-start gap-2 text-muted-foreground"
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </form>
      </div>
    </aside>
  );
}
