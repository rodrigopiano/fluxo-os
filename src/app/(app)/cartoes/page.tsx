import { createClient } from "@/lib/supabase/server";
import { CardFormDialog } from "@/components/cartoes/card-form-dialog";
import { CardSummaryCard } from "@/components/cartoes/card-summary-card";
import { PurchaseList } from "@/components/cartoes/purchase-list";
import type { Card, CardPurchase, Category, Subcategory } from "@/lib/types";

export default async function CartoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: cards }, { data: purchases }, { data: categories }, { data: subcategories }] =
    await Promise.all([
      supabase.from("cards").select("*").eq("user_id", user!.id).order("created_at"),
      supabase
        .from("card_purchases")
        .select("*, category:categories(id,name,color), subcategory:subcategories(id,name)")
        .eq("user_id", user!.id)
        .order("purchased_on", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("*").eq("user_id", user!.id).order("position"),
      supabase.from("subcategories").select("*").eq("user_id", user!.id).order("position"),
    ]);

  const cardList = (cards ?? []) as Card[];
  const purchaseList = (purchases ?? []) as unknown as CardPurchase[];
  const categoryList = (categories ?? []) as Category[];
  const subcategoryList = (subcategories ?? []) as Subcategory[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Cartões</h1>
        <CardFormDialog />
      </div>

      {cardList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Você ainda não tem cartões cadastrados. Adicione um cartão de crédito para acompanhar
          limite, fatura e parcelamentos.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cardList.map((card) => (
            <CardSummaryCard
              key={card.id}
              card={card}
              allCards={cardList}
              purchases={purchaseList}
              categories={categoryList}
              subcategories={subcategoryList}
            />
          ))}
        </div>
      )}

      {cardList.length > 0 ? (
        <div>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Compras recentes</h2>
          <PurchaseList
            purchases={purchaseList.slice(0, 20)}
            cards={cardList}
            categories={categoryList}
            subcategories={subcategoryList}
          />
        </div>
      ) : null}
    </div>
  );
}
