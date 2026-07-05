import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { goalProgress } from "@/lib/goals";
import type { Goal } from "@/lib/types";

export function EmergencyReserveCard({ goal }: { goal: Goal | undefined }) {
  return (
    <Link href="/metas">
      <Card className="h-full transition-colors hover:bg-accent">
        <CardContent className="flex flex-col gap-2">
          <ShieldCheck className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Reserva de emergência</p>
          {goal ? (
            <p className="text-xl font-semibold tracking-tight">
              {Math.round(goalProgress(goal) * 100)}% da meta
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/70">Ainda não definida</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
