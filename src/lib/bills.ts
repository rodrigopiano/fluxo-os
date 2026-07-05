import type { Bill } from "@/lib/types";
import { monthRange, nowInBrazil, toLocalISODate } from "@/lib/format";

export type BillFilter = "todas" | "hoje" | "semana" | "mes" | "atrasadas" | "pagas";

export const BILL_FILTERS: { value: BillFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mês" },
  { value: "atrasadas", label: "Atrasadas" },
  { value: "pagas", label: "Pagas" },
];

export function isOverdue(bill: Bill, reference: Date = nowInBrazil()): boolean {
  return bill.status === "pendente" && bill.due_date < toLocalISODate(reference);
}

export function matchesFilter(
  bill: Bill,
  filter: BillFilter,
  reference: Date = nowInBrazil(),
): boolean {
  const today = toLocalISODate(reference);

  if (filter === "todas") return true;
  if (filter === "pagas") return bill.status === "pago";
  if (filter === "atrasadas") return isOverdue(bill, reference);
  if (bill.status !== "pendente") return false;

  if (filter === "hoje") return bill.due_date === today;

  if (filter === "semana") {
    const weekEnd = new Date(reference);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return bill.due_date >= today && bill.due_date <= toLocalISODate(weekEnd);
  }

  if (filter === "mes") {
    const { end } = monthRange(reference);
    return bill.due_date >= today && bill.due_date <= end;
  }

  return true;
}

export function dueThisWeekCount(bills: Bill[], reference: Date = nowInBrazil()): number {
  return bills.filter((b) => matchesFilter(b, "semana", reference)).length;
}
