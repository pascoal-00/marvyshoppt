import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

const NAV = [
  { label: "nav.shop", to: "/shop" as const },
  { label: "nav.sneakers", to: "/category/$slug" as const, params: { slug: "sneakers" } },
  { label: "nav.accessories", to: "/category/$slug" as const, params: { slug: "acessorios" } },
  { label: "nav.newin", to: "/category/$slug" as const, params: { slug: "new-in" } },
  { label: "nav.how", to: "/how-it-works" as const },
];

export function Header() {
  const { count, openDrawer, wishlist } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { t } = useI18n();
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", close); };
  }, [menuOpen]);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: term || undefined } });
  };

  return (
    <header className="sticky top-0 z-50 bg-ink text-background">
      <div className="border-b border-white/10 px-4 py-2 text-center text-[10px] font-semibold tracking-[0.2em]">
        {t("bar.shipping")}
      </div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2 sm:gap-4 sm:px-4 lg:px-8">
        <button
          type="button"
          className="grid h-11 w-11 shrink-0 place-items-center lg:hidden"
          aria-label={t("a11y.menu")}
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden lg:block">
          <Logo className="h-9" />
        </div>

        <nav className="hidden justify-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={t(item.label)}
              to={item.to}
              params={item.params as never}
              className="text-[11px] font-semibold tracking-[0.18em] text-background/80 transition-colors hover:text-background"
              activeProps={{ className: "text-background" }}
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 justify-center lg:hidden">
          <Logo className="h-7 max-w-full sm:h-8" />
        </div>

        <div className="flex items-center justify-end gap-3 sm:gap-4">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            aria-label={t("a11y.search")}
            className="hidden sm:block"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="h-5 w-5" />
          </button>
          <Link to="/wishlist" aria-label={t("a11y.wishlist")} className="relative hidden sm:block">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center bg-accent px-1 text-[10px] font-semibold">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button type="button" onClick={openDrawer} aria-label={t("a11y.cart")} className="relative grid h-11 w-11 shrink-0 place-items-center">
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
            placeholder={t("search.placeholder")}
            aria-label={t("search.placeholder")}
            className="mx-auto block w-full max-w-2xl border-b border-white/30 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-background/50"
          />
        </form>
      )}

      {menuOpen && (
        <div role="dialog" aria-modal="true" aria-label={t("a11y.menu")} className="fixed inset-0 z-60 overflow-y-auto overscroll-contain bg-ink pb-8 lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <Logo className="h-7 max-w-full sm:h-8" />
            <button type="button" className="grid h-11 w-11 place-items-center" aria-label={t("a11y.closeMenu")} onClick={() => setMenuOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col px-4 pt-6">
            {NAV.map((item) => (
              <Link
                key={t(item.label)}
                to={item.to}
                params={item.params as never}
                className="display border-b border-white/10 py-5 text-2xl"
              >
                {t(item.label)}
              </Link>
            ))}
            <Link to="/wishlist" className="display border-b border-white/10 py-5 text-2xl">
              {t("nav.wishlist")}
            </Link>
            <form onSubmit={submitSearch} className="mt-6">
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={t("search.placeholder")}
                aria-label={t("search.placeholder")}
                className="w-full border-b border-white/30 bg-transparent py-3 text-base outline-none placeholder:text-background/50"
              />
            </form>
            <div className="mt-8">
              <LanguageSwitcher inline />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
