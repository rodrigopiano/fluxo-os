import type { MonthPoint } from "@/lib/net-worth";

const WIDTH = 560;
const HEIGHT = 160;
const BAR_GAP = 12;

const compactCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function NetWorthChart({ points }: { points: MonthPoint[] }) {
  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const barWidth = (WIDTH - BAR_GAP * (points.length - 1)) / points.length;
  const chartHeight = HEIGHT - 28;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Evolução do saldo das contas nos últimos 6 meses">
      {points.map((point, i) => {
        const barHeight = Math.max(((point.value - min) / range) * chartHeight, 2);
        const x = i * (barWidth + BAR_GAP);
        const y = chartHeight - barHeight;

        return (
          <g key={point.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={6}
              className={point.value < 0 ? "fill-red-500/70" : "fill-primary/70"}
            />
            <text
              x={x + barWidth / 2}
              y={chartHeight + 14}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px] capitalize"
            >
              {point.label}
            </text>
            <text
              x={x + barWidth / 2}
              y={Math.max(y - 6, 10)}
              textAnchor="middle"
              className="fill-foreground text-[10px]"
            >
              {compactCurrency.format(point.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
