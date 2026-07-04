import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/DeleteButton";
import { TIPO_DESENVOLVIMENTO_LABEL, type Aplicacao, type Modulo } from "@/lib/types";
import { AplicacaoForm } from "./AplicacaoForm";
import { createModulo, deleteAplicacao, deleteModulo } from "../actions";

export default async function AplicacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: aplicacao }, { data: modulos }] = await Promise.all([
    supabase.from("aplicacoes").select("*").eq("id", id).single<Aplicacao>(),
    supabase
      .from("modulos")
      .select("*")
      .eq("aplicacao_id", id)
      .order("nome")
      .returns<Modulo[]>(),
  ]);

  if (!aplicacao) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{aplicacao.nome}</h1>
          <p className="text-sm text-muted">{aplicacao.codigo}</p>
        </div>
        <div className="flex gap-4 text-sm">
          <Link href={`/aplicacoes/${id}/documentos`} className="text-gold hover:underline">
            Documentos
          </Link>
          <Link href={`/aplicacoes/${id}/contagens`} className="text-gold hover:underline">
            Contagens
          </Link>
        </div>
      </div>

      <AplicacaoForm aplicacao={aplicacao} />

      <section>
        <h2 className="mb-3 text-lg font-medium">Módulos</h2>

        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-alt text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nome do Módulo</th>
                <th className="px-4 py-3 font-medium">Tipo de Desenvolvimento</th>
                <th className="px-4 py-3 font-medium">Ambiente</th>
                <th className="px-4 py-3 font-medium">Linguagem</th>
                <th className="px-4 py-3 font-medium">Observações</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {modulos?.map((modulo) => (
                <tr key={modulo.id} className="border-t border-border">
                  <td className="px-4 py-3">{modulo.nome}</td>
                  <td className="px-4 py-3 text-muted">
                    {TIPO_DESENVOLVIMENTO_LABEL[modulo.tipo_desenvolvimento]}
                  </td>
                  <td className="px-4 py-3 text-muted">{modulo.ambiente_desenvolvimento ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{modulo.linguagem_programacao ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{modulo.observacoes ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteModulo}>
                      <input type="hidden" name="id" value={modulo.id} />
                      <input type="hidden" name="aplicacao_id" value={id} />
                      <DeleteButton confirmMessage="Excluir este módulo?" />
                    </form>
                  </td>
                </tr>
              ))}
              {!modulos?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-muted">
                    Nenhum módulo cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form
          action={createModulo}
          className="mt-4 grid grid-cols-5 gap-3 rounded-lg border border-border bg-surface p-4"
        >
          <input type="hidden" name="aplicacao_id" value={id} />
          <input
            name="nome"
            placeholder="Nome do módulo"
            required
            className="rounded-md border border-border bg-surface-alt px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <select
            name="tipo_desenvolvimento"
            defaultValue="interno"
            className="rounded-md border border-border bg-surface-alt px-3 py-2 text-sm focus:border-gold focus:outline-none"
          >
            <option value="interno">Interno</option>
            <option value="cots">COTS</option>
            <option value="externo">Externo</option>
          </select>
          <input
            name="ambiente_desenvolvimento"
            placeholder="Ambiente de desenvolvimento"
            className="rounded-md border border-border bg-surface-alt px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <input
            name="linguagem_programacao"
            placeholder="Linguagem de programação"
            className="rounded-md border border-border bg-surface-alt px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              name="observacoes"
              placeholder="Observações"
              className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-gold px-3 py-2 text-sm font-medium text-background hover:bg-gold-soft"
            >
              Adicionar
            </button>
          </div>
        </form>
      </section>

      <form action={deleteAplicacao} className="border-t border-border pt-4">
        <input type="hidden" name="id" value={id} />
        <DeleteButton
          label="Excluir Aplicação"
          confirmMessage="Excluir esta aplicação e todos os seus módulos, documentos e contagens?"
        />
      </form>
    </div>
  );
}
