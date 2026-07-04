"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUsuario } from "@/lib/auth";
import type { TipoDesenvolvimento } from "@/lib/types";

function readAplicacaoFields(formData: FormData) {
  return {
    codigo: String(formData.get("codigo") ?? "").trim(),
    nome: String(formData.get("nome") ?? "").trim(),
    area_funcional: String(formData.get("area_funcional") ?? "").trim() || null,
    fronteira_codigo: String(formData.get("fronteira_codigo") ?? "").trim() || null,
    fronteira_nome: String(formData.get("fronteira_nome") ?? "").trim() || null,
  };
}

export async function createAplicacao(_prevState: string | undefined, formData: FormData) {
  const usuario = await getCurrentUsuario();
  if (!usuario) redirect("/login");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("aplicacoes")
    .insert({ empresa_id: usuario.empresa_id, ...readAplicacaoFields(formData) })
    .select("id")
    .single();

  if (error) return error.message;

  revalidatePath("/aplicacoes");
  redirect(`/aplicacoes/${data.id}`);
}

export async function updateAplicacao(_prevState: string | undefined, formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase
    .from("aplicacoes")
    .update(readAplicacaoFields(formData))
    .eq("id", id);

  if (error) return error.message;

  revalidatePath(`/aplicacoes/${id}`);
  revalidatePath("/aplicacoes");
  return undefined;
}

export async function deleteAplicacao(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("aplicacoes").delete().eq("id", id);

  revalidatePath("/aplicacoes");
  redirect("/aplicacoes");
}

export async function createModulo(formData: FormData) {
  const aplicacaoId = String(formData.get("aplicacao_id") ?? "");
  const supabase = await createClient();
  await supabase.from("modulos").insert({
    aplicacao_id: aplicacaoId,
    nome: String(formData.get("nome") ?? "").trim(),
    tipo_desenvolvimento: String(formData.get("tipo_desenvolvimento") ?? "interno") as TipoDesenvolvimento,
    ambiente_desenvolvimento: String(formData.get("ambiente_desenvolvimento") ?? "").trim() || null,
    linguagem_programacao: String(formData.get("linguagem_programacao") ?? "").trim() || null,
    observacoes: String(formData.get("observacoes") ?? "").trim() || null,
  });

  revalidatePath(`/aplicacoes/${aplicacaoId}`);
}

export async function deleteModulo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const aplicacaoId = String(formData.get("aplicacao_id") ?? "");
  const supabase = await createClient();
  await supabase.from("modulos").delete().eq("id", id);

  revalidatePath(`/aplicacoes/${aplicacaoId}`);
}
