"use client";

import { use, useActionState } from "react";
import { createContagem } from "../actions";
import { CONTAGEM_TIPO_LABEL, type ContagemTipo } from "@/lib/types";

export default function NovaContagemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [error, formAction, pending] = useActionState(createContagem, undefined);

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Nova Contagem</h1>

      <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface p-6">
        <input type="hidden" name="aplicacao_id" value={id} />

        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-muted">
            Tipo de Contagem
          </label>
          <select
            id="tipo"
            name="tipo"
            required
            defaultValue="desenvolvimento"
            className="mt-1 w-full rounded-md border border-border bg-surface-alt px-3 py-2 focus:border-gold focus:outline-none"
          >
            {(Object.keys(CONTAGEM_TIPO_LABEL) as ContagemTipo[]).map((tipo) => (
              <option key={tipo} value={tipo}>
                {CONTAGEM_TIPO_LABEL[tipo]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="modalidade" className="block text-sm font-medium text-muted">
            Modalidade da Contagem
          </label>
          <select
            id="modalidade"
            name="modalidade"
            required
            defaultValue="simples"
            className="mt-1 w-full rounded-md border border-border bg-surface-alt px-3 py-2 focus:border-gold focus:outline-none"
          >
            <option value="simples">Simples</option>
            <option value="detalhada">Detalhada</option>
          </select>
        </div>

        <div>
          <label htmlFor="numero_versao" className="block text-sm font-medium text-muted">
            Número da Versão
          </label>
          <input
            id="numero_versao"
            name="numero_versao"
            required
            placeholder="ex: 2026.07.01.001-v0.1"
            className="mt-1 w-full rounded-md border border-border bg-surface-alt px-3 py-2 focus:border-gold focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold-soft disabled:opacity-60"
        >
          {pending ? "Criando…" : "Iniciar Contagem"}
        </button>
      </form>
    </div>
  );
}
