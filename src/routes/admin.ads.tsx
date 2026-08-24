import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteAd, fetchAds, saveAd, uploadProductImage, type AdInput } from "@/lib/admin-api";
import { AD_PLACEMENTS, type Ad } from "@/lib/catalog";

export const Route = createFileRoute("/admin/ads")({
  component: AdsPage,
});

const field =
  "mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground";

const emptyDraft: AdInput = {
  title: "",
  subtitle: "",
  image: null,
  linkUrl: "",
  ctaLabel: "",
  placement: "home_mid",
  sortOrder: 0,
  active: true,
};

function AdsPage() {
  const queryClient = useQueryClient();
  const ads = useQuery({ queryKey: ["admin", "ads"], queryFn: fetchAds });
  const [draft, setDraft] = useState<AdInput>(emptyDraft);
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof AdInput>(key: K, value: AdInput[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const save = useMutation({
    mutationFn: () => saveAd(draft),
    onSuccess: () => {
      toast.success("Anúncio guardado.");
      setDraft(emptyDraft);
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAd(id),
    onSuccess: () => {
      toast.success("Anúncio removido.");
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: (ad: Ad) => saveAd({ ...ad, active: !ad.active }),
    onSuccess: () => queryClient.invalidateQueries(),
    onError: (e: Error) => toast.error(e.message),
  });

  const upload = async (file: File) => {
    setUploading(true);
    try {
      set("image", await uploadProductImage(file));
      toast.success("Imagem carregada.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <p className="eyebrow text-muted-foreground">Admin / Publicidade</p>
      <h1 className="display mt-2 text-3xl">Publicidade</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Cria espaços publicitários (próprios ou de parceiros) em posições estratégicas da loja. Os
        anúncios inativos não aparecem no site.
      </p>

      <div className="mt-8 space-y-4 border border-border p-5">
        <p className="eyebrow">{draft.id ? "Editar anúncio" : "Novo anúncio"}</p>

        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Título
          <input className={field} value={draft.title ?? ""} maxLength={80} onChange={(e) => set("title", e.target.value)} />
        </label>
        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Subtítulo
          <input className={field} value={draft.subtitle ?? ""} maxLength={160} onChange={(e) => set("subtitle", e.target.value)} />
        </label>
        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Link de destino
          <input
            className={field}
            value={draft.linkUrl ?? ""}
            placeholder="https://..."
            onChange={(e) => set("linkUrl", e.target.value)}
          />
        </label>
        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Texto do botão
          <input className={field} value={draft.ctaLabel ?? ""} maxLength={30} onChange={(e) => set("ctaLabel", e.target.value)} />
        </label>
        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Posição no site
          <select className={field} value={draft.placement ?? "home_mid"} onChange={(e) => set("placement", e.target.value)}>
            {AD_PLACEMENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Imagem
          <input
            type="file"
            accept="image/*"
            className={field}
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
        </label>
        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Ou endereço da imagem (URL)
          <input
            className={field}
            value={draft.image ?? ""}
            placeholder="https://..."
            onChange={(e) => set("image", e.target.value || null)}
          />
        </label>
        {draft.image && <img src={draft.image} alt="" className="max-h-40 w-full object-cover" />}
        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Ordem
          <input
            type="number"
            className={field}
            value={draft.sortOrder ?? 0}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-2 text-xs tracking-[0.14em] text-muted-foreground">
          <input type="checkbox" checked={draft.active ?? true} onChange={(e) => set("active", e.target.checked)} />
          ATIVO
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={save.isPending || uploading}
            onClick={() => save.mutate()}
            className="bg-foreground px-5 py-3 text-[11px] font-semibold tracking-[0.16em] text-background disabled:opacity-60"
          >
            {save.isPending ? "A GUARDAR..." : draft.id ? "GUARDAR ALTERAÇÕES" : "CRIAR ANÚNCIO"}
          </button>
          {draft.id && (
            <button
              type="button"
              onClick={() => setDraft(emptyDraft)}
              className="border border-border px-5 py-3 text-[11px] font-semibold tracking-[0.16em]"
            >
              CANCELAR
            </button>
          )}
        </div>
      </div>

      <h2 className="display mt-12 text-2xl">Anúncios</h2>
      {ads.isLoading ? (
        <div className="mt-4 h-40 animate-pulse bg-surface" />
      ) : (ads.data ?? []).length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Ainda não existem anúncios.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {(ads.data ?? []).map((ad) => (
            <div key={ad.id} className="flex flex-wrap items-center gap-4 border border-border p-4">
              <div className="h-16 w-24 shrink-0 bg-surface">
                {ad.image && <img src={ad.image} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-40 flex-1">
                <p className="text-sm font-semibold">{ad.title || "(sem título)"}</p>
                <p className="text-xs text-muted-foreground">
                  {AD_PLACEMENTS.find((p) => p.id === ad.placement)?.label ?? ad.placement}
                </p>
                {ad.linkUrl && <p className="mt-1 truncate text-xs text-muted-foreground">{ad.linkUrl}</p>}
              </div>
              <button
                type="button"
                onClick={() => toggle.mutate(ad)}
                className={`px-4 py-2 text-[11px] font-semibold tracking-[0.16em] ${
                  ad.active ? "bg-foreground text-background" : "border border-border"
                }`}
              >
                {ad.active ? "ATIVO" : "INATIVO"}
              </button>
              <button
                type="button"
                onClick={() => setDraft({ ...ad })}
                className="border border-border px-4 py-2 text-[11px] font-semibold tracking-[0.16em]"
              >
                EDITAR
              </button>
              <button
                type="button"
                aria-label="Eliminar anúncio"
                onClick={() => remove.mutate(ad.id)}
                className="border border-border p-2 text-muted-foreground hover:text-accent"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
