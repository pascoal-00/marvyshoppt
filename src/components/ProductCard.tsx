import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { availabilityLabel, formatPrice, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWished, addItem } = useStore();
  const wished = isWished(product.id);

  return (
    <article className="group relative">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block overflow-hidden bg-surface"
      >
        <div className="relative aspect-square">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
          <img
            src={product.images[1] ?? product.images[0]}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
          {product.isNew && (
            <span className="absolute left-0 top-0 bg-ink px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-background">
              NEW
            </span>
          )}
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-label={wished ? `Remover ${product.name} dos favoritos` : `Adicionar ${product.name} aos favoritos`}
        aria-pressed={wished}
        className="absolute right-2 top-2 grid h-9 w-9 place-items-center bg-background/80 text-foreground transition-colors hover:bg-background"
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-accent text-accent" : ""}`} />
      </button>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight">
            <Link to="/product/$slug" params={{ slug: product.slug }}>
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm">{formatPrice(product.price)}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {availabilityLabel[product.availability]}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => addItem(product, product.sizes[0])}
        className="mt-3 w-full border border-ink px-3 py-2 text-[11px] font-semibold tracking-[0.18em] transition-colors hover:bg-ink hover:text-background"
      >
        ADICIONAR
      </button>
    </article>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  if (items.length === 0) {
    return (
      <div className="border border-border py-20 text-center">
        <p className="display text-xl">Sem resultados</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajusta os filtros ou a pesquisa para encontrares outros produtos.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
