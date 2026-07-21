"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toLocalISODate } from "@/lib/format";
import type { BillDirection } from "@/lib/types";

export type FormState = { error: string | null };

function pathFor(direction: BillDirection) {
  return direction === "pagar" ? "/contas-a-pagar" : "/contas-a-receber";
}

export async function upsertBillAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const id = formData.get("id")?.toString();
  const direction = formData.get("direction")?.toString() as BillDirection;
  const description = formData.get("description")?.toString().trim();
  const categoryId = formData.get("categoryId")?.toString() || null;
  const subcategoryId = formData.get("subcategoryId")?.toString() || null;
  const amount = Number(formData.get("amount"));
  const dueDate = formData.get("dueDate")?.toString();

  if (!description) return { error: "Informe uma descrição." };
  if (!dueDate) return { error: "Informe a data de vencimento." };
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    return { error: "Informe um valor maior que zero." };
  }

  const payload = {
    user_id: user.id,
    direction,
    description,
    category_id: categoryId,
    subcategory_id: subcategoryId,
    amount,
    due_date: dueDate,
  };

  const { error } = id
    ? await supabase.from("bills").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("bills").insert(payload);

  if (error) return { error: "Não foi possível salvar a conta." };

  revalidatePath(pathFor(direction));
  revalidatePath("/dashboard");
  return { error: null };
}

export async function markBillPaidAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const id = formData.get("id")?.toString();
  const direction = formData.get("direction")?.toString() as BillDirection;
  const accountId = formData.get("accountId")?.toString();
  if (!id || !direction) return { error: "Conta inválida." };
  if (!accountId) return { error: "Selecione a conta usada." };

  const { data: bill, error: fetchError } = await supabase
    .from("bills")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !bill) return { error: "Não foi possível encontrar a conta." };

  const paidOn = toLocalISODate(new Date());

  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      account_id: accountId,
      type: direction === "pagar" ? "despesa" : "receita",
      amount: bill.amount,
      category_id: bill.category_id,
      subcategory_id: bill.subcategory_id,
      description: bill.description,
      occurred_on: paidOn,
    })
    .select("id")
    .single();

  if (transactionError || !transaction) {
    return { error: "Não foi possível lançar a movimentação na conta." };
  }

  const { error: updateError } = await supabase
    .from("bills")
    .update({
      status: "pago",
      paid_on: paidOn,
      account_id: accountId,
      transaction_id: transaction.id,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) return { error: "Não foi possível marcar como paga." };

  revalidatePath(pathFor(direction));
  revalidatePath("/dashboard");
  revalidatePath("/contas");
  revalidatePath("/lancamentos");
  return { error: null };
}

export async function markBillPendingAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  const direction = formData.get("direction")?.toString() as BillDirection;
  const transactionId = formData.get("transactionId")?.toString() || null;
  if (!id) return;

  if (transactionId) {
    await supabase.from("transactions").delete().eq("id", transactionId).eq("user_id", user.id);
  }

  await supabase
    .from("bills")
    .update({ status: "pendente", paid_on: null, account_id: null, transaction_id: null })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath(pathFor(direction));
  revalidatePath("/dashboard");
  revalidatePath("/contas");
  revalidatePath("/lancamentos");
}

export async function deleteBillAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString();
  const direction = formData.get("direction")?.toString() as BillDirection;
  const transactionId = formData.get("transactionId")?.toString() || null;
  if (!id) return;

  if (transactionId) {
    await supabase.from("transactions").delete().eq("id", transactionId).eq("user_id", user.id);
  }

  await supabase.from("bills").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath(pathFor(direction));
  revalidatePath("/dashboard");
  revalidatePath("/contas");
  revalidatePath("/lancamentos");
}
