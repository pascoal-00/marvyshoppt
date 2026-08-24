import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchSiteImages, saveSiteImage, uploadProductImage } from "@/lib/admin-api";
import { SITE_IMAGE_SLOTS } from "@/lib/catalog";

export const Route = createFileRoute("/admin/media")({
  component: MediaPage,
});

type Draft = { image: string | null; alt: string; active: boolean };

const field =
  "mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground";

function MediaPage() {
  const queryClient = useQueryClient();
  const images = useQuery({ queryKey: ["admin", "site-images"], queryFn: fetchSiteImages });
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!images.data) return;
    const next: Record<string, Draft> = {};
    for (const slot of SITE_IMAGE_SLOTS) {
      const row = images.data.find((i) => i.slot === slot.slot);
      next[slot.slot] = {
        image: row?.image ?? null,
        alt: row?.alt ?? "",
        active: row?.active ?? true,
      };
    }
    setDrafts(next);
  }, [images.data]);

  const save = useMutation({
    mutationFn: async ({ slot, draft }: { slot: string; draft: Draft }) => saveSiteImage(slot, draft),
    onSuccess: () => {
      toast.success("Imagem atualizada.");
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (slot: string, patch: Partial<Draft>) =>
    setDrafts((d) => ({ ...d, [slot]: { ...(d[slot] ?? { image: null, alt: "", active: true }), ...patch } }));

  const upload = async (slot: string, file: File) => {
    setUploading(slot);
    try {
      const url = await uploadProductImage(file);
      set(slot, { image: url });
      toast.success("Imagem carregada. Não te esqueças de guardar.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="max-w-4xl">
      <p className="eyebrow text-muted-foreground">Admin / Imagens do site</p>
      <h1 className="display mt-2 text-3xl">Imagens de destaque</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Substitui as imagens do hero, da campanha, do editorial “The M-Shop edit” e da galeria
        “Follow the M-Shop” pelas tuas fotografias autênticas. Se um espaço ficar vazio, o site usa a
        imagem original.
      </p>

      {images.isLoading ? (
        <div className="mt-8 h-96 animate-pulse bg-surface" />
      ) : (
        <div className="mt-8 space-y-4">
          {SITE_IMAGE_SLOTS.map((slot) => {
            const draft = drafts[slot.slot] ?? { image: null, alt: "", active: true };
            return (
              <div key={slot.slot} className="grid gap-4 border border-border p-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                <div className="aspect-[3/4] bg-surface">
                  {draft.image ? (
                    <img src={draft.image} alt={draft.alt} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-[11px] tracking-[0.14em] text-muted-foreground">
                      IMAGEM ORIGINAL
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold">{slot.label}</p>
                  <p className="text-xs text-muted-foreground">{slot.hint}</p>

                  <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Carregar imagem
                    <input
                      type="file"
                      accept="image/*"
                      className={field}
                      disabled={uploading === slot.slot}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void upload(slot.slot, file);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  <label className="mt-3 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Ou endereço da imagem (URL)
                    <input
                      className={field}
                      value={draft.image ?? ""}
                      placeholder="https://..."
                      onChange={(e) => set(slot.slot, { image: e.target.value || null })}
                    />
                  </label>

                  <label className="mt-3 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Texto alternativo (acessibilidade e SEO)
                    <input
                      className={field}
                      value={draft.alt}
                      maxLength={140}
                      onChange={(e) => set(slot.slot, { alt: e.target.value })}
                    />
                  </label>

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-xs tracking-[0.14em] text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={draft.active}
                        onChange={(e) => set(slot.slot, { active: e.target.checked })}
                      />
                      VISÍVEL
                    </label>
                    <button
                      type="button"
                      disabled={save.isPending || uploading === slot.slot}
                      onClick={() => save.mutate({ slot: slot.slot, draft })}
                      className="bg-foreground px-5 py-3 text-[11px] font-semibold tracking-[0.16em] text-background disabled:opacity-60"
                    >
                      GUARDAR
                    </button>
                    {draft.image && (
                      <button
                        type="button"
                        onClick={() => set(slot.slot, { image: null })}
                        className="border border-border px-4 py-3 text-[11px] font-semibold tracking-[0.16em]"
                      >
                        REMOVER IMAGEM
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
