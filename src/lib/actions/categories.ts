"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CategoryKind } from "@/lib/types";

export type FormState = { error: string | null };

function revalidateAll() {
  revalidatePath("/categorias");
  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
  revalidatePath("/contas-a-pagar");
  revalidatePath("/contas-a-receber");
  revalidatePath("/cartoes");
}

export async function upsertCategoryAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim();
  const kind = formData.get("kind")?.toString() as CategoryKind;
  const color = formData.get("color")?.toString() || "#64748b";

  if (!name) return { error: "Informe um nome para a categoria." };
  if (kind !== "despesa" && kind !== "receita") return { error: "Tipo inválido." };

  if (id) {
    const { error } = await supabase
      .from("categories")
      .update({ name, color })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return { error: "Não foi possível salvar a categoria." };
  } else {
    const { data: existing } = await supabase
      .from("categories")
      .select("position")
      .eq("user_id", user.id)
      .eq("kind", kind)
      .order("position", { ascending: false })
      .limit(1);
    const position = (existing?.[0]?.position ?? -1) + 1;

    const { error } = await supabase
      .from("categories")
      .insert({ user_id: user.id, name, kind, color, position });
    if (error) return { error: "Não foi possível criar a categoria." };
  }

  revalidateAll();
  return { error: null };
}

export async function deleteCategoryAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  if (!id) return;

  await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id);

  revalidateAll();
}

export async function moveCategoryAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  const direction = formData.get("direction")?.toString();
  if (!id || (direction !== "up" && direction !== "down")) return;

  const { data: current } = await supabase
    .from("categories")
    .select("id, kind, position")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!current) return;

  const neighborQuery = supabase
    .from("categories")
    .select("id, position")
    .eq("user_id", user.id)
    .eq("kind", current.kind);

  const { data: neighbor } =
    direction === "up"
      ? await neighborQuery
          .lt("position", current.position)
          .order("position", { ascending: false })
          .limit(1)
          .maybeSingle()
      : await neighborQuery
          .gt("position", current.position)
          .order("position", { ascending: true })
          .limit(1)
          .maybeSingle();
  if (!neighbor) return;

  await supabase.from("categories").update({ position: neighbor.position }).eq("id", current.id);
  await supabase.from("categories").update({ position: current.position }).eq("id", neighbor.id);

  revalidateAll();
}

export async function upsertSubcategoryAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const id = formData.get("id")?.toString();
  const categoryId = formData.get("categoryId")?.toString();
  const name = formData.get("name")?.toString().trim();

  if (!categoryId) return { error: "Categoria inválida." };
  if (!name) return { error: "Informe um nome para a subcategoria." };

  if (id) {
    const { error } = await supabase
      .from("subcategories")
      .update({ name })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return { error: "Não foi possível salvar a subcategoria." };
  } else {
    const { data: existing } = await supabase
      .from("subcategories")
      .select("position")
      .eq("category_id", categoryId)
      .order("position", { ascending: false })
      .limit(1);
    const position = (existing?.[0]?.position ?? -1) + 1;

    const { error } = await supabase
      .from("subcategories")
      .insert({ user_id: user.id, category_id: categoryId, name, position });
    if (error) return { error: "Não foi possível criar a subcategoria." };
  }

  revalidateAll();
  return { error: null };
}

export async function deleteSubcategoryAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  if (!id) return;

  await supabase.from("subcategories").delete().eq("id", id).eq("user_id", user.id);

  revalidateAll();
}

export async function moveSubcategoryAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  const direction = formData.get("direction")?.toString();
  if (!id || (direction !== "up" && direction !== "down")) return;

  const { data: current } = await supabase
    .from("subcategories")
    .select("id, category_id, position")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!current) return;

  const neighborQuery = supabase
    .from("subcategories")
    .select("id, position")
    .eq("user_id", user.id)
    .eq("category_id", current.category_id);

  const { data: neighbor } =
    direction === "up"
      ? await neighborQuery
          .lt("position", current.position)
          .order("position", { ascending: false })
          .limit(1)
          .maybeSingle()
      : await neighborQuery
          .gt("position", current.position)
          .order("position", { ascending: true })
          .limit(1)
          .maybeSingle();
  if (!neighbor) return;

  await supabase
    .from("subcategories")
    .update({ position: neighbor.position })
    .eq("id", current.id);
  await supabase
    .from("subcategories")
    .update({ position: current.position })
    .eq("id", neighbor.id);

  revalidateAll();
}

export async function upsertTagAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim();
  const color = formData.get("color")?.toString() || "#64748b";

  if (!name) return { error: "Informe um nome para a tag." };

  const { error } = id
    ? await supabase.from("tags").update({ name, color }).eq("id", id).eq("user_id", user.id)
    : await supabase.from("tags").insert({ user_id: user.id, name, color });

  if (error) return { error: "Não foi possível salvar a tag." };

  revalidateAll();
  return { error: null };
}

export async function deleteTagAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  if (!id) return;

  await supabase.from("tags").delete().eq("id", id).eq("user_id", user.id);

  revalidateAll();
}
