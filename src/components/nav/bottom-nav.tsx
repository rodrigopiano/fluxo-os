"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, COMING_SOON_NAV } from "@/components/nav/nav-items";
import { Menu, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 backdrop-blur md:hidden">
      {PRIMARY_NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted-foreground">
            <Menu className="size-5" />
            Mais
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="pb-8">
          <SheetHeader>
            <SheetTitle>Mais módulos</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4">
            {COMING_SOON_NAV.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground/60"
              >
                <item.icon className="size-4" />
                {item.label}
                <span className="ml-auto text-xs">em breve</span>
              </div>
            ))}
            <form action={signOutAction} className="mt-2">
              <Button type="submit" variant="ghost" className="w-full justify-start gap-2">
                <LogOut className="size-4" />
                Sair
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
