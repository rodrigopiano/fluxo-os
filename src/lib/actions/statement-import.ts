"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseOfx, type ParsedOfxTransaction } from "@/lib/ofx";
import { describeCategories } from "@/lib/categories";
import type { Category, ImportRow, Subcategory } from "@/lib/types";

const GEMINI_MODEL = "gemini-2.5-flash";

export type StatementParseState = { error: string | null; data?: ImportRow[] };

export async function parseStatementAction(formData: FormData): Promise<StatementParseState> {
  const file = formData.get("file");
  const accountId = formData.get("accountId")?.toString();

  if (!accountId) return { error: "Selecione uma conta." };
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo OFX." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const content = await file.text();
  const parsed = parseOfx(content);
  if (parsed.length === 0) {
    return { error: "Não encontrei nenhum lançamento nesse arquivo. Confira se é um OFX válido." };
  }

  const [{ data: categoriesData }, { data: subcategoriesData }, { data: existing }] =
    await Promise.all([
      supabase.from("categories").select("*").eq("user_id", user.id).order("position"),
      supabase.from("subcategories").select("*").eq("user_id", user.id).order("position"),
      supabase
        .from("transactions")
        .select("external_id")
        .eq("account_id", accountId)
        .not("external_id", "is", null),
    ]);
  const categories = (categoriesData ?? []) as Category[];
  const subcategories = (subcategoriesData ?? []) as Subcategory[];
  const existingIds = new Set((existing ?? []).map((t) => t.external_id as string));

  const suggestions = await suggestCategories(parsed, categories, subcategories);

  const items: ImportRow[] = parsed.map((tx, index) => ({
    externalId: tx.externalId,
    occurredOn: tx.occurredOn,
    amount: tx.amount,
    type: tx.type,
    description: tx.description,
    categoryId: suggestions[index]?.categoryId ?? null,
    subcategoryId: suggestions[index]?.subcategoryId ?? null,
    isDuplicate: existingIds.has(tx.externalId),
  }));

  return { error: null, data: items };
}

async function suggestCategories(
  parsed: ParsedOfxTransaction[],
  categories: Category[],
  subcategories: Subcategory[],
): Promise<{ categoryId: string | null; subcategoryId: string | null }[]> {
  const empty = parsed.map(() => ({ categoryId: null, subcategoryId: null }));
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return empty;

  const despesaCategories = describeCategories(categories, subcategories, "despesa");
  const receitaCategories = describeCategories(categories, subcategories, "receita");
  const list = parsed.map((tx, i) => `${i + 1}. [${tx.type}] ${tx.description}`).join("\n");

  const prompt =
    "Você categoriza lançamentos de um extrato bancário brasileiro. Cada lançamento já tem o tipo definido " +
    "(despesa ou receita) entre colchetes. Escolha a categoria (e subcategoria, se a categoria tiver) mais " +
    "adequada para cada um. " +
    'Responda só com um objeto JSON com a chave "itens": um array na MESMA ORDEM E QUANTIDADE da lista abaixo, ' +
    'cada um com "categoria" (nome exato de uma categoria da lista correspondente ao tipo do item) e ' +
    '"subcategoria" (nome exato de uma subcategoria daquela categoria, entre parênteses na lista, ou null se ' +
    "não houver ou não tiver certeza). " +
    `Categorias de despesa disponíveis (com subcategorias entre parênteses quando houver): ${despesaCategories}. ` +
    `Categorias de receita disponíveis: ${receitaCategories}. ` +
    `Lançamentos:\n${list}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );
    if (!response.ok) return empty;

    const json = await response.json();
    const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return empty;

    const result = JSON.parse(content);
    const rawItems = Array.isArray(result.itens) ? result.itens : [];

    return parsed.map((tx, index) => {
      const item = rawItems[index] as Record<string, unknown> | undefined;
      if (!item) return { categoryId: null, subcategoryId: null };

      const category = categories.find(
        (c) => c.kind === tx.type && c.name === (item.categoria as string),
      );
      const subcategory = category
        ? subcategories.find(
            (s) => s.category_id === category.id && s.name === (item.subcategoria as string),
          )
        : undefined;

      return { categoryId: category?.id ?? null, subcategoryId: subcategory?.id ?? null };
    });
  } catch {
    return empty;
  }
}

export type ImportState = { error: string | null; imported?: number; skipped?: number };

export async function importTransactionsAction(formData: FormData): Promise<ImportState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const accountId = formData.get("accountId")?.toString();
  const itemsRaw = formData.get("items")?.toString();
  if (!accountId || !itemsRaw) return { error: "Nada para importar." };

  let items: ImportRow[];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { error: "Não foi possível ler os lançamentos selecionados." };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Selecione ao menos um lançamento." };
  }

  const { data: existing } = await supabase
    .from("transactions")
    .select("external_id")
    .eq("account_id", accountId)
    .not("external_id", "is", null);
  const existingIds = new Set((existing ?? []).map((t) => t.external_id as string));

  const toInsert = items
    .filter((item) => !existingIds.has(item.externalId))
    .map((item) => ({
      user_id: user.id,
      account_id: accountId,
      type: item.type,
      amount: item.amount,
      category_id: item.categoryId,
      subcategory_id: item.subcategoryId,
      description: item.description,
      occurred_on: item.occurredOn,
      external_id: item.externalId,
    }));

  const skipped = items.length - toInsert.length;
  if (toInsert.length === 0) {
    return { error: null, imported: 0, skipped };
  }

  const { error } = await supabase.from("transactions").insert(toInsert);
  if (error) return { error: "Não foi possível importar os lançamentos." };

  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
  revalidatePath("/contas");
  return { error: null, imported: toInsert.length, skipped };
}
