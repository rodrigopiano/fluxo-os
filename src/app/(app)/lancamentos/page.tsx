import { createClient } from "@/lib/supabase/server";
import { TransactionFormDialog } from "@/components/lancamentos/transaction-form-dialog";
import { TransactionList } from "@/components/lancamentos/transaction-list";
import { ScanReceiptButton } from "@/components/lancamentos/scan-receipt-button";
import { withTransactionTags } from "@/lib/categories";
import type { Account, Card, Category, Subcategory, Tag } from "@/lib/types";

export default async function LancamentosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: accounts },
    { data: transactions },
    { data: cards },
    { data: categories },
    { data: subcategories },
    { data: tags },
  ] = await Promise.all([
    supabase.from("accounts").select("*").eq("user_id", user!.id).order("created_at"),
    supabase
      .from("transactions")
      .select(
        "*, category:categories(id,name,color), subcategory:subcategories(id,name), transaction_tags(tag:tags(id,name,color))",
      )
      .eq("user_id", user!.id)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("cards").select("*").eq("user_id", user!.id).order("created_at"),
    supabase.from("categories").select("*").eq("user_id", user!.id).order("position"),
    supabase.from("subcategories").select("*").eq("user_id", user!.id).order("position"),
    supabase.from("tags").select("*").eq("user_id", user!.id).order("created_at"),
  ]);

  const accountList = (accounts ?? []) as Account[];
  const transactionList = withTransactionTags(transactions ?? []);
  const cardList = (cards ?? []) as Card[];
  const categoryList = (categories ?? []) as Category[];
  const subcategoryList = (subcategories ?? []) as Subcategory[];
  const tagList = (tags ?? []) as Tag[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Lançamentos</h1>
        <div className="flex gap-2">
          <ScanReceiptButton
            accounts={accountList}
            cards={cardList}
            categories={categoryList}
            subcategories={subcategoryList}
            tags={tagList}
          />
          <TransactionFormDialog
            accounts={accountList}
            cards={cardList}
            categories={categoryList}
            subcategories={subcategoryList}
            tags={tagList}
          />
        </div>
      </div>

      <TransactionList
        transactions={transactionList}
        accounts={accountList}
        cards={cardList}
        categories={categoryList}
        subcategories={subcategoryList}
        tags={tagList}
      />
    </div>
  );
}
