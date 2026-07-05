import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function NetWorthCard({ netWorth }: { netWorth: number }) {
  return (
    <Link href="/patrimonio">
      <Card className="h-full transition-colors hover:bg-accent">
        <CardContent className="flex flex-col gap-2">
          <TrendingUp className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Patrimônio</p>
          <p className="text-xl font-semibold tracking-tight">{formatCurrency(netWorth)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
