import { createFileRoute, Link } from "@tanstack/react-router";
import { formatPrice } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { useStore } from "@/lib/store";

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
  const submitOrder = useOrderSubmit();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14 lg:px-8">
      <h1 className="display text-4xl md:text-5xl">Carrinho</h1>

      {!hydrated ? (
        <div className="mt-10 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-surface" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 border border-border py-24 text-center">
          <p className="display text-2xl">O carrinho está vazio</p>
          <p className="mt-2 text-sm text-muted-foreground">Explora a seleção M-Shop.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block bg-ink px-8 py-4 text-[11px] font-semibold tracking-[0.2em] text-background"
          >
            IR PARA A SHOP
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <ul className="divide-y divide-border border-y border-border">
            {items.map((item) => {
              const p = products.find((pr) => pr.id === item.productId);
              if (!p) return null;
              return (
                <li key={item.key} className="grid grid-cols-[96px_minmax(0,1fr)] gap-5 py-6">
                  <Link to="/product/$slug" params={{ slug: p.slug }}>
                    <img src={p.images[0]} alt={p.name} loading="lazy" className="aspect-square w-24 object-cover" />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold">
                          <Link to="/product/$slug" params={{ slug: p.slug }}>{p.name}</Link>
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Tamanho: {item.size}{item.color ? ` · Cor: ${item.color}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Preço unitário: {formatPrice(p.price, p.currency)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-accent"
                      >
                        Remover
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center border border-border">
                        <button type="button" aria-label="Diminuir quantidade" className="px-3 py-1" onClick={() => setQuantity(item.key, item.quantity - 1)}>−</button>
                        <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                        <button type="button" aria-label="Aumentar quantidade" className="px-3 py-1" onClick={() => setQuantity(item.key, item.quantity + 1)}>+</button>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(p.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit bg-surface p-6 lg:sticky lg:top-32">
            <h2 className="eyebrow">Resumo</h2>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Envio: {settings.shippingFrom}. {settings.shippingNote}
            </p>
            <Link
              to="/checkout"
              className="mt-6 block bg-ink px-6 py-4 text-center text-[11px] font-semibold tracking-[0.2em] text-background transition-colors hover:bg-accent"
            >
              FAZER PEDIDO
            </Link>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              No passo seguinte preenches os teus dados de entrega. O pedido fica registado na M-Shop
              e a mensagem com toda a informação é enviada para o WhatsApp.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
