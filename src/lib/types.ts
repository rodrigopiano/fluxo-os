export type TransactionType = "receita" | "despesa" | "transferencia";

export type Account = {
  id: string;
  user_id: string;
  name: string;
  institution: string;
  color: string;
  initial_balance: number;
  is_active: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string;
  destination_account_id: string | null;
  type: TransactionType;
  amount: number;
  category: string | null;
  description: string | null;
  occurred_on: string;
  created_at: string;
};

export type Card = {
  id: string;
  user_id: string;
  name: string;
  institution: string;
  color: string;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  is_active: boolean;
  created_at: string;
};

export type CardPurchase = {
  id: string;
  user_id: string;
  card_id: string;
  description: string;
  category: string | null;
  amount: number;
  installments_total: number;
  purchased_on: string;
  created_at: string;
};

export const CARD_PURCHASE_CATEGORIES = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Assinaturas",
  "Lazer",
  "Educação",
  "Compras",
  "Outros",
];

export const INSTITUTIONS = [
  "Banco do Brasil",
  "Inter",
  "Mercado Pago",
  "PicPay",
  "Nubank",
  "Caixa",
  "Dinheiro",
  "Carteira",
  "Outro",
] as const;

export const CATEGORIES: Record<Exclude<TransactionType, "transferencia">, string[]> = {
  receita: ["Salário", "Freelance", "Comissão", "Aluguel recebido", "Dividendos", "Outros"],
  despesa: [
    "Moradia",
    "Alimentação",
    "Transporte",
    "Saúde",
    "Assinaturas",
    "Lazer",
    "Educação",
    "Impostos",
    "Outros",
  ],
};
