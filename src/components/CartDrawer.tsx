import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export function CartDrawer() {
  const { drawerOpen, closeDrawer, items, setQuantity, removeItem, subtotal } = useStore();
  const { products, settings } = useCatalog();
  const { t, price } = useI18n();

  return (
    <div
      className={`fixed inset-0 z-60 ${drawerOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!drawerOpen}
    >
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-ink/60 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label={t("cart.title")}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="eyebrow">{t("cart.title")}</h2>
          <button type="button" onClick={closeDrawer} aria-label={t("cart.close")}>
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="py-20 text-center">
              <p className="display text-xl">{t("cart.empty")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("cart.empty.sub")}</p>
              <Link
                to="/shop"
                onClick={closeDrawer}
                className="mt-6 inline-block bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-background"
              >
                {t("cart.goShop")}
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => {
                const p = products.find((pr) => pr.id === item.productId);
                if (!p) return null;
                return (
                  <li key={item.key} className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 py-5">
                    <img src={p.images[0]} alt={p.name} loading="lazy" className="aspect-square w-20 object-cover" />
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold">{p.name}</h3>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-accent"
                        >
                          {t("cart.remove")}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("cart.size")}: {item.size}{item.color ? ` · ${t("cart.color")}: ${item.color}` : ""}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center border border-border">
                          <button
                            type="button"
                            aria-label={t("product.qtyDown")}
                            className="px-3 py-1"
                            onClick={() => setQuantity(item.key, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={t("product.qtyUp")}
                            className="px-3 py-1"
                            onClick={() => setQuantity(item.key, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm">{price(p.price * item.quantity)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-border px-5 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="eyebrow">{t("cart.subtotal")}</span>
              <span className="font-semibold">{price(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("cart.shipping")}: {settings.shippingFrom}.
            </p>
            <Link
              to="/checkout"
              onClick={closeDrawer}
              className="mt-4 block bg-ink px-6 py-4 text-center text-[11px] font-semibold tracking-[0.2em] text-background transition-colors hover:bg-accent"
            >
              {t("cart.order")}
            </Link>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {t("cart.order.note")}
            </p>
            <Link
              to="/cart"
              onClick={closeDrawer}
              className="mt-3 block text-center text-[11px] uppercase tracking-[0.18em] underline underline-offset-4"
            >
              {t("cart.viewCart")}
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}
