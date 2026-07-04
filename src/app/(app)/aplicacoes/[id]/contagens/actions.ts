"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUsuario } from "@/lib/auth";
import type { ContagemModalidade, ContagemTipo } from "@/lib/types";

export async function createContagem(_prevState: string | undefined, formData: FormData) {
  const aplicacaoId = String(formData.get("aplicacao_id") ?? "");
  const usuario = await getCurrentUsuario();
  if (!usuario) redirect("/login");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contagens")
    .insert({
      aplicacao_id: aplicacaoId,
      tipo: String(formData.get("tipo") ?? "") as ContagemTipo,
      modalidade: String(formData.get("modalidade") ?? "") as ContagemModalidade,
      numero_versao: String(formData.get("numero_versao") ?? "").trim(),
      created_by: usuario.id,
    })
    .select("id")
    .single();

  if (error) return error.message;

  revalidatePath(`/aplicacoes/${aplicacaoId}/contagens`);
  redirect(`/contagens/${data.id}`);
}
