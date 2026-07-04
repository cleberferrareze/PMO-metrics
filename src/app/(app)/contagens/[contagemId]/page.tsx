import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/DeleteButton";
import {
  CONTAGEM_STATUS_LABEL,
  CONTAGEM_TIPO_LABEL,
  FUNCAO_PROJETO_LABEL,
  SUBTIPO_IFPUG_LABEL,
  type Aplicacao,
  type Contagem,
  type ContagemStatus,
  type ItemContagem,
  type Modulo,
} from "@/lib/types";
import { ItemForm } from "./ItemForm";
import { deleteItemContagem, updateContagemStatus } from "./actions";

export default async function ContagemPage({
  params,
}: {
  params: Promise<{ contagemId: string }>;
}) {
  const { contagemId } = await params;
  const supabase = await createClient();

  const { data: contagem } = await supabase
    .from("contagens")
    .select("*")
    .eq("id", contagemId)
    .single<Contagem>();

  if (!contagem) notFound();

  const [{ data: aplicacao }, { data: modulos }, { data: itens }] = await Promise.all([
    supabase.from("aplicacoes").select("*").eq("id", contagem.aplicacao_id).single<Aplicacao>(),
    supabase
      .from("modulos")
      .select("*")
      .eq("aplicacao_id", contagem.aplicacao_id)
      .order("nome")
      .returns<Modulo[]>(),
    supabase
      .from("itens_contagem")
      .select("*")
      .eq("contagem_id", contagemId)
      .order("id_funcao")
      .returns<ItemContagem[]>(),
  ]);

  const modulosPorId = new Map((modulos ?? []).map((m) => [m.id, m]));
  const grupos = new Map<string, ItemContagem[]>();
  for (const item of itens ?? []) {
    const chave = item.modulo_id ?? "__sem_modulo__";
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(item);
  }

  const resumo = new Map<string, { quantidade: number; fp: number }>();
  for (const item of itens ?? []) {
    const chave = `${item.subtipo_ifpug}|${item.funcao_projeto}`;
    const atual = resumo.get(chave) ?? { quantidade: 0, fp: 0 };
    atual.quantidade += 1;
    atual.fp += item.fp_standard ?? item.fp_sfp;
    resumo.set(chave, atual);
  }
  const totalGeral = Array.from(resumo.values()).reduce(
    (acc, v) => ({ quantidade: acc.quantidade + v.quantidade, fp: acc.fp + v.fp }),
    { quantidade: 0, fp: 0 },
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      <div>
        <p className="text-sm text-muted">
          <Link href={`/aplicacoes/${contagem.aplicacao_id}/contagens`} className="hover:underline">
            Contagens
          </Link>
        </p>
        <h1 className="text-2xl font-semibold">Realizar Contagem — {contagem.numero_versao}</h1>
      </div>

      <section className="grid grid-cols-2 gap-x-8 gap-y-2 rounded-lg border border-border bg-surface p-4 text-sm sm:grid-cols-4">
        <Info label="Nome e Sigla da Aplicação" value={`${aplicacao?.nome} (${aplicacao?.codigo})`} />
        <Info label="Área Funcional" value={aplicacao?.area_funcional ?? "—"} />
        <Info label="Fronteira da Aplicação" value={aplicacao?.fronteira_nome ?? "—"} />
        <Info label="Tipo de Contagem" value={CONTAGEM_TIPO_LABEL[contagem.tipo]} />
        <Info label="Modalidade" value={contagem.modalidade === "simples" ? "Simples" : "Detalhada"} />

        <form action={updateContagemStatus} className="flex items-end gap-2">
          <input type="hidden" name="id" value={contagem.id} />
          <div className="w-full">
            <label className="block text-xs font-medium text-muted">Status da Contagem</label>
            <select
              name="status"
              defaultValue={contagem.status}
              className="mt-1 w-full rounded-md border border-border bg-surface-alt px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
            >
              {(Object.keys(CONTAGEM_STATUS_LABEL) as ContagemStatus[]).map((status) => (
                <option key={status} value={status}>
                  {CONTAGEM_STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-background hover:bg-gold-soft"
          >
            Salvar
          </button>
        </form>
      </section>

      <ItemForm contagemId={contagemId} tipo={contagem.tipo} modulos={modulos ?? []} />

      {Array.from(grupos.entries()).map(([chave, itensDoGrupo]) => (
        <section key={chave}>
          <h2 className="mb-2 text-sm font-medium text-muted">
            {chave === "__sem_modulo__" ? "Sem Módulo" : modulosPorId.get(chave)?.nome}
          </h2>
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-alt text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">ID Função</th>
                  <th className="px-3 py-2 font-medium">Descrição</th>
                  <th className="px-3 py-2 font-medium">Função do Projeto</th>
                  <th className="px-3 py-2 font-medium">Tipo da Função</th>
                  <th className="px-3 py-2 font-medium">FP SFP</th>
                  <th className="px-3 py-2 font-medium">FP Standard</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {itensDoGrupo.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-3 py-2">{item.id_funcao}</td>
                    <td className="px-3 py-2 text-muted">{item.descricao ?? "—"}</td>
                    <td className="px-3 py-2">{FUNCAO_PROJETO_LABEL[item.funcao_projeto]}</td>
                    <td className="px-3 py-2">{SUBTIPO_IFPUG_LABEL[item.subtipo_ifpug]}</td>
                    <td className="px-3 py-2">{item.fp_sfp.toFixed(1)}</td>
                    <td className="px-3 py-2">{item.fp_standard?.toFixed(1) ?? "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <form action={deleteItemContagem}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="contagem_id" value={contagemId} />
                        <DeleteButton confirmMessage="Excluir este item da contagem?" />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {!itens?.length && (
        <p className="rounded-lg border border-border bg-surface p-6 text-center text-muted">
          Nenhum item incluído nesta contagem.
        </p>
      )}

      <section>
        <h2 className="mb-2 text-lg font-medium">Resultado da Contagem Simples / Dados Padrão do IFPUG</h2>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-alt text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Tipo da Função</th>
                <th className="px-3 py-2 font-medium">Função do Projeto</th>
                <th className="px-3 py-2 font-medium">Quantidade</th>
                <th className="px-3 py-2 font-medium">Pontos de Função</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(resumo.entries()).map(([chave, valores]) => {
                const [subtipo, funcaoProjeto] = chave.split("|") as [
                  keyof typeof SUBTIPO_IFPUG_LABEL,
                  keyof typeof FUNCAO_PROJETO_LABEL,
                ];
                return (
                  <tr key={chave} className="border-t border-border">
                    <td className="px-3 py-2">{SUBTIPO_IFPUG_LABEL[subtipo]}</td>
                    <td className="px-3 py-2">{FUNCAO_PROJETO_LABEL[funcaoProjeto]}</td>
                    <td className="px-3 py-2">{valores.quantidade}</td>
                    <td className="px-3 py-2">{valores.fp.toFixed(1)}</td>
                  </tr>
                );
              })}
              <tr className="border-t border-border font-medium">
                <td className="px-3 py-2" colSpan={2}>
                  Total
                </td>
                <td className="px-3 py-2">{totalGeral.quantidade}</td>
                <td className="px-3 py-2">{totalGeral.fp.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p>{value}</p>
    </div>
  );
}
