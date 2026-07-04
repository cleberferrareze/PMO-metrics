"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function readDocumentoFields(formData: FormData) {
  return {
    codigo: String(formData.get("codigo") ?? "").trim(),
    tipo_documento: String(formData.get("tipo_documento") ?? "").trim(),
    nome: String(formData.get("nome") ?? "").trim(),
    data_documento: String(formData.get("data_documento") ?? "").trim() || null,
    versao: String(formData.get("versao") ?? "").trim() || null,
    link_acesso: String(formData.get("link_acesso") ?? "").trim() || null,
  };
}

export async function createDocumento(_prevState: string | undefined, formData: FormData) {
  const aplicacaoId = String(formData.get("aplicacao_id") ?? "");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documentos")
    .insert({ aplicacao_id: aplicacaoId, ...readDocumentoFields(formData) })
    .select("id")
    .single();

  if (error) return error.message;

  revalidatePath(`/aplicacoes/${aplicacaoId}/documentos`);
  redirect(`/aplicacoes/${aplicacaoId}/documentos/${data.id}`);
}

export async function updateDocumento(_prevState: string | undefined, formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const aplicacaoId = String(formData.get("aplicacao_id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase
    .from("documentos")
    .update(readDocumentoFields(formData))
    .eq("id", id);

  if (error) return error.message;

  revalidatePath(`/aplicacoes/${aplicacaoId}/documentos/${id}`);
  revalidatePath(`/aplicacoes/${aplicacaoId}/documentos`);
  return undefined;
}

export async function deleteDocumento(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const aplicacaoId = String(formData.get("aplicacao_id") ?? "");
  const supabase = await createClient();
  await supabase.from("documentos").delete().eq("id", id);

  revalidatePath(`/aplicacoes/${aplicacaoId}/documentos`);
  redirect(`/aplicacoes/${aplicacaoId}/documentos`);
}

export async function createSecao(formData: FormData) {
  const documentoId = String(formData.get("documento_id") ?? "");
  const aplicacaoId = String(formData.get("aplicacao_id") ?? "");
  const parentId = String(formData.get("parent_id") ?? "") || null;
  const nivel = Number(formData.get("nivel") ?? "1");

  const supabase = await createClient();
  await supabase.from("documento_secoes").insert({
    documento_id: documentoId,
    parent_id: parentId,
    nivel,
    numero: String(formData.get("numero") ?? "").trim() || null,
    nome: String(formData.get("nome") ?? "").trim(),
    observacao: String(formData.get("observacao") ?? "").trim() || null,
  });

  revalidatePath(`/aplicacoes/${aplicacaoId}/documentos/${documentoId}`);
}

export async function deleteSecao(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const documentoId = String(formData.get("documento_id") ?? "");
  const aplicacaoId = String(formData.get("aplicacao_id") ?? "");
  const supabase = await createClient();
  await supabase.from("documento_secoes").delete().eq("id", id);

  revalidatePath(`/aplicacoes/${aplicacaoId}/documentos/${documentoId}`);
}
