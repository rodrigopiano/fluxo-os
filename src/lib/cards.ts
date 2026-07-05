import type { Card, CardPurchase } from "@/lib/types";
import { nowInBrazil } from "@/lib/format";

export type Installment = {
  installmentNumber: number;
  totalInstallments: number;
  billMonthIndex: number;
  amount: number;
  purchase: CardPurchase;
};

function monthIndex(year: number, month0based: number): number {
  return year * 12 + month0based;
}

export function monthIndexLabel(index: number): string {
  const year = Math.floor(index / 12);
  const month = index % 12;
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
    new Date(year, month, 1),
  );
}

/** The bill month a purchase enters: this month if before the closing day, otherwise next month. */
function firstBillMonthIndex(purchasedOn: string, closingDay: number): number {
  const [year, month, day] = purchasedOn.split("-").map(Number);
  const base = monthIndex(year, month - 1);
  return day <= closingDay ? base : base + 1;
}

export function installmentSchedule(purchase: CardPurchase, card: Card): Installment[] {
  const total = purchase.installments_total;
  const base = Math.round((purchase.amount / total) * 100) / 100;
  const roundedTotal = base * (total - 1);
  const lastAmount = Math.round((purchase.amount - roundedTotal) * 100) / 100;
  const firstMonth = firstBillMonthIndex(purchase.purchased_on, card.closing_day);

  return Array.from({ length: total }, (_, i) => ({
    installmentNumber: i + 1,
    totalInstallments: total,
    billMonthIndex: firstMonth + i,
    amount: i === total - 1 ? lastAmount : base,
    purchase,
  }));
}

function currentBillMonthIndex(card: Card, reference: Date): number {
  return firstBillMonthIndex(
    `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, "0")}-${String(reference.getDate()).padStart(2, "0")}`,
    card.closing_day,
  );
}

export function allInstallments(card: Card, purchases: CardPurchase[]): Installment[] {
  return purchases.filter((p) => p.card_id === card.id).flatMap((p) => installmentSchedule(p, card));
}

export function currentInvoiceTotal(
  card: Card,
  purchases: CardPurchase[],
  reference: Date = nowInBrazil(),
): number {
  const target = currentBillMonthIndex(card, reference);
  return allInstallments(card, purchases)
    .filter((i) => i.billMonthIndex === target)
    .reduce((sum, i) => sum + i.amount, 0);
}

export function availableLimit(
  card: Card,
  purchases: CardPurchase[],
  reference: Date = nowInBrazil(),
): number {
  const target = currentBillMonthIndex(card, reference);
  const outstanding = allInstallments(card, purchases)
    .filter((i) => i.billMonthIndex >= target)
    .reduce((sum, i) => sum + i.amount, 0);
  return card.credit_limit - outstanding;
}

export function nextDueDate(card: Card, reference: Date = nowInBrazil()): Date {
  const dueThisMonth = new Date(reference.getFullYear(), reference.getMonth(), card.due_day);
  if (reference.getDate() <= card.due_day) return dueThisMonth;
  return new Date(reference.getFullYear(), reference.getMonth() + 1, card.due_day);
}

export function activeInstallmentPurchases(card: Card, purchases: CardPurchase[]): CardPurchase[] {
  return purchases.filter((p) => p.card_id === card.id && p.installments_total > 1);
}

export function installmentsElapsed(
  purchase: CardPurchase,
  card: Card,
  reference: Date = nowInBrazil(),
): number {
  const target = currentBillMonthIndex(card, reference);
  const firstMonth = firstBillMonthIndex(purchase.purchased_on, card.closing_day);
  return Math.min(Math.max(target - firstMonth, 0), purchase.installments_total);
}
