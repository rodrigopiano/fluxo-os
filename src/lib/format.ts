const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
}

const BRAZIL_TIME_ZONE = "America/Sao_Paulo";

/**
 * The server can run in any timezone (e.g. UTC on Vercel). FluxoOS is a
 * Brazil-only product, so "hoje" must always reflect America/Sao_Paulo,
 * not the host machine's clock.
 */
export function nowInBrazil(): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BRAZIL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
}

export function daysRemainingInMonth(reference: Date = nowInBrazil()): number {
  const lastDay = new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate();
  return lastDay - reference.getDate() + 1;
}

export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function monthRange(reference: Date = nowInBrazil()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  return { start: toLocalISODate(start), end: toLocalISODate(end) };
}
