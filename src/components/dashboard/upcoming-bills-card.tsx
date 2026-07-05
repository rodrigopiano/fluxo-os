import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { matchesFilter } from "@/lib/bills";
import type { Bill } from "@/lib/types";

export function UpcomingBillsCard({ bills }: { bills: Bill[] }) {
  const dueThisWeek = bills
    .filter((b) => matchesFilter(b, "semana"))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  return (
    <Link href="/contas-a-pagar">
      <Card className="h-full transition-colors hover:bg-accent">
        <CardContent className="flex flex-col gap-2">
          <CalendarClock className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Contas que vencem esta semana</p>
          {dueThisWeek.length === 0 ? (
            <p className="text-sm text-muted-foreground/70">Nenhuma pendência</p>
          ) : (
            <>
              <p className="text-xl font-semibold tracking-tight">
                {formatCurrency(dueThisWeek.reduce((sum, b) => sum + b.amount, 0))}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {dueThisWeek.length === 1
                  ? `${dueThisWeek[0].description} · ${formatDate(dueThisWeek[0].due_date)}`
                  : `${dueThisWeek.length} contas nos próximos 7 dias`}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
