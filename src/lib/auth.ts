import { createClient } from "@/lib/supabase/server";
import type { Usuario } from "@/lib/types";

export async function getCurrentUsuario(): Promise<Usuario | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("usuarios")
    .select("id, empresa_id, nome, perfil, ativo")
    .eq("id", user.id)
    .single();

  return data;
}
