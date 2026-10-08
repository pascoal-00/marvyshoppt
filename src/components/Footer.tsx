import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { whatsappUrl } from "@/lib/whatsapp";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { settings } = useCatalog();
  const waUrl = whatsappUrl(settings);
  const { t } = useI18n();
  return (
    <footer className="bg-ink text-background">
      <div className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-5">
          <div className="col-span-2">
            <Logo className="h-8" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-background/60">
              {t("footer.about")}
            </p>
          </div>

          <div>
            <h3 className="eyebrow break-words text-background/50">Shop</h3>
            <ul className="mt-4 space-y-3 text-sm text-background/80">
              <li><Link to="/category/$slug" params={{ slug: "sneakers" }}>Sneakers</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "acessorios" }}>{t("nav.accessories")}</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "new-in" }}>New In</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "best-sellers" }}>Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow break-words text-background/50">M-Shop</h3>
            <ul className="mt-4 space-y-3 text-sm text-background/80">
              <li><Link to="/how-it-works" hash="sobre">{t("footer.about.link")}</Link></li>
              <li><Link to="/how-it-works">{t("how.title")}</Link></li>
              <li>
                <a href={waUrl} target="_blank" rel="noopener noreferrer">{t("footer.contact")}</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow break-words text-background/50">{t("footer.help")}</h3>
            <ul className="mt-4 space-y-3 text-sm text-background/80">
              <li><Link to="/how-it-works" hash="faq">FAQ</Link></li>
              <li><Link to="/how-it-works" hash="envios">{t("footer.shipping")}</Link></li>
              <li><Link to="/how-it-works" hash="trocas">{t("footer.returns")}</Link></li>
            </ul>
            <h3 className="eyebrow mt-8 text-background/50">{t("footer.contact")}</h3>
            <ul className="mt-4 space-y-3 text-sm text-background/80">
              <li>
                <a href={waUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-[11px] tracking-[0.14em] text-background/50">
          <p>{t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
