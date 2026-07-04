"use client";

import { createItemContagem } from "./actions";
import {
  FUNCAO_PROJETO_LABEL,
  FUNCAO_PROJETO_POR_TIPO,
  SUBTIPO_IFPUG_LABEL,
  type ContagemTipo,
  type FuncaoProjeto,
  type Modulo,
  type SubtipoIfpug,
} from "@/lib/types";

export function ItemForm({
  contagemId,
  tipo,
  modulos,
}: {
  contagemId: string;
  tipo: ContagemTipo;
  modulos: Modulo[];
}) {
  const opcoesFuncaoProjeto = FUNCAO_PROJETO_POR_TIPO[tipo];

  return (
    <form
      action={async (formData) => {
        await createItemContagem(formData);
        (document.getElementById("novo-item-form") as HTMLFormElement | null)?.reset();
      }}
      id="novo-item-form"
      className="mt-4 grid grid-cols-8 gap-2 rounded-lg border border-dashed border-border bg-surface p-3 text-sm"
    >
      <input type="hidden" name="contagem_id" value={contagemId} />

      <select
        name="modulo_id"
        className="rounded-md border border-border bg-surface-alt px-2 py-1.5 focus:border-gold focus:outline-none"
        defaultValue=""
      >
        <option value="">Sem módulo</option>
        {modulos.map((modulo) => (
          <option key={modulo.id} value={modulo.id}>
            {modulo.nome}
          </option>
        ))}
      </select>

      <input
        name="id_funcao"
        placeholder="ID Função"
        required
        className="rounded-md border border-border bg-surface-alt px-2 py-1.5 focus:border-gold focus:outline-none"
      />

      <input
        name="descricao"
        placeholder="Descrição da Função"
        className="col-span-2 rounded-md border border-border bg-surface-alt px-2 py-1.5 focus:border-gold focus:outline-none"
      />

      <select
        name="funcao_projeto"
        required
        defaultValue={opcoesFuncaoProjeto[0]}
        className="rounded-md border border-border bg-surface-alt px-2 py-1.5 focus:border-gold focus:outline-none"
      >
        {opcoesFuncaoProjeto.map((opcao: FuncaoProjeto) => (
          <option key={opcao} value={opcao}>
            {FUNCAO_PROJETO_LABEL[opcao]}
          </option>
        ))}
      </select>

      <select
        name="subtipo_ifpug"
        required
        defaultValue="ALI"
        className="rounded-md border border-border bg-surface-alt px-2 py-1.5 focus:border-gold focus:outline-none"
      >
        {(Object.keys(SUBTIPO_IFPUG_LABEL) as SubtipoIfpug[]).map((subtipo) => (
          <option key={subtipo} value={subtipo}>
            {subtipo}
          </option>
        ))}
      </select>

      <input
        name="fp_standard"
        type="number"
        step="0.1"
        placeholder="FP Standard"
        className="rounded-md border border-border bg-surface-alt px-2 py-1.5 focus:border-gold focus:outline-none"
      />

      <button
        type="submit"
        className="rounded-md bg-gold px-2 py-1.5 text-xs font-medium text-background hover:bg-gold-soft"
      >
        Incluir
      </button>
    </form>
  );
}
