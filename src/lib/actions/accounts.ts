"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

export async function upsertAccountAction(
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
  const institution = formData.get("institution")?.toString() || "Outro";
  const color = formData.get("color")?.toString() || "#10b981";
  const initialBalance = Number(formData.get("initialBalance") ?? 0);

  if (!name) return { error: "Informe um nome para a conta." };
  if (Number.isNaN(initialBalance)) return { error: "Saldo inicial inválido." };

  const payload = {
    name,
    institution,
    color,
    initial_balance: initialBalance,
    user_id: user.id,
  };

  const { error } = id
    ? await supabase.from("accounts").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("accounts").insert(payload);

  if (error) return { error: "Não foi possível salvar a conta." };

  revalidatePath("/contas");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function toggleAccountActiveAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  const isActive = formData.get("isActive") === "true";
  if (!id) return;

  await supabase
    .from("accounts")
    .update({ is_active: !isActive })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/contas");
  revalidatePath("/dashboard");
}
