import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCatalog } from "@/lib/catalog-context";
import { CUSTOMER_STORAGE_KEY, EMPTY_CUSTOMER, customerSchema, type CustomerInfo } from "@/lib/customer";
import { OrderTotals } from "@/components/OrderTotals";
import { calcShipping } from "@/lib/catalog";
import { useOrderSubmit } from "@/lib/use-order-submit";
import { useStore } from "@/lib/store";
import { DEFAULT_DIAL, DIAL_CODES, useI18n } from "@/lib/i18n";
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
  { key: "name", label: "checkout.name", placeholder: "Ana Marques", wide: true },
  { key: "phone", label: "checkout.phone", placeholder: "912 345 678" },
  { key: "email", label: "checkout.email", placeholder: "nome@email.com", type: "email" },
  { key: "addressLine", label: "checkout.address", placeholder: "Rua das Flores, 12, 3º Dto", wide: true },
  { key: "postalCode", label: "checkout.postal", placeholder: "1200-195" },
  { key: "city", label: "checkout.city", placeholder: "Lisboa" },
  { key: "country", label: "checkout.country", placeholder: "Portugal, España, France…" },
];

/** Separa "+351 912…" em indicativo + número local. */
function splitPhone(full: string) {
  const match = DIAL_CODES.map((d) => d.code)
    .sort((a, b) => b.length - a.length)
    .find((code) => full.startsWith(code));
  return match ? { dial: match, local: full.slice(match.length).trim() } : { dial: DEFAULT_DIAL, local: full };
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, hydrated, clear } = useStore();
  const { products, settings } = useCatalog();
  const submitOrder = useOrderSubmit();
  const { t, price } = useI18n();
  const [dial, setDial] = useState(DEFAULT_DIAL);

  const [form, setForm] = useState<CustomerInfo>(EMPTY_CUSTOMER);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [done, setDone] = useState<{ orderNumber: string; link: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (saved) {
        const data = { ...EMPTY_CUSTOMER, ...JSON.parse(saved) } as CustomerInfo;
        const { dial: d, local } = splitPhone(data.phone);
        setDial(d);
        setForm({ ...data, phone: local });
      }
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
    const local = form.phone.trim().replace(/^\+\d+\s*/, "");
    const parsed = customerSchema.safeParse({ ...form, phone: local ? `${dial} ${local}` : "" });
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
      if (!orderNumber) throw new Error("empty");
      const units = items.reduce((n, i) => n + i.quantity, 0);
      const shipping = calcShipping(settings, subtotal, units);
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
      const link = orderUrl(items, subtotal, products, settings, orderNumber, customer, shipping);
      setDone({ orderNumber, link });
      window.open(link, "_blank", "noopener,noreferrer");
      clear();
    } catch {
      setFailed(t("checkout.failed"));
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-20 lg:px-8">
        <p className="eyebrow text-accent">{t("checkout.done")}</p>
        <h1 className="display mt-3 text-4xl">{done.orderNumber}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {t("checkout.done.sub")}
        </p>
        <a
          href={done.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block bg-ink px-8 py-4 text-[11px] font-semibold tracking-[0.2em] text-background transition-colors hover:bg-accent"
        >
          {t("checkout.openWa")}
        </a>
        <Link
          to="/shop"
          className="mt-4 block text-[11px] uppercase tracking-[0.18em] underline underline-offset-4"
        >
          {t("checkout.continue")}
        </Link>
      </div>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-24 text-center lg:px-8">
        <p className="display text-2xl">{t("cart.empty")}</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/shop" })}
          className="mt-6 bg-ink px-8 py-4 text-[11px] font-semibold tracking-[0.2em] text-background"
        >
          {t("cart.goShop")}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 lg:px-8">
      <nav aria-label="breadcrumb" className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <Link to="/cart">{t("cart.title")}</Link> <span className="px-1">/</span>
        <span className="text-foreground">{t("checkout.title")}</span>
      </nav>
      <h1 className="display mt-4 text-4xl md:text-5xl">{t("checkout.title")}</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {t("checkout.sub")}
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <label key={field.key} className={field.wide ? "sm:col-span-2" : ""}>
              <span className="eyebrow">{t(field.label)}</span>
              {field.key === "phone" ? (
                <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)]">
                  <select
                    aria-label={t("checkout.dial")}
                    value={dial}
                    onChange={(e) => setDial(e.target.value)}
                    className="border border-r-0 border-border bg-background px-2 py-3 text-sm outline-none focus:border-ink"
                  >
                    {DIAL_CODES.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.code} {d.country}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    inputMode="tel"
                    aria-label={t(field.label)}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={24}
                    className="w-full min-w-0 border border-border bg-background px-4 py-3 text-sm outline-none focus:border-ink"
                  />
                </div>
              ) : (
              <input
                type={field.type ?? "text"}
                aria-label={t(field.label)}
                value={form[field.key] ?? ""}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.placeholder}
                maxLength={200}
                className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-ink"
              />
              )}
              {errors[field.key] && (
                <span role="alert" className="mt-1 block text-xs text-accent">
                  {errors[field.key]}
                </span>
              )}
            </label>
          ))}

          <label className="sm:col-span-2">
            <span className="eyebrow">{t("checkout.note")}</span>
            <textarea
              value={form.note ?? ""}
              aria-label={t("checkout.note")}
              onChange={(e) => set("note", e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={t("checkout.note.ph")}
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
            {sending ? t("checkout.sending") : t("checkout.submit")}
          </button>
          <p className="text-[11px] leading-relaxed text-muted-foreground sm:col-span-2">
            {t("checkout.privacy")}
          </p>
        </form>

        <aside className="h-fit bg-surface p-6 lg:sticky lg:top-32">
          <h2 className="eyebrow">{t("cart.summary")}</h2>
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
                  <span className="shrink-0">{price(p.price * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 border-t border-border pt-4">
            <OrderTotals />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{settings.shippingNote}</p>
        </aside>
      </div>
    </div>
  );
}
