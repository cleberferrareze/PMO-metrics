import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/DeleteButton";
import type { Documento, DocumentoSecao } from "@/lib/types";
import { DocumentoForm } from "./DocumentoForm";
import { SecaoNode, type SecaoTreeNode } from "./SecaoNode";
import { createSecao, deleteDocumento } from "../actions";

function buildTree(secoes: DocumentoSecao[]): SecaoTreeNode[] {
  const nodes = new Map<string, SecaoTreeNode>(
    secoes.map((secao) => [secao.id, { ...secao, children: [] }]),
  );
  const roots: SecaoTreeNode[] = [];

  for (const secao of secoes) {
    const node = nodes.get(secao.id)!;
    if (secao.parent_id && nodes.has(secao.parent_id)) {
      nodes.get(secao.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export default async function DocumentoPage({
  params,
}: {
  params: Promise<{ id: string; docId: string }>;
}) {
  const { id, docId } = await params;
  const supabase = await createClient();

  const [{ data: documento }, { data: secoes }] = await Promise.all([
    supabase.from("documentos").select("*").eq("id", docId).single<Documento>(),
    supabase
      .from("documento_secoes")
      .select("*")
      .eq("documento_id", docId)
      .order("numero")
      .returns<DocumentoSecao[]>(),
  ]);

  if (!documento) notFound();

  const tree = buildTree(secoes ?? []);

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">
      <div>
        <p className="text-sm text-muted">
          <Link href={`/aplicacoes/${id}/documentos`} className="hover:underline">
            Documentos
          </Link>
        </p>
        <h1 className="text-2xl font-semibold">{documento.nome}</h1>
      </div>

      <DocumentoForm documento={documento} aplicacaoId={id} />

      <section>
        <h2 className="mb-3 text-lg font-medium">Estrutura do Documento</h2>

        <div className="rounded-lg border border-border bg-surface p-4">
          <ul className="space-y-1">
            {tree.map((node) => (
              <SecaoNode key={node.id} node={node} documentoId={docId} aplicacaoId={id} />
            ))}
          </ul>

          <form
            action={createSecao}
            className="mt-3 flex gap-2 rounded-md border border-dashed border-border p-2"
          >
            <input type="hidden" name="documento_id" value={docId} />
            <input type="hidden" name="aplicacao_id" value={id} />
            <input type="hidden" name="nivel" value={1} />
            <input
              name="numero"
              placeholder="Número"
              className="w-20 rounded-md border border-border bg-surface-alt px-2 py-1 text-xs focus:border-gold focus:outline-none"
            />
            <input
              name="nome"
              placeholder="Nome da Seção"
              required
              className="flex-1 rounded-md border border-border bg-surface-alt px-2 py-1 text-xs focus:border-gold focus:outline-none"
            />
            <input
              name="observacao"
              placeholder="Observação"
              className="flex-1 rounded-md border border-border bg-surface-alt px-2 py-1 text-xs focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-gold px-2 py-1 text-xs font-medium text-background hover:bg-gold-soft"
            >
              + Seção
            </button>
          </form>
        </div>
      </section>

      <form action={deleteDocumento} className="border-t border-border pt-4">
        <input type="hidden" name="id" value={docId} />
        <input type="hidden" name="aplicacao_id" value={id} />
        <DeleteButton
          label="Excluir Documento"
          confirmMessage="Excluir este documento e toda a sua estrutura de seções?"
        />
      </form>
    </div>
  );
}
