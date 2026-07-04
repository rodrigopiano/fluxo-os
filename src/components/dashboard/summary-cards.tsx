import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function SummaryCards({
  totalBalance,
  canSpendToday,
  monthIncome,
  monthExpense,
  monthSavings,
}: {
  totalBalance: number;
  canSpendToday: number;
  monthIncome: number;
  monthExpense: number;
  monthSavings: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Card className="bg-gradient-to-br from-primary/15 to-transparent">
        <CardContent>
          <p className="text-sm text-muted-foreground">Saldo total</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">
            {formatCurrency(totalBalance)}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Pode gastar hoje"
          value={canSpendToday}
          hint="estimativa: saldo ÷ dias restantes do mês"
        />
        <MetricCard label="Entrou este mês" value={monthIncome} tone="positive" />
        <MetricCard label="Saiu este mês" value={monthExpense} tone="negative" />
        <MetricCard
          label="Economia do mês"
          value={monthSavings}
          tone={monthSavings >= 0 ? "positive" : "negative"}
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number;
  tone?: "positive" | "negative";
  hint?: string;
}) {
  const toneClass =
    tone === "positive" ? "text-emerald-500" : tone === "negative" ? "text-red-500" : "";

  return (
    <Card>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-1 text-xl font-semibold tracking-tight ${toneClass}`}>
          {formatCurrency(value)}
        </p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
