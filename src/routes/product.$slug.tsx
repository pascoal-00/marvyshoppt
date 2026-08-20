import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { availabilityLabel, formatPrice, getProduct, products } from "@/lib/products";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { name: product.name, description: product.description };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Produto indisponível | M-Shop" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.name} | M-Shop` },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: `${loaderData.name} | M-Shop` },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/product/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const product = getProduct(slug)!;
  const { addItem, toggleWishlist, isWished } = useStore();
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? (product.sizes[0] ?? null) : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const handleAdd = () => {
    if (!size) {
      setError("Seleciona um tamanho para continuar.");
      return;
    }
    setError(null);
    addItem(product, size, qty);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
      <nav aria-label="breadcrumb" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <Link to="/">Home</Link> <span className="px-1">/</span>
        <Link to="/shop"> Shop</Link> <span className="px-1">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <div className="bg-surface">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              width={1008}
              height={1008}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="mt-3 flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`Ver imagem ${i + 1}`}
                className={`h-20 w-20 border ${i === activeImage ? "border-ink" : "border-transparent"}`}
              >
                <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="display text-3xl md:text-4xl">{product.name}</h1>
          <p className="mt-3 text-xl">{formatPrice(product.price)}</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {availabilityLabel[product.availability]}
          </p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="eyebrow">Tamanho</h2>
              <span className="text-[11px] text-muted-foreground">
                {product.category === "sneakers" ? "Numeração EU" : "Guia de tamanhos padrão"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setError(null);
                  }}
                  className={`min-w-14 border px-4 py-3 text-sm transition-colors ${
                    size === s ? "border-ink bg-ink text-background" : "border-border hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-border">
              <button type="button" aria-label="Diminuir quantidade" className="px-4 py-3" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="min-w-10 text-center text-sm">{qty}</span>
              <button type="button" aria-label="Aumentar quantidade" className="px-4 py-3" onClick={() => setQty((q) => Math.min(20, q + 1))}>+</button>
            </div>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={isWished(product.id)}
              className="flex items-center gap-2 border border-border px-4 py-3 text-[11px] font-semibold tracking-[0.16em]"
            >
              <Heart className={`h-4 w-4 ${isWished(product.id) ? "fill-accent text-accent" : ""}`} />
              WISHLIST
            </button>
          </div>

          {error && <p role="alert" className="mt-4 text-sm text-accent">{error}</p>}

          <button
            type="button"
            onClick={handleAdd}
            className="mt-6 hidden w-full bg-ink px-6 py-4 text-[11px] font-semibold tracking-[0.2em] text-background transition-colors hover:bg-accent lg:block"
          >
            ADICIONAR AO CARRINHO
          </button>

          <dl className="mt-10 divide-y divide-border border-t border-border text-sm">
            <div className="py-5">
              <dt className="eyebrow">Detalhes</dt>
              <dd>
                <ul className="mt-3 space-y-1 text-muted-foreground">
                  {product.details.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </dd>
            </div>
            <div className="py-5">
              <dt className="eyebrow">Envio</dt>
              <dd className="mt-3 space-y-1 text-muted-foreground">
                <p>Envio para Portugal desde €13,50.</p>
                <p>Prazo estimado: até 2 semanas.</p>
                <p>O valor final do envio será confirmado de acordo com a quantidade e características da encomenda.</p>
              </dd>
            </div>
            <div className="py-5">
              <dt className="eyebrow">Trocas</dt>
              <dd className="mt-3 text-muted-foreground">
                Trocas de tamanho avaliadas caso a caso, tratadas por WhatsApp antes do envio.
              </dd>
            </div>
            <div className="py-5">
              <dt className="eyebrow">FAQ</dt>
              <dd className="mt-3 text-muted-foreground">
                O pedido é confirmado por WhatsApp.{" "}
                <Link to="/how-it-works" className="underline underline-offset-4">Ver como funciona</Link>.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="display text-2xl">Também pode interessar</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <div className="sticky bottom-0 z-40 -mx-4 mt-12 border-t border-border bg-background px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={handleAdd}
          className="w-full bg-ink px-6 py-4 text-[11px] font-semibold tracking-[0.2em] text-background"
        >
          ADICIONAR AO CARRINHO
        </button>
      </div>
    </div>
  );
}
