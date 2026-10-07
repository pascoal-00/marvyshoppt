import { createFileRoute } from "@tanstack/react-router";
import { whatsappUrl } from "@/lib/whatsapp";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "Como Funciona | M-Shop" },
      {
        name: "description",
        content:
          "Escolhe, adiciona ao carrinho e faz o pedido pelo WhatsApp da M-Shop. Envios para a Europa com prazo estimado até 15 dias.",
      },
      { property: "og:title", content: "Como Funciona | M-Shop" },
      {
        property: "og:description",
        content: "Pedido via WhatsApp, envio para a Europa desde €13,50 e confirmação personalizada.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/how-it-works" },
    ],
    links: [{ rel: "canonical", href: "/how-it-works" }],
  }),
  component: HowItWorks,
});

const STEPS = ["01", "02", "03", "04"];

function HowItWorks() {
  const { settings } = useCatalog();
  const waUrl = whatsappUrl(settings);
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 lg:px-8">
      <h1 className="display text-4xl md:text-6xl">{t("how.title")}</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {t("how.sub")}
      </p>

      <ol className="mt-12 grid gap-px bg-border sm:grid-cols-2">
        {STEPS.map((n, i) => (
          <li key={n} className="bg-background p-8">
            <span className="display text-4xl text-accent">{n}</span>
            <h2 className="mt-4 text-base font-semibold tracking-[0.1em]">{t(`steps.${i + 1}.t`)}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t(`steps.${i + 1}.d`)}</p>
          </li>
        ))}
      </ol>

      <section id="envios" className="mt-16 scroll-mt-32 border-t border-border pt-10">
        <h2 className="display text-2xl">{t("how.shipping")}</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>{t("how.shipping.1")}</li>
          <li>{t("how.shipping.2")}</li>
          <li>{t("how.shipping.3")}</li>
          <li>{t("how.shipping.4")}</li>
        </ul>
      </section>

      <section id="trocas" className="mt-12 scroll-mt-32 border-t border-border pt-10">
        <h2 className="display text-2xl">{t("how.returns")}</h2>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          {t("how.returns.d")}
        </p>
      </section>

      <section id="sobre" className="mt-12 scroll-mt-32 border-t border-border pt-10">
        <h2 className="display text-2xl">{t("how.about")}</h2>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          {t("home.statement.sub")}
        </p>
      </section>

      <section id="faq" className="mt-12 scroll-mt-32 border-t border-border pt-10">
        <h2 className="display text-2xl">FAQ</h2>
        <dl className="mt-6 divide-y divide-border">
          {[1, 2, 3, 4].map((n) => [t(`how.faq.q${n}`), t(`how.faq.a${n}`)] as const).map(([q, a]) => (
            <div key={q} className="py-5">
              <dt className="text-sm font-semibold">{q}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-12 inline-block bg-ink px-8 py-4 text-[11px] font-semibold tracking-[0.2em] text-background transition-colors hover:bg-accent"
      >
        {t("how.cta")}
      </a>
    </div>
  );
}
