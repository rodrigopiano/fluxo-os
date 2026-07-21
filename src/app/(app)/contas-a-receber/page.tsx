import { createClient } from "@/lib/supabase/server";
import { BillFormDialog } from "@/components/contas-a-pagar/bill-form-dialog";
import { BillList } from "@/components/contas-a-pagar/bill-list";
import type { Account, Bill, Category, Subcategory } from "@/lib/types";

export default async function ContasAReceberPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: bills }, { data: accounts }, { data: categories }, { data: subcategories }] =
    await Promise.all([
      supabase
        .from("bills")
        .select("*, category:categories(id,name,color), subcategory:subcategories(id,name)")
        .eq("user_id", user!.id)
        .eq("direction", "receber")
        .order("due_date", { ascending: true }),
      supabase.from("accounts").select("*").eq("user_id", user!.id),
      supabase.from("categories").select("*").eq("user_id", user!.id).order("position"),
      supabase.from("subcategories").select("*").eq("user_id", user!.id).order("position"),
    ]);

  const categoryList = (categories ?? []) as Category[];
  const subcategoryList = (subcategories ?? []) as Subcategory[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Contas a receber</h1>
        <BillFormDialog direction="receber" categories={categoryList} subcategories={subcategoryList} />
      </div>
      <BillList
        bills={(bills ?? []) as unknown as Bill[]}
        direction="receber"
        accounts={(accounts ?? []) as Account[]}
        categories={categoryList}
        subcategories={subcategoryList}
      />
    </div>
  );
}
