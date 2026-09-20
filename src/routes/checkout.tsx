import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { formatPrice } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { CUSTOMER_STORAGE_KEY, EMPTY_CUSTOMER, customerSchema, type CustomerInfo } from "@/lib/customer";
import { useOrderSubmit } from "@/lib/use-order-submit";
import { useStore } from "@/lib/store";
import { orderUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar pedido | M-Shop" },
      {
        name: "description",
        content: "Confirma os teus dados de entrega e envia o pedido para o WhatsApp da M-Shop.",
      },
      { property: "og:title", content: "Finalizar pedido | M-Shop" },
      {
        property: "og:description",
        content: "Confirma os teus dados de entrega e envia o pedido para o WhatsApp da M-Shop.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: CheckoutPage,
});

type Errors = Partial<Record<keyof CustomerInfo, string>>;

const FIELDS: { key: keyof CustomerInfo; label: string; placeholder: string; type?: string; wide?: boolean }[] = [
  { key: "name", label: "Nome completo", placeholder: "Ex.: Ana Marques", wide: true },
  { key: "phone", label: "Telefone (WhatsApp)", placeholder: "+351 912 345 678" },
  { key: "email", label: "Email", placeholder: "nome@email.com", type: "email" },
  { key: "addressLine", label: "Endereço (rua, nº, andar)", placeholder: "Rua das Flores, 12, 3º Dto", wide: true },
  { key: "postalCode", label: "Código postal", placeholder: "1200-195" },
  { key: "city", label: "Localidade", placeholder: "Lisboa" },
  { key: "country", label: "País", placeholder: "Portugal" },
];

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, hydrated, clear } = useStore();
  const { products, settings } = useCatalog();
  const submitOrder = useOrderSubmit();

  const [form, setForm] = useState<CustomerInfo>(EMPTY_CUSTOMER);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [done, setDone] = useState<{ orderNumber: string; link: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (saved) setForm({ ...EMPTY_CUSTOMER, ...JSON.parse(saved) });
    } catch {
      /* ignore corrupted storage */
    }
  }, []);

  const set = (key: keyof CustomerInfo, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFailed(null);
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CustomerInfo;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    const customer = parsed.data;
    setSending(true);
    try {
      const orderNumber = await submitOrder(customer);
      if (!orderNumber) throw new Error("O carrinho está vazio.");
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
      const link = orderUrl(items, subtotal, products, settings, orderNumber, customer);
      setDone({ orderNumber, link });
      window.open(link, "_blank", "noopener,noreferrer");
      clear();
    } catch {
      setFailed("Não foi possível registar o pedido. Tenta novamente em alguns segundos.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-20 lg:px-8">
        <p className="eyebrow text-accent">Pedido registado</p>
        <h1 className="display mt-3 text-4xl">{done.orderNumber}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Guardámos os teus dados e a lista de produtos. A conversa de WhatsApp deve ter aberto numa
          nova janela com toda a informação — se não abriu, usa o botão abaixo. A M-Shop confirma
          disponibilidade, valor final do envio e pagamento por WhatsApp.
        </p>
        <a
          href={done.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block bg-ink px-8 py-4 text-[11px] font-semibold tracking-[0.2em] text-background transition-colors hover:bg-accent"
        >
          ABRIR WHATSAPP
        </a>
        <Link
          to="/shop"
          className="mt-4 block text-[11px] uppercase tracking-[0.18em] underline underline-offset-4"
        >
          Continuar a comprar
        </Link>
      </div>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-24 text-center lg:px-8">
        <p className="display text-2xl">O carrinho está vazio</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/shop" })}
          className="mt-6 bg-ink px-8 py-4 text-[11px] font-semibold tracking-[0.2em] text-background"
        >
          IR PARA A SHOP
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 lg:px-8">
      <nav aria-label="breadcrumb" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <Link to="/cart">Carrinho</Link> <span className="px-1">/</span>
        <span className="text-foreground">Finalizar pedido</span>
      </nav>
      <h1 className="display mt-4 text-4xl md:text-5xl">Finalizar pedido</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Preenche os teus dados de entrega. O pedido fica registado na M-Shop e, em seguida, abrimos o
        WhatsApp com toda a informação para confirmação de disponibilidade, envio e pagamento.
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <label key={field.key} className={field.wide ? "sm:col-span-2" : ""}>
              <span className="eyebrow">{field.label}</span>
              <input
                type={field.type ?? "text"}
                aria-label={field.label}
                value={form[field.key] ?? ""}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.placeholder}
                maxLength={200}
                className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-ink"
              />
              {errors[field.key] && (
                <span role="alert" className="mt-1 block text-xs text-accent">
                  {errors[field.key]}
                </span>
              )}
            </label>
          ))}

          <label className="sm:col-span-2">
            <span className="eyebrow">Nota para a M-Shop (opcional)</span>
            <textarea
              value={form.note ?? ""}
              aria-label="Nota para a M-Shop"
              onChange={(e) => set("note", e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Ex.: preferência de horário de entrega, ponto de referência…"
              className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </label>

          {failed && (
            <p role="alert" className="text-sm text-accent sm:col-span-2">
              {failed}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="bg-ink px-6 py-4 text-[11px] font-semibold tracking-[0.2em] text-background transition-colors hover:bg-accent disabled:opacity-60 sm:col-span-2"
          >
            {sending ? "A REGISTAR PEDIDO…" : "CONFIRMAR E ENVIAR PARA WHATSAPP"}
          </button>
          <p className="text-[11px] leading-relaxed text-muted-foreground sm:col-span-2">
            Os teus dados são usados apenas para preparar e enviar a encomenda.
          </p>
        </form>

        <aside className="h-fit bg-surface p-6 lg:sticky lg:top-32">
          <h2 className="eyebrow">Resumo</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => {
              const p = products.find((pr) => pr.id === item.productId);
              if (!p) return null;
              return (
                <li key={item.key} className="flex justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.quantity}× · {item.size}
                      {item.color ? ` · ${item.color}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0">{formatPrice(p.price * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Envio: {settings.shippingFrom}. {settings.shippingNote}
          </p>
        </aside>
      </div>
    </div>
  );
}
