import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CONTAGEM_STATUS_LABEL, CONTAGEM_TIPO_LABEL, type Contagem } from "@/lib/types";

export default async function ContagensPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: aplicacao }, { data: contagens }] = await Promise.all([
    supabase.from("aplicacoes").select("nome").eq("id", id).single(),
    supabase
      .from("contagens")
      .select("*")
      .eq("aplicacao_id", id)
      .order("created_at", { ascending: false })
      .returns<Contagem[]>(),
  ]);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">
            <Link href={`/aplicacoes/${id}`} className="hover:underline">
              {aplicacao?.nome ?? "Aplicação"}
            </Link>
          </p>
          <h1 className="text-2xl font-semibold">Contagens</h1>
        </div>
        <Link
          href={`/aplicacoes/${id}/contagens/nova`}
          className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold-soft"
        >
          Nova Contagem
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-alt text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Versão</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Modalidade</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {contagens?.map((contagem) => (
              <tr key={contagem.id} className="border-t border-border hover:bg-surface-alt">
                <td className="px-4 py-3">
                  <Link href={`/contagens/${contagem.id}`} className="text-gold hover:underline">
                    {contagem.numero_versao}
                  </Link>
                </td>
                <td className="px-4 py-3">{CONTAGEM_TIPO_LABEL[contagem.tipo]}</td>
                <td className="px-4 py-3 text-muted capitalize">{contagem.modalidade}</td>
                <td className="px-4 py-3 text-muted">{CONTAGEM_STATUS_LABEL[contagem.status]}</td>
              </tr>
            ))}
            {!contagens?.length && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  Nenhuma contagem registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
