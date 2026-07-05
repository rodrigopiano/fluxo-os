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

export type BillDirection = "pagar" | "receber";
export type BillStatus = "pendente" | "pago";

export type Bill = {
  id: string;
  user_id: string;
  direction: BillDirection;
  description: string;
  category: string | null;
  amount: number;
  due_date: string;
  status: BillStatus;
  paid_on: string | null;
  created_at: string;
};

export const BILL_CATEGORIES: Record<BillDirection, string[]> = {
  pagar: [
    "Água",
    "Luz",
    "Internet",
    "Aluguel",
    "Impostos",
    "Assinaturas",
    "Parcelamentos",
    "Outros",
  ],
  receber: ["Comissão", "Salário", "Freela", "Cliente", "Aluguel", "Dividendos", "Outros"],
};

export type AssetCategory = "investimento" | "imovel" | "veiculo" | "consorcio" | "empresa" | "outro";

export type Asset = {
  id: string;
  user_id: string;
  category: AssetCategory;
  name: string;
  current_value: number;
  notes: string | null;
  created_at: string;
};

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  investimento: "Investimento",
  imovel: "Imóvel",
  veiculo: "Veículo",
  consorcio: "Consórcio",
  empresa: "Empresa",
  outro: "Outro",
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  is_emergency_reserve: boolean;
  created_at: string;
};

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
