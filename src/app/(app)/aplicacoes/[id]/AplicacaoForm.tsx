"use client";

import { useActionState } from "react";
import { updateAplicacao } from "../actions";
import type { Aplicacao } from "@/lib/types";

export function AplicacaoForm({ aplicacao }: { aplicacao: Aplicacao }) {
  const [error, formAction, pending] = useActionState(updateAplicacao, undefined);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface p-6">
      <input type="hidden" name="id" value={aplicacao.id} />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Código da Aplicação" name="codigo" defaultValue={aplicacao.codigo} required />
        <Field label="Nome da Aplicação" name="nome" defaultValue={aplicacao.nome} required />
      </div>

      <Field
        label="Área Funcional ou Departamento"
        name="area_funcional"
        defaultValue={aplicacao.area_funcional ?? ""}
      />

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Código da Fronteira"
          name="fronteira_codigo"
          defaultValue={aplicacao.fronteira_codigo ?? ""}
        />
        <Field
          label="Nome da Fronteira"
          name="fronteira_nome"
          defaultValue={aplicacao.fronteira_nome ?? ""}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold-soft disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar Alterações"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-foreground focus:border-gold focus:outline-none"
      />
    </div>
  );
}
