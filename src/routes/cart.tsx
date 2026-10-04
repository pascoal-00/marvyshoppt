import { createFileRoute, Link } from "@tanstack/react-router";
import { formatPrice } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Carrinho | M-Shop" },
      {
        name: "description",
        content: "Revê os teus produtos e envia o pedido para o WhatsApp da M-Shop.",
      },
      { property: "og:title", content: "Carrinho | M-Shop" },
      { property: "og:description", content: "Revê os teus produtos e envia o pedido para o WhatsApp da M-Shop." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cart" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQuantity, removeItem, subtotal, hydrated } = useStore();
  const { products, settings } = useCatalog();
  const { t, price } = useI18n();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14 lg:px-8">
      <h1 className="display text-4xl md:text-5xl">{t("cart.title")}</h1>

      {!hydrated ? (
        <div className="mt-10 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-surface" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 border border-border py-24 text-center">
          <p className="display text-2xl">{t("cart.empty")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("cart.empty.sub")}</p>
          <Link
            to="/shop"
            className="mt-6 inline-block bg-ink px-8 py-4 text-[11px] font-semibold tracking-[0.2em] text-background"
          >
            {t("cart.goShop")}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <ul className="divide-y divide-border border-y border-border">
            {items.map((item) => {
              const p = products.find((pr) => pr.id === item.productId);
              if (!p) return null;
              return (
                <li key={item.key} className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-5 py-6">
                  <Link to="/product/$slug" params={{ slug: p.slug }}>
                    <img src={p.images[0]} alt={p.name} loading="lazy" className="aspect-square w-20 object-cover sm:w-24" />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold">
                          <Link to="/product/$slug" params={{ slug: p.slug }}>{p.name}</Link>
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("cart.size")}: {item.size}{item.color ? ` · ${t("cart.color")}: ${item.color}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("cart.unitPrice")}: {price(p.price, p.currency)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-accent"
                      >
                        {t("cart.remove")}
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center border border-border">
                        <button type="button" aria-label={t("product.qtyDown")} className="px-3 py-1" onClick={() => setQuantity(item.key, item.quantity - 1)}>−</button>
                        <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                        <button type="button" aria-label={t("product.qtyUp")} className="px-3 py-1" onClick={() => setQuantity(item.key, item.quantity + 1)}>+</button>
                      </div>
                      <span className="text-sm font-semibold">{price(p.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit bg-surface p-6 lg:sticky lg:top-32">
            <h2 className="eyebrow">{t("cart.summary")}</h2>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span>{t("cart.subtotal")}</span>
              <span className="font-semibold">{price(subtotal)}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("cart.shipping")}: {settings.shippingFrom}. {settings.shippingNote}
            </p>
            <Link
              to="/checkout"
              className="mt-6 block bg-ink px-6 py-4 text-center text-[11px] font-semibold tracking-[0.2em] text-background transition-colors hover:bg-accent"
            >
              {t("cart.order")}
            </Link>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {t("cart.order.note")}
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
