"use client";

import { use, useActionState } from "react";
import { createDocumento } from "../actions";

export default function NovoDocumentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [error, formAction, pending] = useActionState(createDocumento, undefined);

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Novo Documento</h1>

      <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface p-6">
        <input type="hidden" name="aplicacao_id" value={id} />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Código do Documento" name="codigo" required />
          <Field label="Tipo de Documento" name="tipo_documento" required />
        </div>

        <Field label="Nome" name="nome" required />

        <div className="grid grid-cols-3 gap-4">
          <Field label="Data" name="data_documento" type="date" />
          <Field label="Versão" name="versao" />
          <Field label="Link de Acesso" name="link_acesso" type="url" />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold-soft disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Criar Documento"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-foreground focus:border-gold focus:outline-none"
      />
    </div>
  );
}
