"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ContagemStatus, FuncaoProjeto, SubtipoIfpug } from "@/lib/types";

export async function createItemContagem(formData: FormData) {
  const contagemId = String(formData.get("contagem_id") ?? "");
  const moduloId = String(formData.get("modulo_id") ?? "") || null;
  const fpStandardRaw = String(formData.get("fp_standard") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.from("itens_contagem").insert({
    contagem_id: contagemId,
    modulo_id: moduloId,
    id_funcao: String(formData.get("id_funcao") ?? "").trim(),
    descricao: String(formData.get("descricao") ?? "").trim() || null,
    funcao_projeto: String(formData.get("funcao_projeto") ?? "") as FuncaoProjeto,
    subtipo_ifpug: String(formData.get("subtipo_ifpug") ?? "") as SubtipoIfpug,
    fp_standard: fpStandardRaw ? Number(fpStandardRaw) : null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/contagens/${contagemId}`);
}

export async function deleteItemContagem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const contagemId = String(formData.get("contagem_id") ?? "");
  const supabase = await createClient();
  await supabase.from("itens_contagem").delete().eq("id", id);

  revalidatePath(`/contagens/${contagemId}`);
}

export async function updateContagemStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ContagemStatus;
  const supabase = await createClient();
  await supabase.from("contagens").update({ status }).eq("id", id);

  revalidatePath(`/contagens/${id}`);
}
