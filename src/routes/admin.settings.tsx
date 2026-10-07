import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchAdminSettings, saveSettings } from "@/lib/admin-api";
import { DEFAULT_SETTINGS, type StoreSettings } from "@/lib/catalog";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

const field = "mt-2 w-full border border-border bg-background px-3 py-2 text-sm";

function SettingsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["admin", "settings"], queryFn: fetchAdminSettings });
  const [draft, setDraft] = useState<StoreSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (settings.data) setDraft(settings.data);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: () => saveSettings(draft),
    onSuccess: () => {
      toast.success("Configurações guardadas.");
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-muted-foreground">Admin / Configurações</p>
      <h1 className="display mt-2 text-3xl">Configurações</h1>

      {settings.isLoading ? (
        <div className="mt-8 h-72 animate-pulse bg-surface" />
      ) : (
        <div className="mt-8 space-y-5 border border-border p-5">
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Nome da loja
            <input className={field} value={draft.storeName} maxLength={60} onChange={(e) => set("storeName", e.target.value)} />
          </label>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            WhatsApp (apenas dígitos)
            <input
              className={field}
              value={draft.whatsappNumber}
              maxLength={20}
              onChange={(e) => set("whatsappNumber", e.target.value.replace(/\D/g, ""))}
            />
            <span className="mt-2 block normal-case tracking-normal text-muted-foreground">
              https://wa.me/{draft.whatsappNumber}
            </span>
          </label>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Prazo de entrega
            <input className={field} value={draft.deliveryTime} maxLength={80} onChange={(e) => set("deliveryTime", e.target.value)} />
          </label>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Envio
            <input className={field} value={draft.shippingFrom} maxLength={80} onChange={(e) => set("shippingFrom", e.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            {([
              ["shippingBase", "Frete 1º par (€)"],
              ["shippingExtra", "Cada par extra (€)"],
              ["freeShippingOver", "Grátis acima de (€, 0 = não)"],
            ] as const).map(([key, label]) => (
              <label key={key} className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {label}
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  className={field}
                  value={draft[key]}
                  onChange={(e) => set(key, Math.max(0, Number(e.target.value) || 0))}
                />
              </label>
            ))}
          </div>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Mensagem de envio
            <textarea
              className={`${field} min-h-24`}
              value={draft.shippingNote}
              maxLength={600}
              onChange={(e) => set("shippingNote", e.target.value)}
            />
          </label>
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Aviso de réplica
            <textarea
              className={`${field} min-h-24`}
              value={draft.replicaNotice}
              maxLength={600}
              onChange={(e) => set("replicaNotice", e.target.value)}
            />
          </label>
          <button
            type="button"
            disabled={save.isPending}
            onClick={() => save.mutate()}
            className="w-full bg-foreground px-4 py-4 text-[11px] font-semibold tracking-[0.16em] text-background disabled:opacity-60"
          >
            {save.isPending ? "A GUARDAR..." : "GUARDAR CONFIGURAÇÕES"}
          </button>
        </div>
      )}
    </div>
  );
}
