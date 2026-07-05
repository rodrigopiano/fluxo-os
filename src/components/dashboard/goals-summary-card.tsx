import Link from "next/link";
import { Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Goal } from "@/lib/types";

export function GoalsSummaryCard({ goals }: { goals: Goal[] }) {
  const achieved = goals.filter((g) => g.current_amount >= g.target_amount).length;

  return (
    <Link href="/metas">
      <Card className="h-full transition-colors hover:bg-accent">
        <CardContent className="flex flex-col gap-2">
          <Target className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Objetivos financeiros</p>
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground/70">Nenhum objetivo ainda</p>
          ) : (
            <p className="text-xl font-semibold tracking-tight">
              {achieved}/{goals.length} alcançados
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
