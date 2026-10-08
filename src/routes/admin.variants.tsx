import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, X } from "lucide-react";
import {
  deleteProductVariant,
  fetchAdminProducts,
  saveProductVariant,
  setVariantActive,
  uploadProductImage,
  type VariantDraft,
} from "@/lib/admin-api";
import { slugify, type Product, type ProductVariant } from "@/lib/catalog";

export const Route = createFileRoute("/admin/variants")({
  head: () => ({
    meta: [
      { title: "Variantes de cor | M-Shop Admin" },
      { name: "description", content: "Gerir variantes de cor de cada produto da M-Shop." },
      { property: "og:title", content: "Variantes de cor | M-Shop Admin" },
      { property: "og:description", content: "Gerir variantes de cor de cada produto da M-Shop." },
      { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VariantsPage,
});

const field =
  "mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground";
const label = "eyebrow text-muted-foreground";

const emptyDraft = (sortOrder = 0): VariantDraft => ({
  colorSlug: "",
  colorName: "",
  colorHex: "#000000",
  images: [],
  sku: "",
  stock: 0,
  sortOrder,
  active: true,
});

function toDraft(variant: ProductVariant): VariantDraft {
  return {
    id: variant.id,
    colorSlug: variant.colorSlug,
    colorName: variant.colorName,
    colorHex: variant.colorHex,
    images: variant.images,
    sku: variant.sku,
    stock: variant.stock,
    sortOrder: variant.sortOrder,
    active: variant.active,
  };
}

function VariantsPage() {
  const queryClient = useQueryClient();
  const products = useQuery({ queryKey: ["admin", "products"], queryFn: fetchAdminProducts });
  const [productId, setProductId] = useState<string>("");
  const [draft, setDraft] = useState<VariantDraft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState<ProductVariant | null>(null);

  const list = products.data ?? [];
  const selected: Product | undefined = useMemo(
    () => list.find((p) => p.id === productId) ?? list[0],
    [list, productId],
  );
  const variants = selected?.variants ?? [];

  const refresh = () => queryClient.invalidateQueries();

  const set = <K extends keyof VariantDraft>(key: K, value: VariantDraft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const save = useMutation({
    mutationFn: async () => {
      if (!selected || !draft) throw new Error("Escolhe um produto.");
      const colorName = draft.colorName.trim();
      if (!colorName) throw new Error("Indica o nome da cor.");
      const colorSlug = (draft.colorSlug.trim() || slugify(colorName)).toLowerCase();
      const duplicate = variants.some((v) => v.colorSlug === colorSlug && v.id !== draft.id);
      if (duplicate) throw new Error("Já existe uma cor com esse identificador neste produto.");
      await saveProductVariant(selected.id, { ...draft, colorName, colorSlug });
    },
    onSuccess: () => {
      toast.success("Cor guardada.");
      setDraft(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: (variant: ProductVariant) => setVariantActive(variant.id, !variant.active),
    onSuccess: () => refresh(),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProductVariant(id),
    onSuccess: () => {
      toast.success("Cor eliminada.");
      setConfirming(null);
      setDraft(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upload = async (files: FileList | null) => {
    if (!files?.length || !draft) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadProductImage(file));
      setDraft((d) => (d ? { ...d, images: [...d.images, ...urls] } : d));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow text-accent">CATÁLOGO</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Variantes de cor</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Escolhe um produto e gere as suas cores: cada cor tem fotos próprias, SKU e stock. As
          alterações ficam disponíveis na loja de imediato.
        </p>
      </header>

      <div>
        <p className={label}>PRODUTO</p>
        <select
          value={selected?.id ?? ""}
          onChange={(e) => {
            setProductId(e.target.value);
            setDraft(null);
          }}
          className={`${field} max-w-md`}
        >
          {list.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {products.isLoading && <p className="text-sm text-muted-foreground">A carregar…</p>}

      {selected && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-3">
            {variants.length === 0 && (
              <p className="border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                Este produto ainda não tem variantes de cor.
              </p>
            )}
            <ul className="space-y-3">
              {variants.map((variant) => (
                <li
                  key={variant.id}
                  className="flex flex-wrap items-center gap-4 border border-border p-4"
                >
                  <span
                    aria-hidden
                    className="h-8 w-8 shrink-0 border border-border"
                    style={{ backgroundColor: variant.colorHex }}
                  />
                  {variant.images[0] && (
                    <img
                      src={variant.images[0]}
                      alt={`${selected.name} — ${variant.colorName}`}
                      className="h-14 w-14 object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{variant.colorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {variant.colorSlug} · SKU {variant.sku || "—"} · stock {variant.stock} ·{" "}
                      {variant.images.length} foto(s)
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-semibold tracking-[0.16em] ${
                      variant.active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {variant.active ? "ATIVA" : "INATIVA"}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDraft(toDraft(variant))}
                      className="text-[11px] font-semibold tracking-[0.16em] underline"
                    >
                      EDITAR
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle.mutate(variant)}
                      className="text-[11px] font-semibold tracking-[0.16em] underline"
                    >
                      {variant.active ? "DESATIVAR" : "ATIVAR"}
                    </button>
                    <button
                      type="button"
                      aria-label="Eliminar cor"
                      onClick={() => setConfirming(variant)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setDraft(emptyDraft(variants.length))}
              className="border border-foreground px-4 py-2 text-[11px] font-semibold tracking-[0.16em]"
            >
              + ADICIONAR COR
            </button>
          </section>

          {draft && (
            <aside className="h-fit border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-accent">{draft.id ? "EDITAR COR" : "NOVA COR"}</p>
                <button type="button" aria-label="Fechar" onClick={() => setDraft(null)}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className={label} htmlFor="v-name">
                    NOME DA COR
                  </label>
                  <input
                    id="v-name"
                    value={draft.colorName}
                    onChange={(e) => set("colorName", e.target.value)}
                    placeholder="Preto"
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="v-slug">
                    IDENTIFICADOR NO LINK (?cor=)
                  </label>
                  <input
                    id="v-slug"
                    value={draft.colorSlug}
                    onChange={(e) => set("colorSlug", e.target.value)}
                    placeholder={draft.colorName ? slugify(draft.colorName) : "preto"}
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="v-hex">
                    COR DA BOLINHA
                  </label>
                  <input
                    id="v-hex"
                    type="color"
                    value={draft.colorHex}
                    onChange={(e) => set("colorHex", e.target.value)}
                    className="mt-2 h-10 w-20 border border-border bg-background"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label} htmlFor="v-sku">
                      SKU
                    </label>
                    <input
                      id="v-sku"
                      value={draft.sku}
                      onChange={(e) => set("sku", e.target.value)}
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor="v-stock">
                      STOCK
                    </label>
                    <input
                      id="v-stock"
                      type="number"
                      min={0}
                      value={draft.stock}
                      onChange={(e) => set("stock", Number(e.target.value))}
                      className={field}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label} htmlFor="v-order">
                      ORDEM
                    </label>
                    <input
                      id="v-order"
                      type="number"
                      value={draft.sortOrder}
                      onChange={(e) => set("sortOrder", Number(e.target.value))}
                      className={field}
                    />
                  </div>
                  <label className="mt-7 flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={draft.active}
                      onChange={(e) => set("active", e.target.checked)}
                    />
                    Ativa na loja
                  </label>
                </div>

                <div>
                  <p className={label}>FOTOS DESTA COR</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={(e) => void upload(e.target.files)}
                    className="mt-2 w-full text-xs"
                  />
                  <input
                    placeholder="ou colar URL e premir Enter"
                    className={field}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (!value) return;
                      set("images", [...draft.images, value]);
                      e.currentTarget.value = "";
                    }}
                  />
                  {draft.images.length > 0 && (
                    <ul className="mt-3 grid grid-cols-3 gap-2">
                      {draft.images.map((url, index) => (
                        <li key={`${url}-${index}`} className="relative">
                          <img src={url} alt="" className="h-20 w-full object-cover" />
                          <button
                            type="button"
                            aria-label="Remover foto"
                            onClick={() =>
                              set(
                                "images",
                                draft.images.filter((_, i) => i !== index),
                              )
                            }
                            className="absolute right-1 top-1 bg-ink/80 p-1 text-background"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={save.isPending || uploading}
                    onClick={() => save.mutate()}
                    className="bg-foreground px-4 py-2 text-[11px] font-semibold tracking-[0.16em] text-background disabled:opacity-50"
                  >
                    {save.isPending ? "A GUARDAR…" : "GUARDAR COR"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft(null)}
                    className="text-[11px] font-semibold tracking-[0.16em] underline"
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4">
          <div className="w-full max-w-sm bg-background p-6">
            <p className="text-sm font-semibold">Eliminar “{confirming.colorName}”?</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Esta cor e as suas fotos deixam de aparecer na loja.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => remove.mutate(confirming.id)}
                disabled={remove.isPending}
                className="bg-accent px-4 py-2 text-[11px] font-semibold tracking-[0.16em] text-background disabled:opacity-50"
              >
                ELIMINAR
              </button>
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="text-[11px] font-semibold tracking-[0.16em] underline"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
