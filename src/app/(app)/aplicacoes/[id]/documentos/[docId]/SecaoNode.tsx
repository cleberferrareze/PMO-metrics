import { DeleteButton } from "@/components/DeleteButton";
import { NIVEL_SECAO_LABEL, type DocumentoSecao } from "@/lib/types";
import { createSecao, deleteSecao } from "../actions";

export type SecaoTreeNode = DocumentoSecao & { children: SecaoTreeNode[] };

export function SecaoNode({
  node,
  documentoId,
  aplicacaoId,
}: {
  node: SecaoTreeNode;
  documentoId: string;
  aplicacaoId: string;
}) {
  const childNivel = (node.nivel + 1) as 2 | 3 | 4;

  return (
    <li className="border-l border-border pl-4">
      <div className="flex items-start justify-between gap-4 py-2">
        <div>
          <span className="text-xs uppercase tracking-wide text-muted">
            {NIVEL_SECAO_LABEL[node.nivel]}
          </span>
          <p className="text-sm">
            {node.numero && <span className="text-muted">{node.numero} — </span>}
            {node.nome}
          </p>
          {node.observacao && <p className="text-xs text-muted">{node.observacao}</p>}
        </div>
        <form action={deleteSecao}>
          <input type="hidden" name="id" value={node.id} />
          <input type="hidden" name="documento_id" value={documentoId} />
          <input type="hidden" name="aplicacao_id" value={aplicacaoId} />
          <DeleteButton confirmMessage="Excluir esta seção e todas as subseções?" />
        </form>
      </div>

      <ul className="ml-2 space-y-1">
        {node.children.map((child) => (
          <SecaoNode
            key={child.id}
            node={child}
            documentoId={documentoId}
            aplicacaoId={aplicacaoId}
          />
        ))}
      </ul>

      {node.nivel < 4 && (
        <form
          action={createSecao}
          className="my-2 flex gap-2 rounded-md border border-dashed border-border p-2"
        >
          <input type="hidden" name="documento_id" value={documentoId} />
          <input type="hidden" name="aplicacao_id" value={aplicacaoId} />
          <input type="hidden" name="parent_id" value={node.id} />
          <input type="hidden" name="nivel" value={childNivel} />
          <input
            name="numero"
            placeholder="Número"
            className="w-20 rounded-md border border-border bg-surface-alt px-2 py-1 text-xs focus:border-gold focus:outline-none"
          />
          <input
            name="nome"
            placeholder={`Nome da ${NIVEL_SECAO_LABEL[childNivel]}`}
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
            + {NIVEL_SECAO_LABEL[childNivel]}
          </button>
        </form>
      )}
    </li>
  );
}
