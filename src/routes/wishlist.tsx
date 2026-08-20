import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/lib/products";
import { useStore } from "@/lib/store";
import { ProductGrid } from "@/components/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Favoritos | M-Shop" },
      { name: "description", content: "Os produtos M-Shop que guardaste para mais tarde." },
      { property: "og:title", content: "Favoritos | M-Shop" },
      { property: "og:description", content: "Os produtos M-Shop que guardaste para mais tarde." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/wishlist" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/wishlist" }],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, hydrated } = useStore();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 lg:px-8">
      <h1 className="display text-4xl md:text-5xl">Favoritos</h1>
      <div className="mt-10">
        {!hydrated ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse bg-surface" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="border border-border py-20 text-center">
            <p className="display text-xl">Ainda não guardaste nada</p>
            <Link
              to="/shop"
              className="mt-6 inline-block bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-background"
            >
              EXPLORAR A SHOP
            </Link>
          </div>
        ) : (
          <ProductGrid items={items} />
        )}
      </div>
    </div>
  );
}
