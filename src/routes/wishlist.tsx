import { createFileRoute, Link } from "@tanstack/react-router";
import { useCatalog } from "@/lib/catalog-context";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { ProductGrid } from "@/components/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Favoritos | M-Shop" },
      { name: "description", content: "Os produtos M-Shop que guardaste para mais tarde." },
      { property: "og:title", content: "Favoritos | M-Shop" },
      { property: "og:description", content: "Os produtos M-Shop que guardaste para mais tarde." },
      { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/wishlist" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/wishlist" }],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, hydrated } = useStore();
  const { products } = useCatalog();
  const { t } = useI18n();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 lg:px-8">
      <h1 className="display text-4xl md:text-5xl">{t("wishlist.title")}</h1>
      <div className="mt-10">
        {!hydrated ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse bg-surface" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="border border-border py-20 text-center">
            <p className="display text-xl">{t("wishlist.empty")}</p>
            <Link
              to="/shop"
              className="mt-6 inline-block bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-background"
            >
              {t("wishlist.cta")}
            </Link>
          </div>
        ) : (
          <ProductGrid items={items} />
        )}
      </div>
    </div>
  );
}
