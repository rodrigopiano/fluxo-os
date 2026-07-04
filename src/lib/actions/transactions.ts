"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TransactionType } from "@/lib/types";

export type FormState = { error: string | null };

export async function upsertTransactionAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const id = formData.get("id")?.toString();
  const type = formData.get("type")?.toString() as TransactionType;
  const accountId = formData.get("accountId")?.toString();
  const destinationAccountId = formData.get("destinationAccountId")?.toString() || null;
  const amount = Number(formData.get("amount"));
  const category = formData.get("category")?.toString() || null;
  const description = formData.get("description")?.toString() || null;
  const occurredOn = formData.get("occurredOn")?.toString();

  if (!accountId) return { error: "Selecione uma conta." };
  if (!occurredOn) return { error: "Informe a data." };
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    return { error: "Informe um valor maior que zero." };
  }
  if (type === "transferencia") {
    if (!destinationAccountId) return { error: "Selecione a conta de destino." };
    if (destinationAccountId === accountId) {
      return { error: "A conta de destino precisa ser diferente da conta de origem." };
    }
  }

  const payload = {
    user_id: user.id,
    account_id: accountId,
    destination_account_id: type === "transferencia" ? destinationAccountId : null,
    type,
    amount,
    category: type === "transferencia" ? null : category,
    description,
    occurred_on: occurredOn,
  };

  const { error } = id
    ? await supabase.from("transactions").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("transactions").insert(payload);

  if (error) return { error: "Não foi possível salvar o lançamento." };

  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
  revalidatePath("/contas");
  return { error: null };
}

export async function deleteTransactionAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  if (!id) return;

  await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
  revalidatePath("/contas");
}
