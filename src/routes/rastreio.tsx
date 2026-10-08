import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/rastreio")({
  head: () => ({
    meta: [
      { title: "Rastrear Pedido | M-Shop" },
      { name: "description", content: "Consulta o estado da tua encomenda M-Shop com o número do pedido e o teu telefone ou email." },
      { property: "og:title", content: "Rastrear Pedido | M-Shop" },
      { property: "og:description", content: "Acompanha a tua encomenda M-Shop até à entrega na Europa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackPage,
});

type Item = { name: string; size: string; quantity: number; price: number };
type Result = {
  orderNumber: string; status: string; createdAt: string; updatedAt: string;
  subtotal: number; shipping: number; city: string; country: string; items: Item[];
};

const STEPS = [
  { label: "Pedido recebido", match: ["NOVO", "EM CONTACTO", "AGUARDA PAGAMENTO"] },
  { label: "Pagamento confirmado", match: ["PAGAMENTO CONFIRMADO"] },
  { label: "Em preparação", match: ["EM PREPARAÇÃO"] },
  { label: "Enviado", match: ["ENVIADO"] },
  { label: "Entregue", match: ["CONCLUÍDO"] },
];

function TrackPage() {
  const [number, setNumber] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<Result | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setRes(null);
    const { data, error } = await supabase.rpc("track_order", { _number: number.trim(), _contact: contact.trim() });
    setLoading(false);
    if (error) return setError("Não foi possível consultar agora. Tenta novamente.");
    if (!data) return setError("Pedido não encontrado. Confirma o número e o telefone ou email usados no pedido.");
    setRes(data as unknown as Result);
  }

  const cancelled = res?.status === "CANCELADO";
  const current = res ? STEPS.findIndex((s) => s.match.includes(res.status)) : -1;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-14 lg:px-8">
      <p className="eyebrow text-muted-foreground">Encomendas</p>
      <h1 className="display mt-2 text-4xl md:text-6xl">Rastrear pedido</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Introduz o número do pedido (ex.: MS-1002) e o telefone ou email que usaste ao encomendar.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Nº do pedido"
          className="h-12 border border-border bg-background px-4 text-sm uppercase outline-none focus:border-foreground" />
        <input required value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Telefone ou email"
          className="h-12 border border-border bg-background px-4 text-sm outline-none focus:border-foreground" />
        <button disabled={loading} className="h-12 bg-foreground px-6 text-xs font-semibold uppercase tracking-widest text-background disabled:opacity-60">
          {loading ? "A procurar..." : "Rastrear"}
        </button>
      </form>

      {error && <p className="mt-6 border-l-2 border-primary pl-4 text-sm">{error}</p>}

      {res && (
        <section className="mt-10 border border-border p-5 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="display text-2xl">{res.orderNumber}</h2>
            <span className="text-xs text-muted-foreground">
              {new Date(res.createdAt).toLocaleDateString("pt-PT")} · {res.city}, {res.country}
            </span>
          </div>

          {cancelled ? (
            <p className="mt-6 text-sm font-semibold text-primary">Este pedido foi cancelado.</p>
          ) : (
            <ol className="mt-8 grid gap-4 sm:grid-cols-5">
              {STEPS.map((s, i) => {
                const done = i <= current;
                return (
                  <li key={s.label} className="flex items-center gap-3 sm:flex-col sm:items-start">
                    <span className={`h-1.5 w-8 sm:w-full ${done ? (i === current ? "bg-primary" : "bg-foreground") : "bg-muted"}`} />
                    <span className={`text-xs uppercase tracking-wider ${done ? "font-semibold" : "text-muted-foreground"}`}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
          )}

          <ul className="mt-8 divide-y divide-border border-t border-border">
            {res.items.map((it, i) => (
              <li key={i} className="flex justify-between gap-4 py-3 text-sm">
                <span>{it.name} <span className="text-muted-foreground">· Tam. {it.size} · x{it.quantity}</span></span>
                <span className="shrink-0">{formatPrice(it.price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Envio</span><span>{formatPrice(Number(res.shipping))}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>{formatPrice(Number(res.subtotal) + Number(res.shipping))}</span></div>
          </div>
        </section>
      )}
    </div>
  );
}
