import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";

const NAV = [
  { label: "SHOP", to: "/shop" as const },
  { label: "SNEAKERS", to: "/category/$slug" as const, params: { slug: "sneakers" } },
  { label: "ACESSÓRIOS", to: "/category/$slug" as const, params: { slug: "acessorios" } },
  { label: "NEW IN", to: "/category/$slug" as const, params: { slug: "new-in" } },
  { label: "COMO FUNCIONA", to: "/how-it-works" as const },
];

export function Header() {
  const { count, openDrawer, wishlist } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: term } });
  };

  return (
    <header className="sticky top-0 z-50 bg-ink text-background">
      <div className="border-b border-white/10 px-4 py-2 text-center text-[10px] font-semibold tracking-[0.2em]">
        ENVIOS PARA PORTUGAL <span className="text-accent">·</span> PRAZO ESTIMADO ATÉ 2 SEMANAS
      </div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 lg:px-8">
        <button
          type="button"
          className="lg:hidden"
          aria-label="Abrir menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden lg:block">
          <Logo className="h-7" />
        </div>

        <nav className="hidden justify-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              params={item.params as never}
              className="text-[11px] font-semibold tracking-[0.18em] text-background/80 transition-colors hover:text-background"
              activeProps={{ className: "text-background" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex justify-center lg:hidden">
          <Logo className="h-6" />
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            aria-label="Pesquisar"
            className="hidden sm:block"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="h-5 w-5" />
          </button>
          <Link to="/wishlist" aria-label="Favoritos" className="relative hidden sm:block">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center bg-accent px-1 text-[10px] font-semibold">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button type="button" onClick={openDrawer} aria-label="Abrir carrinho" className="relative">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center bg-accent px-1 text-[10px] font-semibold">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="border-t border-white/10 px-4 py-3 lg:px-8">
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Pesquisar produtos"
            aria-label="Pesquisar produtos"
            className="mx-auto block w-full max-w-2xl border-b border-white/30 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-background/50"
          />
        </form>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-60 bg-ink lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <Logo className="h-6" />
            <button type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col px-4 pt-6">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                params={item.params as never}
                className="display border-b border-white/10 py-5 text-2xl"
              >
                {item.label}
              </Link>
            ))}
            <Link to="/wishlist" className="display border-b border-white/10 py-5 text-2xl">
              FAVORITOS
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
