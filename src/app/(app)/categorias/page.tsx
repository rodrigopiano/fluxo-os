import { createClient } from "@/lib/supabase/server";
import { CategoryList } from "@/components/categorias/category-list";
import { CategoryFormDialog } from "@/components/categorias/category-form-dialog";
import { TagList } from "@/components/categorias/tag-list";
import { TagFormDialog } from "@/components/categorias/tag-form-dialog";
import type { Category, Subcategory, Tag } from "@/lib/types";

export default async function CategoriasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: categories }, { data: subcategories }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("*").eq("user_id", user!.id).order("position"),
    supabase.from("subcategories").select("*").eq("user_id", user!.id).order("position"),
    supabase.from("tags").select("*").eq("user_id", user!.id).order("created_at"),
  ]);

  const categoryList = (categories ?? []) as Category[];
  const subcategoryList = (subcategories ?? []) as Subcategory[];
  const tagList = (tags ?? []) as Tag[];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
        <p className="text-sm text-muted-foreground">
          Organize categorias, subcategorias e tags usadas em lançamentos, cartões e contas.
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Despesas</h2>
          <CategoryFormDialog kind="despesa" />
        </div>
        <CategoryList
          kind="despesa"
          categories={categoryList.filter((c) => c.kind === "despesa")}
          subcategories={subcategoryList}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Receitas</h2>
          <CategoryFormDialog kind="receita" />
        </div>
        <CategoryList
          kind="receita"
          categories={categoryList.filter((c) => c.kind === "receita")}
          subcategories={subcategoryList}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Tags</h2>
          <TagFormDialog />
        </div>
        <TagList tags={tagList} />
      </div>
    </div>
  );
}
