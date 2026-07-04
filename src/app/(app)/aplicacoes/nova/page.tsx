"use client";

import { useActionState } from "react";
import { createAplicacao } from "../actions";

export default function NovaAplicacaoPage() {
  const [error, formAction, pending] = useActionState(createAplicacao, undefined);

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Nova Aplicação</h1>

      <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface p-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Código da Aplicação" name="codigo" required />
          <Field label="Nome da Aplicação" name="nome" required />
        </div>

        <Field label="Área Funcional ou Departamento" name="area_funcional" />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Código da Fronteira" name="fronteira_codigo" />
          <Field label="Nome da Fronteira" name="fronteira_nome" />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold-soft disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Criar Aplicação"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
}: {
  label: string;
  name: string;
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
        className="mt-1 w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-foreground focus:border-gold focus:outline-none"
      />
    </div>
  );
}
