import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUsuario } from "@/lib/auth";
import { PERFIL_LABEL } from "@/lib/types";
import { logout } from "./actions";

const NAV_ITEMS = [{ href: "/aplicacoes", label: "Aplicações" }];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getCurrentUsuario();

  if (!usuario) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-5 py-5">
          <span className="text-xl font-semibold tracking-tight text-gold">
            metric<span className="text-foreground">X</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-muted transition hover:bg-surface-alt hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border px-3 py-4">
          <p className="truncate px-3 text-sm font-medium text-foreground">{usuario.nome}</p>
          <p className="px-3 text-xs text-muted">{PERFIL_LABEL[usuario.perfil]}</p>
          <form action={logout}>
            <button
              type="submit"
              className="mt-3 w-full rounded-md px-3 py-2 text-left text-sm text-muted transition hover:bg-surface-alt hover:text-foreground"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
