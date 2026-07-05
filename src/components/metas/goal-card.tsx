import { Trash2, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { goalProgress, projectedDate } from "@/lib/goals";
import { deleteGoalAction } from "@/lib/actions/goals";
import { GoalFormDialog } from "@/components/metas/goal-form-dialog";
import type { Goal } from "@/lib/types";

export function GoalCard({ goal, monthlySavings }: { goal: Goal; monthlySavings: number }) {
  const progress = goalProgress(goal);
  const date = projectedDate(goal, monthlySavings);
  const dateLabel = date
    ? new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date)
    : "sem ritmo de poupança definido";

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {goal.is_emergency_reserve ? (
            <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
          ) : null}
          <p className="min-w-0 flex-1 truncate font-medium">{goal.name}</p>
          <div className="flex shrink-0 items-center gap-1">
            <GoalFormDialog goal={goal} />
            <form action={deleteGoalAction}>
              <input type="hidden" name="id" value={goal.id} />
              <Button variant="ghost" size="icon" className="size-8" type="submit">
                <Trash2 className="size-4" />
              </Button>
            </form>
          </div>
        </div>

        <Progress value={progress * 100} />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}
          </span>
          <span className="font-medium">{Math.round(progress * 100)}%</span>
        </div>

        <p className="text-xs text-muted-foreground">
          {progress >= 1 ? "Meta alcançada 🎉" : `Previsão: ${dateLabel}`}
        </p>
      </CardContent>
    </Card>
  );
}
