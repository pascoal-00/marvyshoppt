import { createFileRoute } from "@tanstack/react-router";
import { whatsappUrl } from "@/lib/whatsapp";
import { useCatalog } from "@/lib/catalog-context";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "Como Funciona | M-Shop" },
      {
        name: "description",
        content:
          "Escolhe, adiciona ao carrinho e faz o pedido pelo WhatsApp da M-Shop. Envios para Portugal com prazo estimado até 2 semanas.",
      },
      { property: "og:title", content: "Como Funciona | M-Shop" },
      {
        property: "og:description",
        content: "Pedido via WhatsApp, envio para Portugal desde €13,50 e confirmação personalizada.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/how-it-works" },
    ],
    links: [{ rel: "canonical", href: "/how-it-works" }],
  }),
  component: HowItWorks,
});

const STEPS = [
  { n: "01", t: "ESCOLHE", d: "Encontra os produtos que queres." },
  { n: "02", t: "ADICIONA AO CARRINHO", d: "Seleciona tamanho e quantidade." },
  { n: "03", t: "FAZ O PEDIDO", d: "Envia o pedido diretamente para o WhatsApp da M-Shop." },
  { n: "04", t: "CONFIRMAÇÃO", d: "A M-Shop confirma disponibilidade, pagamento e envio." },
];

function HowItWorks() {
  const { settings } = useCatalog();
  const waUrl = whatsappUrl(settings);
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 lg:px-8">
      <h1 className="display text-4xl md:text-6xl">Como funciona</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        A M-Shop trabalha com atendimento personalizado. O pedido é iniciado no site e confirmado
        por WhatsApp.
      </p>

      <ol className="mt-12 grid gap-px bg-border sm:grid-cols-2">
        {STEPS.map((s) => (
          <li key={s.n} className="bg-background p-8">
            <span className="display text-4xl text-accent">{s.n}</span>
            <h2 className="mt-4 text-base font-semibold tracking-[0.1em]">{s.t}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </li>
        ))}
      </ol>

      <section id="envios" className="mt-16 scroll-mt-32 border-t border-border pt-10">
        <h2 className="display text-2xl">Envios</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Envio para Portugal desde €13,50.</li>
          <li>Prazo estimado: até 2 semanas.</li>
          <li>Encomendas preparadas em Angola e destinadas a Portugal.</li>
          <li>
            Os custos de envio podem variar de acordo com a quantidade e características da
            encomenda. O valor final será confirmado pela M-Shop após o pedido.
          </li>
        </ul>
      </section>

      <section id="trocas" className="mt-12 scroll-mt-32 border-t border-border pt-10">
        <h2 className="display text-2xl">Trocas</h2>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Trocas de tamanho são avaliadas caso a caso e tratadas diretamente com a equipa da M-Shop
          por WhatsApp, antes do envio de qualquer artigo.
        </p>
      </section>

      <section id="sobre" className="mt-12 scroll-mt-32 border-t border-border pt-10">
        <h2 className="display text-2xl">Sobre nós</h2>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          A M-Shop nasceu para aproximar sneakers e acessórios de quem procura estilo, variedade e
          uma experiência de compra simples.
        </p>
      </section>

      <section id="faq" className="mt-12 scroll-mt-32 border-t border-border pt-10">
        <h2 className="display text-2xl">FAQ</h2>
        <dl className="mt-6 divide-y divide-border">
          {[
            ["Como pago a encomenda?", "O pagamento é combinado diretamente com a equipa da M-Shop por WhatsApp, depois da confirmação de disponibilidade."],
            ["Quanto custa o envio?", "Desde €13,50. O valor final depende da quantidade e características da encomenda."],
            ["Quanto tempo demora?", "O prazo estimado é de até 2 semanas para Portugal."],
            ["O pedido no site é definitivo?", "Não. O pedido fica no estado \"Pedido iniciado\" até a M-Shop confirmar disponibilidade, pagamento e envio."],
          ].map(([q, a]) => (
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
        FALAR COM A M-SHOP
      </a>
    </div>
  );
}
