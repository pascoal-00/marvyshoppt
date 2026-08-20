import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { categories, getByCategorySlug } from "@/lib/products";
import { ProductGrid } from "@/components/ProductCard";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = categories.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return { label: category.label };
  },
  head: ({ params, loaderData }) => {
    const label = loaderData?.label ?? "Categoria";
    return {
      meta: [
        { title: `${label} | M-Shop` },
        { name: "description", content: `${label} selecionados pela M-Shop, com envio para Portugal.` },
        { property: "og:title", content: `${label} | M-Shop` },
        { property: "og:description", content: `${label} selecionados pela M-Shop.` },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/category/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/category/${params.slug}` }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { label } = Route.useLoaderData();
  const items = getByCategorySlug(slug);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
      <nav aria-label="breadcrumb" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <Link to="/">Home</Link> <span className="px-1">/</span>
        <Link to="/shop"> Shop</Link> <span className="px-1">/</span>
        <span className="text-foreground">{label}</span>
      </nav>
      <h1 className="display mt-6 text-4xl md:text-6xl">{label}</h1>
      <div className="mt-10">
        <ProductGrid items={items} />
      </div>
    </div>
  );
}
