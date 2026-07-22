export type TransactionType = "receita" | "despesa" | "transferencia";

export type CategoryKind = Exclude<TransactionType, "transferencia">;

export type Category = {
  id: string;
  user_id: string;
  name: string;
  kind: CategoryKind;
  color: string;
  position: number;
  created_at: string;
};

export type Subcategory = {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  position: number;
  created_at: string;
};

export type Tag = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type ExtractedReceipt = {
  amount: number | null;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  categoryId: string | null;
  subcategoryId: string | null;
  type: Exclude<TransactionType, "transferencia">;
  occurredOn: string | null;
};

export type ImportRow = {
  externalId: string;
  occurredOn: string;
  amount: number;
  type: Exclude<TransactionType, "transferencia">;
  description: string;
  categoryId: string | null;
  subcategoryId: string | null;
  isDuplicate: boolean;
};

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

export type CategoryRef = { id: string; name: string; color: string } | null;
export type SubcategoryRef = { id: string; name: string } | null;

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string;
  destination_account_id: string | null;
  type: TransactionType;
  amount: number;
  category_id: string | null;
  subcategory_id: string | null;
  category?: CategoryRef;
  subcategory?: SubcategoryRef;
  tags?: Tag[];
  description: string | null;
  occurred_on: string;
  external_id: string | null;
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
  category_id: string | null;
  subcategory_id: string | null;
  category?: CategoryRef;
  subcategory?: SubcategoryRef;
  amount: number;
  installments_total: number;
  purchased_on: string;
  created_at: string;
};

export type BillDirection = "pagar" | "receber";
export type BillStatus = "pendente" | "pago";

export type Bill = {
  id: string;
  user_id: string;
  direction: BillDirection;
  description: string;
  category_id: string | null;
  subcategory_id: string | null;
  category?: CategoryRef;
  subcategory?: SubcategoryRef;
  amount: number;
  due_date: string;
  status: BillStatus;
  paid_on: string | null;
  account_id: string | null;
  transaction_id: string | null;
  is_recurring: boolean;
  created_at: string;
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

