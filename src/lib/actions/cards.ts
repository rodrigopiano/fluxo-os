"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

export async function upsertCardAction(
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
  const color = formData.get("color")?.toString() || "#a855f7";
  const creditLimit = Number(formData.get("creditLimit"));
  const closingDay = Number(formData.get("closingDay"));
  const dueDay = Number(formData.get("dueDay"));

  if (!name) return { error: "Informe um nome para o cartão." };
  if (Number.isNaN(creditLimit) || creditLimit < 0) return { error: "Limite inválido." };
  if (!Number.isInteger(closingDay) || closingDay < 1 || closingDay > 28) {
    return { error: "Dia de fechamento deve ser entre 1 e 28." };
  }
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) {
    return { error: "Dia de vencimento deve ser entre 1 e 28." };
  }

  const payload = {
    name,
    institution,
    color,
    credit_limit: creditLimit,
    closing_day: closingDay,
    due_day: dueDay,
    user_id: user.id,
  };

  const { error } = id
    ? await supabase.from("cards").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("cards").insert(payload);

  if (error) return { error: "Não foi possível salvar o cartão." };

  revalidatePath("/cartoes");
  return { error: null };
}

export async function toggleCardActiveAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  const isActive = formData.get("isActive") === "true";
  if (!id) return;

  await supabase
    .from("cards")
    .update({ is_active: !isActive })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/cartoes");
}

export async function upsertCardPurchaseAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const id = formData.get("id")?.toString();
  const cardId = formData.get("cardId")?.toString();
  const description = formData.get("description")?.toString().trim();
  const categoryId = formData.get("categoryId")?.toString() || null;
  const subcategoryId = formData.get("subcategoryId")?.toString() || null;
  const amount = Number(formData.get("amount"));
  const installmentsTotal = Number(formData.get("installmentsTotal") || 1);
  const purchasedOn = formData.get("purchasedOn")?.toString();

  if (!cardId) return { error: "Selecione um cartão." };
  if (!description) return { error: "Informe uma descrição." };
  if (!purchasedOn) return { error: "Informe a data da compra." };
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    return { error: "Informe um valor maior que zero." };
  }
  if (!Number.isInteger(installmentsTotal) || installmentsTotal < 1 || installmentsTotal > 48) {
    return { error: "Número de parcelas inválido." };
  }

  const payload = {
    user_id: user.id,
    card_id: cardId,
    description,
    category_id: categoryId,
    subcategory_id: subcategoryId,
    amount,
    installments_total: installmentsTotal,
    purchased_on: purchasedOn,
  };

  const { error } = id
    ? await supabase.from("card_purchases").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("card_purchases").insert(payload);

  if (error) return { error: "Não foi possível salvar a compra." };

  revalidatePath("/cartoes");
  return { error: null };
}

export async function deleteCardPurchaseAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  if (!id) return;

  await supabase.from("card_purchases").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/cartoes");
}
