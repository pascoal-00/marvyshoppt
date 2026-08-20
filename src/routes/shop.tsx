import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/lib/products";
import { ProductGrid } from "@/components/ProductCard";

type ShopSearch = { q?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search.q === "string" && search.q.length > 0 ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop | M-Shop" },
      {
        name: "description",
        content: "Explora a seleção M-Shop de sneakers e acessórios, com envio para Portugal.",
      },
      { property: "og:title", content: "Shop | M-Shop" },
      { property: "og:description", content: "Explora a seleção M-Shop de sneakers e acessórios." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

const SORTS = [
  { id: "relevance", label: "Relevância" },
  { id: "newest", label: "Mais recentes" },
  { id: "price-asc", label: "Preço: menor → maior" },
  { id: "price-desc", label: "Preço: maior → menor" },
] as const;

const ALL_SIZES = ["39", "40", "41", "42", "43", "44", "45", "S", "M", "L", "XL"];

function ShopPage() {
  const { q } = Route.useSearch();
  const [term, setTerm] = useState(q ?? "");
  const [category, setCategory] = useState<"all" | "sneakers" | "acessorios">("all");
  const [maxPrice, setMaxPrice] = useState(150);
  const [size, setSize] = useState<string | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (p.price > maxPrice) return false;
      if (size && !p.sizes.includes(size)) return false;
      if (onlyAvailable && p.availability === "unknown") return false;
      if (term.trim() && !p.name.toLowerCase().includes(term.trim().toLowerCase())) return false;
      return true;
    });
    list = [...list];
    if (sort === "newest") list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [category, maxPrice, size, onlyAvailable, term, sort]);

  const filters = (
    <div className="space-y-8">
      <div>
        <h3 className="eyebrow">Categoria</h3>
        <div className="mt-3 flex flex-col items-start gap-2 text-sm">
          {[
            { id: "all", label: "Todos" },
            { id: "sneakers", label: "Sneakers" },
            { id: "acessorios", label: "Acessórios" },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id as typeof category)}
              className={category === c.id ? "border-b border-ink" : "text-muted-foreground"}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="eyebrow">Preço máximo</h3>
        <input
          type="range"
          min={20}
          max={150}
          step={5}
          value={maxPrice}
          aria-label="Preço máximo"
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--accent)]"
        />
        <p className="mt-1 text-sm text-muted-foreground">Até €{maxPrice}</p>
      </div>

      <div>
        <h3 className="eyebrow">Tamanho</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(size === s ? null : s)}
              className={`border px-3 py-1 text-xs ${size === s ? "border-ink bg-ink text-background" : "border-border"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={onlyAvailable}
          onChange={(e) => setOnlyAvailable(e.target.checked)}
          className="accent-[var(--accent)]"
        />
        Apenas disponibilidade confirmada
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
      <nav aria-label="breadcrumb" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <Link to="/">Home</Link> <span className="px-1">/</span> <span className="text-foreground">Shop</span>
      </nav>

      <h1 className="display mt-6 text-4xl md:text-6xl">Shop</h1>
      <p className="mt-3 text-sm text-muted-foreground">Explora a seleção M-Shop.</p>

      <div className="mt-8 grid gap-4 border-y border-border py-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Pesquisar"
          aria-label="Pesquisar produtos"
          className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="border border-ink px-4 py-2 text-[11px] font-semibold tracking-[0.18em] lg:hidden"
        >
          FILTROS
        </button>
        <label className="flex items-center gap-2 text-sm">
          <span className="eyebrow text-muted-foreground">Ordenar</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="border border-border px-2 py-2 text-sm"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">{filters}</aside>
        {filtersOpen && <div className="lg:hidden">{filters}</div>}
        <div>
          <p className="mb-6 text-xs text-muted-foreground">{results.length} produto(s)</p>
          <ProductGrid items={results} />
        </div>
      </div>
    </div>
  );
}
