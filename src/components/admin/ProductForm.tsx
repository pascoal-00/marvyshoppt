import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import {
  APPAREL_SIZES,
  SNEAKER_SIZES,
  availabilityLabel,
  productTypeLabel,
  slugify,
  styles,
  type Availability,
  type Category,
  type Product,
  type ProductType,
} from "@/lib/catalog";
import { upsertProduct, uploadProductImage } from "@/lib/admin-api";

type Draft = Omit<Product, "id" | "createdAt"> & { id?: string };

const emptyDraft: Draft = {
  slug: "",
  name: "",
  description: "",
  details: [],
  price: 0,
  compareAtPrice: null,
  currency: "EUR",
  onSale: false,
  category: "sneakers",
  subcategory: null,
  style: "everyday",
  images: [],
  sizes: [],
  availability: "in_stock",
  productType: "unbranded",
  featured: false,
  isNew: false,
  bestSeller: false,
  active: true,
  sortOrder: 0,
};

const field = "mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground";

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(product ? { ...product } : emptyDraft);
  const [customSize, setCustomSize] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const toggleSize = (size: string) =>
    set("sizes", draft.sizes.includes(size) ? draft.sizes.filter((s) => s !== size) : [...draft.sizes, size]);

  const moveImage = (index: number, dir: -1 | 1) => {
    const next = [...draft.images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    set("images", next);
  };

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 8 * 1024 * 1024) {
          toast.error(`${file.name} excede 8 MB.`);
          continue;
        }
        urls.push(await uploadProductImage(file));
      }
      set("images", [...draft.images, ...urls]);
      if (urls.length) toast.success("Imagens carregadas.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao carregar imagens.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name) {
      toast.error("O nome do produto é obrigatório.");
      return;
    }
    if (name.length > 120) {
      toast.error("O nome deve ter menos de 120 caracteres.");
      return;
    }
    if (draft.price < 0) {
      toast.error("O preço não pode ser negativo.");
      return;
    }

    setSaving(true);
    try {
      await upsertProduct({
        ...draft,
        name,
        slug: draft.slug.trim() ? slugify(draft.slug) : slugify(name),
        onSale: draft.compareAtPrice != null && draft.compareAtPrice > draft.price,
      });
      await queryClient.invalidateQueries();
      toast.success(product ? "Produto atualizado." : "Produto criado.");
      navigate({ to: "/admin/products" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível guardar.");
    } finally {
      setSaving(false);
    }
  };

  const sizeOptions = draft.category === "sneakers" ? SNEAKER_SIZES : APPAREL_SIZES;

  return (
    <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="border border-border p-5">
          <h2 className="eyebrow">Informação</h2>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Nome do produto
            <input className={field} value={draft.name} maxLength={120} onChange={(e) => set("name", e.target.value)} required />
          </label>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Slug (URL)
            <input
              className={field}
              value={draft.slug}
              maxLength={140}
              placeholder="gerado a partir do nome"
              onChange={(e) => set("slug", e.target.value)}
            />
          </label>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Descrição
            <textarea
              className={`${field} min-h-28`}
              value={draft.description}
              maxLength={2000}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Detalhes (um por linha)
            <textarea
              className={`${field} min-h-24`}
              value={draft.details.join("\n")}
              onChange={(e) => set("details", e.target.value.split("\n").map((v) => v.trim()).filter(Boolean))}
            />
          </label>
        </section>

        <section className="border border-border p-5">
          <h2 className="eyebrow">Imagens</h2>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => onUpload(e.target.files)}
            className="mt-4 block w-full text-sm"
          />
          <input
            className={field}
            placeholder="Ou colar URL de imagem e premir Enter"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              const value = e.currentTarget.value.trim();
              if (!value) return;
              set("images", [...draft.images, value]);
              e.currentTarget.value = "";
            }}
          />
          {uploading && <p className="mt-3 text-xs text-muted-foreground">A carregar imagens...</p>}
          {draft.images.length === 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">Sem imagens. A primeira imagem é a principal.</p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {draft.images.map((url, index) => (
                <li key={`${url}-${index}`} className="border border-border">
                  <img src={url} alt={`Imagem ${index + 1}`} loading="lazy" className="aspect-square w-full object-cover" />
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-[10px] tracking-[0.12em] text-muted-foreground">
                      {index === 0 ? "PRINCIPAL" : `#${index + 1}`}
                    </span>
                    <div className="flex gap-1">
                      <button type="button" aria-label="Subir" onClick={() => moveImage(index, -1)}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" aria-label="Descer" onClick={() => moveImage(index, 1)}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Remover"
                        onClick={() => set("images", draft.images.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-accent" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-border p-5">
          <h2 className="eyebrow">Tamanhos disponíveis</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from(new Set([...sizeOptions, ...draft.sizes])).map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => toggleSize(size)}
                className={`border px-3 py-2 text-xs tracking-[0.12em] ${
                  draft.sizes.includes(size) ? "border-foreground bg-foreground text-background" : "border-border"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 border border-border bg-background px-3 py-2 text-sm"
              placeholder="Tamanho personalizado"
              value={customSize}
              maxLength={20}
              onChange={(e) => setCustomSize(e.target.value)}
            />
            <button
              type="button"
              className="border border-border px-4 text-[11px] tracking-[0.14em]"
              onClick={() => {
                const value = customSize.trim();
                if (!value || draft.sizes.includes(value)) return;
                set("sizes", [...draft.sizes, value]);
                setCustomSize("");
              }}
            >
              ADICIONAR
            </button>
          </div>
          {draft.sizes.length === 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Sem tamanhos selecionados: a loja mostra "DISPONIBILIDADE A CONFIRMAR".
            </p>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="border border-border p-5">
          <h2 className="eyebrow">Preço</h2>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Preço (€)
            <input
              type="number"
              step="0.01"
              min="0"
              className={field}
              value={draft.price}
              onChange={(e) => set("price", Number(e.target.value))}
            />
          </label>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Preço anterior (€)
            <input
              type="number"
              step="0.01"
              min="0"
              className={field}
              value={draft.compareAtPrice ?? ""}
              onChange={(e) => set("compareAtPrice", e.target.value === "" ? null : Number(e.target.value))}
            />
          </label>
        </section>

        <section className="border border-border p-5">
          <h2 className="eyebrow">Organização</h2>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Categoria
            <select className={field} value={draft.category} onChange={(e) => set("category", e.target.value)}>
              {categories
                .filter((c) => !["new-in", "best-sellers"].includes(c.slug))
                .map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
            </select>
          </label>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Subcategoria
            <input
              className={field}
              value={draft.subcategory ?? ""}
              maxLength={60}
              onChange={(e) => set("subcategory", e.target.value || null)}
            />
          </label>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Estilo
            <select className={field} value={draft.style} onChange={(e) => set("style", e.target.value)}>
              {styles.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Disponibilidade
            <select
              className={field}
              value={draft.availability}
              onChange={(e) => set("availability", e.target.value as Availability)}
            >
              {Object.entries(availabilityLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Tipo de produto (obrigatório)
            <select
              className={field}
              value={draft.productType}
              required
              onChange={(e) => set("productType", e.target.value as ProductType)}
            >
              {Object.entries(productTypeLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Ordem de exibição
            <input
              type="number"
              className={field}
              value={draft.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
            />
          </label>
        </section>

        <section className="space-y-3 border border-border p-5">
          <h2 className="eyebrow">Destaques</h2>
          {(
            [
              ["featured", "Featured"],
              ["isNew", "New in"],
              ["bestSeller", "Best seller"],
              ["active", "Publicado"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={draft[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="h-4 w-4 accent-[color:var(--color-accent)]"
              />
              {label}
            </label>
          ))}
        </section>

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full bg-foreground px-6 py-4 text-[11px] font-semibold tracking-[0.2em] text-background disabled:opacity-60"
        >
          {saving ? "A GUARDAR..." : product ? "GUARDAR ALTERAÇÕES" : "PUBLICAR PRODUTO"}
        </button>
      </aside>
    </form>
  );
}
