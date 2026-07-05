"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AssetCategory } from "@/lib/types";

export type FormState = { error: string | null };

export async function upsertAssetAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const id = formData.get("id")?.toString();
  const category = formData.get("category")?.toString() as AssetCategory;
  const name = formData.get("name")?.toString().trim();
  const currentValue = Number(formData.get("currentValue"));
  const notes = formData.get("notes")?.toString() || null;

  if (!name) return { error: "Informe um nome para o ativo." };
  if (Number.isNaN(currentValue) || currentValue < 0) return { error: "Valor inválido." };

  const payload = {
    user_id: user.id,
    category,
    name,
    current_value: currentValue,
    notes,
  };

  const { error } = id
    ? await supabase.from("assets").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("assets").insert(payload);

  if (error) return { error: "Não foi possível salvar o ativo." };

  revalidatePath("/patrimonio");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteAssetAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  if (!id) return;

  await supabase.from("assets").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/patrimonio");
  revalidatePath("/dashboard");
}
