import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteCategory, fetchAdminCategories, saveCategory } from "@/lib/admin-api";
import { slugify, type Category } from "@/lib/catalog";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

type Draft = { id?: string; slug: string; label: string; image: string; sortOrder: number; active: boolean };

const empty: Draft = { slug: "", label: "", image: "", sortOrder: 0, active: true };

function CategoriesPage() {
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: fetchAdminCategories });
  const [draft, setDraft] = useState<Draft>(empty);
  const [confirming, setConfirming] = useState<Category | null>(null);

  const save = useMutation({
    mutationFn: () =>
      saveCategory({
        id: draft.id,
        slug: draft.slug.trim() ? slugify(draft.slug) : slugify(draft.label),
        label: draft.label.trim().toUpperCase(),
        image: draft.image.trim() || null,
        sortOrder: draft.sortOrder,
        active: draft.active,
      }),
    onSuccess: () => {
      toast.success("Categoria guardada.");
      setDraft(empty);
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Categoria eliminada.");
      setConfirming(null);
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const field = "mt-2 w-full border border-border bg-background px-3 py-2 text-sm";

  return (
    <div>
      <p className="eyebrow text-muted-foreground">Admin / Categorias</p>
      <h1 className="display mt-2 text-3xl">Categorias</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {categories.isLoading ? (
            <div className="h-40 animate-pulse bg-surface" />
          ) : (categories.data ?? []).length === 0 ? (
            <p className="border border-border py-16 text-center text-sm text-muted-foreground">
              Ainda não há categorias.
            </p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {categories.data?.map((category) => (
                <li key={category.id} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="h-12 w-12 shrink-0 bg-surface">
                    {category.image && (
                      <img src={category.image} alt={category.label} loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{category.label}</p>
                    <p className="text-xs text-muted-foreground">
                      /{category.slug} · ordem {category.sortOrder} · {category.active ? "ativa" : "inativa"}
                    </p>
                  </div>
                  <div className="flex gap-2 text-[10px] tracking-[0.12em]">
                    <button
                      className="border border-border px-2 py-1"
                      onClick={() =>
                        setDraft({
                          id: category.id,
                          slug: category.slug,
                          label: category.label,
                          image: category.image ?? "",
                          sortOrder: category.sortOrder,
                          active: category.active,
                        })
                      }
                    >
                      EDITAR
                    </button>
                    <button
                      className="border border-border px-2 py-1"
                      onClick={() =>
                        saveCategory({ ...category, active: !category.active }).then(() => {
                          toast.success("Estado atualizado.");
                          queryClient.invalidateQueries();
                        })
                      }
                    >
                      {category.active ? "DESATIVAR" : "ATIVAR"}
                    </button>
                    <button className="border border-accent px-2 py-1 text-accent" onClick={() => setConfirming(category)}>
                      ELIMINAR
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="border border-border p-5">
          <h2 className="eyebrow">{draft.id ? "Editar categoria" : "Nova categoria"}</h2>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Nome
            <input
              className={field}
              value={draft.label}
              maxLength={60}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            />
          </label>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Slug
            <input
              className={field}
              value={draft.slug}
              maxLength={60}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
            />
          </label>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Imagem (URL)
            <input
              className={field}
              value={draft.image}
              maxLength={500}
              onChange={(e) => setDraft({ ...draft, image: e.target.value })}
            />
          </label>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Ordem
            <input
              type="number"
              className={field}
              value={draft.sortOrder}
              onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
            />
          </label>
          <label className="mt-4 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              className="h-4 w-4"
            />
            Ativa
          </label>
          <button
            type="button"
            disabled={save.isPending || !draft.label.trim()}
            onClick={() => save.mutate()}
            className="mt-6 w-full bg-foreground px-4 py-3 text-[11px] font-semibold tracking-[0.16em] text-background disabled:opacity-50"
          >
            {draft.id ? "GUARDAR" : "CRIAR CATEGORIA"}
          </button>
          {draft.id && (
            <button
              type="button"
              onClick={() => setDraft(empty)}
              className="mt-3 w-full border border-border px-4 py-3 text-[11px] tracking-[0.16em]"
            >
              CANCELAR
            </button>
          )}
        </aside>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm bg-background p-6">
            <h2 className="display text-xl">Eliminar categoria</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Vais eliminar “{confirming.label}”. Os produtos desta categoria continuam a existir.
            </p>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 border border-border px-4 py-3 text-[11px] tracking-[0.16em]" onClick={() => setConfirming(null)}>
                CANCELAR
              </button>
              <button
                className="flex-1 bg-accent px-4 py-3 text-[11px] tracking-[0.16em] text-background"
                onClick={() => remove.mutate(confirming.id)}
              >
                ELIMINAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
