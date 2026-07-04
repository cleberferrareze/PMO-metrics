"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gold">
            metric<span className="text-foreground">X</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Gestão de métricas de software</p>
        </div>

        <form
          action={formAction}
          className="rounded-lg border border-border bg-surface p-6 shadow-lg"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted">
                Usuário
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                className="mt-1 w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-foreground focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-muted">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-foreground focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-md bg-gold px-4 py-2 font-medium text-background transition hover:bg-gold-soft disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Cadastro de usuários é centralizado pelo Administrador.
        </p>
      </div>
    </div>
  );
}
