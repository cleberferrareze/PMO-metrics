import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Documento } from "@/lib/types";

export default async function DocumentosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: aplicacao }, { data: documentos }] = await Promise.all([
    supabase.from("aplicacoes").select("nome, codigo").eq("id", id).single(),
    supabase
      .from("documentos")
      .select("*")
      .eq("aplicacao_id", id)
      .order("nome")
      .returns<Documento[]>(),
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
          <h1 className="text-2xl font-semibold">Documentos</h1>
        </div>
        <Link
          href={`/aplicacoes/${id}/documentos/novo`}
          className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold-soft"
        >
          Novo Documento
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-alt text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Versão</th>
              <th className="px-4 py-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {documentos?.map((documento) => (
              <tr key={documento.id} className="border-t border-border hover:bg-surface-alt">
                <td className="px-4 py-3">
                  <Link
                    href={`/aplicacoes/${id}/documentos/${documento.id}`}
                    className="text-gold hover:underline"
                  >
                    {documento.codigo}
                  </Link>
                </td>
                <td className="px-4 py-3">{documento.nome}</td>
                <td className="px-4 py-3 text-muted">{documento.tipo_documento}</td>
                <td className="px-4 py-3 text-muted">{documento.versao ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{documento.data_documento ?? "—"}</td>
              </tr>
            ))}
            {!documentos?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  Nenhum documento cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
