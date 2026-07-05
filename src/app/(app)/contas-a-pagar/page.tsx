import { createClient } from "@/lib/supabase/server";
import { BillFormDialog } from "@/components/contas-a-pagar/bill-form-dialog";
import { BillList } from "@/components/contas-a-pagar/bill-list";
import type { Bill } from "@/lib/types";

export default async function ContasAPagarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bills } = await supabase
    .from("bills")
    .select("*")
    .eq("user_id", user!.id)
    .eq("direction", "pagar")
    .order("due_date", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Contas a pagar</h1>
        <BillFormDialog direction="pagar" />
      </div>
      <BillList bills={(bills ?? []) as Bill[]} direction="pagar" />
    </div>
  );
}
