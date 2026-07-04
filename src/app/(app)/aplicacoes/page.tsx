import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Aplicacao } from "@/lib/types";

export default async function AplicacoesPage() {
  const supabase = await createClient();
  const { data: aplicacoes } = await supabase
    .from("aplicacoes")
    .select("id, codigo, nome, area_funcional, fronteira_nome")
    .order("nome")
    .returns<Aplicacao[]>();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Aplicações</h1>
          <p className="text-sm text-muted">Cadastro de aplicações e seus módulos.</p>
        </div>
        <Link
          href="/aplicacoes/nova"
          className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold-soft"
        >
          Nova Aplicação
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-alt text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Área Funcional</th>
              <th className="px-4 py-3 font-medium">Fronteira</th>
            </tr>
          </thead>
          <tbody>
            {aplicacoes?.map((aplicacao) => (
              <tr
                key={aplicacao.id}
                className="border-t border-border hover:bg-surface-alt"
              >
                <td className="px-4 py-3">
                  <Link href={`/aplicacoes/${aplicacao.id}`} className="text-gold hover:underline">
                    {aplicacao.codigo}
                  </Link>
                </td>
                <td className="px-4 py-3">{aplicacao.nome}</td>
                <td className="px-4 py-3 text-muted">{aplicacao.area_funcional ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{aplicacao.fronteira_nome ?? "—"}</td>
              </tr>
            ))}
            {!aplicacoes?.length && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  Nenhuma aplicação cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
