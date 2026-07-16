"use server";

import { CATEGORIES, type ExtractedReceipt } from "@/lib/types";

export type ReceiptState = { error: string | null; data?: ExtractedReceipt[] };

const GEMINI_MODEL = "gemini-2.5-flash";

export async function extractReceiptAction(formData: FormData): Promise<ReceiptState> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione uma imagem do comprovante." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Envie uma imagem (foto ou print). PDF ainda não é suportado." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "Escaneamento de comprovantes ainda não está configurado." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const categories = CATEGORIES.despesa.join(", ");

  const prompt =
    "Você extrai dados de comprovantes financeiros brasileiros (PIX, boleto, nota fiscal, recibo) a partir de uma imagem. " +
    "Se o comprovante tiver vários itens/produtos separados (ex: nota de supermercado), extraia CADA item como uma entrada " +
    "separada, para o usuário poder categorizar cada um. Se for um único gasto/recebimento (ex: PIX, boleto, mensalidade), " +
    "extraia como uma entrada só. " +
    'Responda só com um objeto JSON com exatamente estas chaves: "data" (formato YYYY-MM-DD, use o ano atual se não ' +
    'estiver visível, mesma data para todos os itens), "itens" (array de objetos, cada um com "valor" — número, sem ' +
    'símbolo de moeda —, "descricao" — nome do produto, estabelecimento ou pessoa —, ' +
    `"categoria" — escolha exatamente uma destas opções: ${categories} —, ` +
    '"tipo" — "despesa" ou "receita", use "despesa" se não tiver certeza). ' +
    "Se não conseguir identificar um campo, use null. Se não conseguir separar itens, retorne um array com uma única entrada.";

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: file.type, data: base64 } },
              ],
            },
          ],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );
  } catch {
    return { error: "Não foi possível conectar ao serviço de IA. Tente novamente." };
  }

  if (!response.ok) {
    return { error: "Não foi possível analisar o comprovante. Tente novamente." };
  }

  const json = await response.json();
  const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    return { error: "A IA não conseguiu ler esse comprovante." };
  }

  try {
    const parsed = JSON.parse(content);
    const sharedDate = typeof parsed.data === "string" ? parsed.data : null;
    const rawItems = Array.isArray(parsed.itens) ? parsed.itens : [];

    if (rawItems.length === 0) {
      return { error: "Não encontrei nenhum item nesse comprovante. Tente outra foto." };
    }

    const items: ExtractedReceipt[] = rawItems.map((item: Record<string, unknown>) => {
      const type = item.tipo === "receita" ? "receita" : "despesa";
      const category = CATEGORIES[type].includes(item.categoria as string)
        ? (item.categoria as string)
        : null;

      return {
        amount: typeof item.valor === "number" ? item.valor : null,
        description: typeof item.descricao === "string" ? item.descricao : null,
        category,
        type,
        occurredOn: sharedDate,
      };
    });

    return { error: null, data: items };
  } catch {
    return { error: "Não entendi a resposta da IA. Tente de novo." };
  }
}
