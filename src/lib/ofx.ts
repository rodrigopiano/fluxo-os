export type ParsedOfxTransaction = {
  externalId: string;
  occurredOn: string;
  amount: number;
  type: "receita" | "despesa";
  description: string;
};

function getTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}>\\s*([^\\r\\n<]*)`, "i"));
  return match ? match[1].trim() : null;
}

export function parseOfx(content: string): ParsedOfxTransaction[] {
  const blocks = content.match(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi) ?? [];

  return blocks.map((block, index) => {
    const dtPosted = getTag(block, "DTPOSTED") ?? "";
    const trnAmt = getTag(block, "TRNAMT") ?? "0";
    const fitId = getTag(block, "FITID");
    const memo = getTag(block, "MEMO") ?? getTag(block, "NAME") ?? "Lançamento importado";

    const amount = parseFloat(trnAmt.replace(",", "."));
    const year = dtPosted.slice(0, 4);
    const month = dtPosted.slice(4, 6);
    const day = dtPosted.slice(6, 8);

    return {
      externalId: fitId ?? `${dtPosted}-${trnAmt}-${index}`,
      occurredOn: `${year}-${month}-${day}`,
      amount: Math.abs(amount),
      type: amount < 0 ? "despesa" : "receita",
      description: memo,
    };
  });
}
