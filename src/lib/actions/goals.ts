"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

export async function upsertGoalAction(
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
  const targetAmount = Number(formData.get("targetAmount"));
  const currentAmount = Number(formData.get("currentAmount") || 0);
  const isEmergencyReserve = formData.get("isEmergencyReserve") === "on";

  if (!name) return { error: "Informe um nome para a meta." };
  if (!targetAmount || Number.isNaN(targetAmount) || targetAmount <= 0) {
    return { error: "Informe um valor alvo maior que zero." };
  }
  if (Number.isNaN(currentAmount) || currentAmount < 0) return { error: "Valor atual inválido." };

  if (isEmergencyReserve) {
    await supabase
      .from("goals")
      .update({ is_emergency_reserve: false })
      .eq("user_id", user.id)
      .eq("is_emergency_reserve", true);
  }

  const payload = {
    user_id: user.id,
    name,
    target_amount: targetAmount,
    current_amount: currentAmount,
    is_emergency_reserve: isEmergencyReserve,
  };

  const { error } = id
    ? await supabase.from("goals").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("goals").insert(payload);

  if (error) return { error: "Não foi possível salvar a meta." };

  revalidatePath("/metas");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteGoalAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  if (!id) return;

  await supabase.from("goals").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/metas");
  revalidatePath("/dashboard");
}
