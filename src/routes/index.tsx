import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { styles } from "@/lib/catalog";
import { useCatalog, useSiteImage } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n";
import { AdSlot } from "@/components/AdSlot";
import { ProductCard } from "@/components/ProductCard";
import hero from "@/assets/hero.jpg";
import edit1 from "@/assets/edit1.jpg";
import edit2 from "@/assets/edit2.jpg";
import catAcc from "@/assets/cat-acc.jpg";
import campaign from "@/assets/image-7.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "M-Shop | Sneakers & Acessórios" },
      {
        name: "description",
        content:
          "Descobre sneakers e acessórios selecionados pela M-Shop, com envios para toda a Europa.",
      },
      { property: "og:title", content: "M-Shop | Sneakers & Acessórios" },
      {
        property: "og:description",
        content: "Sneakers e acessórios selecionados. Envio para a Europa desde €13,50.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const STEPS = [
  { n: "01", t: "ESCOLHE", d: "Encontra os produtos que queres." },
  { n: "02", t: "ADICIONA AO CARRINHO", d: "Seleciona tamanho e quantidade." },
  { n: "03", t: "FAZ O PEDIDO", d: "Envia o pedido diretamente para o WhatsApp da M-Shop." },
  { n: "04", t: "CONFIRMAÇÃO", d: "A M-Shop confirma disponibilidade, pagamento e envio." },
];

function Home() {
  const { products, categories, settings } = useCatalog();
  const { t } = useI18n();
  const heroImg = useSiteImage("hero", hero, "Editorial M-Shop: streetwear e sneakers");
  const campaignImg = useSiteImage("campaign", campaign.url, "M-SHOP STREET 03");
  const editImg1 = useSiteImage("edit_1", edit1, "Editorial M-Shop");
  const editImg2 = useSiteImage("edit_2", edit2, "Editorial M-Shop");
  const socialFallback = [edit1, edit2, catAcc, edit2, edit1, catAcc];
  const socialImgs = [
    useSiteImage("social_1", socialFallback[0]!, ""),
    useSiteImage("social_2", socialFallback[1]!, ""),
    useSiteImage("social_3", socialFallback[2]!, ""),
    useSiteImage("social_4", socialFallback[3]!, ""),
    useSiteImage("social_5", socialFallback[4]!, ""),
    useSiteImage("social_6", socialFallback[5]!, ""),
  ];
  const newIn = products.filter((p) => p.isNew).slice(0, 4);
  const TRUST = [
    { t: t("trust.shipping"), d: settings.shippingFrom },
    { t: t("trust.delivery"), d: settings.deliveryTime },
    { t: t("trust.whatsapp"), d: t("trust.whatsapp.d") },
    { t: t("trust.payment"), d: t("trust.payment.d") },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-ink text-background">
        <img
          src={heroImg.src}
          alt={heroImg.alt}
          width={1600}
          height={1104}
          className="h-[62vh] min-h-[420px] w-full object-cover opacity-80 md:h-[78vh]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1400px] px-4 lg:px-8">
            <p className="eyebrow text-accent">{t("home.eyebrow")}</p>
            <h1 className="display mt-4 text-5xl sm:text-6xl lg:text-8xl">
              Your style.
              <br />
              Your pair.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-background/70">
              {t("home.hero.sub")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/category/$slug"
                params={{ slug: "sneakers" }}
                className="bg-background px-7 py-4 text-[11px] font-semibold tracking-[0.2em] text-ink transition-colors hover:bg-accent hover:text-background"
              >
                {t("home.cta.sneakers")}
              </Link>
              <Link
                to="/category/$slug"
                params={{ slug: "new-in" }}
                className="border border-white/40 px-7 py-4 text-[11px] font-semibold tracking-[0.2em] transition-colors hover:border-background"
              >
                {t("home.cta.newin")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-6 gap-y-8 px-4 py-8 lg:grid-cols-4 lg:px-8">
          {TRUST.map((i) => (
            <div key={i.t} className="px-2">
              <p className="eyebrow">{i.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{i.d}</p>
            </div>
          ))}
        </div>
      </section>

      <AdSlot placement="home_top" />

      {/* CATEGORIES */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
        <h2 className="display text-3xl md:text-4xl">{t("home.categories")}</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group relative block overflow-hidden bg-surface"
            >
              <img
                src={c.image ?? (c.slug === "acessorios" ? catAcc : hero)}
                alt={c.label}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <span className="absolute bottom-5 left-5 display text-lg text-background">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* NEW IN */}
      <section className="mx-auto max-w-[1400px] px-4 pb-16 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="display text-3xl md:text-4xl">{t("home.newin")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("home.newin.sub")}
            </p>
          </div>
          <Link to="/shop" className="eyebrow shrink-0 border-b border-ink pb-1">
            {t("home.viewAll")}
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
          {newIn.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* FEATURED CAMPAIGN */}
      <section className="bg-ink text-background">
        <div className="mx-auto grid max-w-[1400px] items-stretch gap-0 lg:grid-cols-[1.2fr_1fr]">
          <img
            src={campaignImg.src}
            alt={campaignImg.alt}
            loading="lazy"
            className="h-full max-h-[560px] w-full object-cover"
          />
          <div className="flex flex-col justify-center px-6 py-14 lg:px-14">
            <p className="eyebrow text-accent">{t("home.highlight")}</p>
            <h2 className="display mt-4 text-4xl lg:text-5xl">Street 03</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-background/70">
              {t("home.campaign.sub")}
            </p>
            <Link
              to="/product/$slug"
              params={{ slug: "m-shop-street-03" }}
              className="mt-8 w-fit bg-background px-7 py-4 text-[11px] font-semibold tracking-[0.2em] text-ink transition-colors hover:bg-accent hover:text-background"
            >
              {t("home.explore")}
            </Link>
          </div>
        </div>
      </section>

      {/* SHOP BY STYLE */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
        <h2 className="display text-3xl md:text-4xl">{t("home.styles")}</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {styles.map((s) => (
            <Link
              key={s.slug}
              to="/shop"
              className="border border-border px-6 py-10 transition-colors hover:border-ink"
            >
              <span className="display text-xl">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <AdSlot placement="home_mid" />

      {/* COMO FUNCIONA */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
          <h2 className="display text-3xl md:text-4xl">{t("home.how")}</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.n}>
                <span className="display text-3xl text-accent">{s.n}</span>
                <h3 className="mt-3 text-sm font-semibold tracking-[0.1em]">{t(`steps.${i + 1}.t`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`steps.${i + 1}.d`)}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            {t("home.how.note")}
          </p>
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
        <h2 className="display text-3xl md:text-4xl">The M-Shop edit</h2>
        <div className="mt-8 grid gap-3 md:grid-cols-[1fr_1.4fr]">
          <img src={editImg1.src} alt={editImg1.alt} loading="lazy" className="h-full w-full object-cover" />
          <div className="grid gap-3">
            <img src={editImg2.src} alt={editImg2.alt} loading="lazy" className="h-full w-full object-cover" />
            <div className="flex items-center justify-between gap-4 bg-ink px-6 py-8 text-background">
              <p className="display text-2xl">Move different.</p>
              <Link to="/shop" className="eyebrow shrink-0 border-b border-background pb-1">
                Shop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND STATEMENT */}
      <section className="bg-ink py-24 text-background">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <h2 className="display text-5xl md:text-7xl">Move different.</h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-background/70">
            {t("home.statement.sub")}
          </p>
        </div>
      </section>

      {/* SOCIAL */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="display text-2xl md:text-3xl">Follow the M-Shop</h2>
          <span className="text-sm text-muted-foreground">@M-SHOP</span>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 md:grid-cols-6">
          {socialImgs.map((img, i) => (
            <img key={i} src={img.src} alt={img.alt} loading="lazy" className="aspect-square w-full object-cover grayscale transition-all duration-500 hover:grayscale-0" />
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-16 md:grid-cols-2 lg:px-8">
          <div>
            <h2 className="display text-3xl md:text-4xl">Stay in the loop.</h2>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Novidades, novos drops e reposições — sem ruído.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="self-center"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto]">
        <label htmlFor="newsletter-email" className="sr-only">Email</label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border border-ink px-4 py-4 text-sm outline-none"
        />
        <button
          type="submit"
          className="bg-ink px-6 py-4 text-[11px] font-semibold tracking-[0.2em] text-background transition-colors hover:bg-accent"
        >
          SUBSCREVER
        </button>
      </div>
      {done && (
        <p role="status" className="mt-3 text-xs text-muted-foreground">
          Obrigado. Vamos guardar o teu contacto para as próximas novidades.
        </p>
      )}
    </form>
  );
}
