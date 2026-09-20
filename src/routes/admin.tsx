import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/console-9f3d2a" });
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });
    if (!isAdmin) throw redirect({ to: "/console-9f3d2a" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "M-Shop Admin" },
      { name: "description", content: "Gestão de catálogo, pedidos e definições da M-Shop." },
      { property: "og:title", content: "M-Shop Admin" },
      { property: "og:description", content: "Gestão de catálogo, pedidos e definições da M-Shop." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/sales", label: "Vendas" },
  { to: "/admin/products", label: "Produtos" },
  { to: "/admin/variants", label: "Variantes de cor" },
  { to: "/admin/categories", label: "Categorias" },
  { to: "/admin/media", label: "Imagens do site" },
  { to: "/admin/ads", label: "Publicidade" },
  { to: "/admin/orders", label: "Pedidos" },
  { to: "/admin/customers", label: "Clientes" },
  { to: "/admin/settings", label: "Configurações" },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/console-9f3d2a", replace: true });
  };

  const nav = (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`block px-4 py-3 text-[11px] font-semibold tracking-[0.16em] transition-colors ${
              active ? "bg-accent text-background" : "text-background/70 hover:bg-white/10"
            }`}
          >
            {item.label.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between border-b border-border bg-ink px-4 py-3 text-background lg:hidden">
        <Logo className="h-6 w-auto" />
        <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && <div className="bg-ink px-2 py-3 text-background lg:hidden">{nav}</div>}

      <div className="lg:grid lg:min-h-screen lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden bg-ink py-6 text-background lg:block">
          <div className="px-4">
            <Logo className="h-7 w-auto" />
            <p className="eyebrow mt-4 text-background/50">M-SHOP ADMIN</p>
          </div>
          <div className="mt-8">{nav}</div>
          <div className="mt-8 px-4">
            <button
              type="button"
              onClick={signOut}
              className="w-full border border-white/20 px-3 py-2 text-[11px] font-semibold tracking-[0.16em]"
            >
              TERMINAR SESSÃO
            </button>
            <Link to="/" className="mt-3 block text-[11px] tracking-[0.16em] text-background/60">
              ← VER LOJA
            </Link>
          </div>
        </aside>

        <main className="px-4 py-8 lg:px-10">
          <div
            role="alert"
            className="mb-8 border-l-2 border-accent bg-muted px-4 py-3 text-xs leading-relaxed text-foreground"
          >
            <p className="eyebrow text-accent">ACESSO RESTRITO AUTORIZADO</p>
            <p className="mt-2 text-muted-foreground">
              Estás numa área privada da M-Shop. Todas as alterações a produtos, pedidos e
              configurações afetam a loja pública de imediato. Não partilhes o endereço desta área
              nem as tuas credenciais; termina sessão ao sair.
            </p>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
