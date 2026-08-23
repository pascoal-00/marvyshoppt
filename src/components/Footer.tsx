import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { whatsappUrl } from "@/lib/whatsapp";
import { useCatalog } from "@/lib/catalog-context";

export function Footer() {
  const { settings } = useCatalog();
  const waUrl = whatsappUrl(settings);
  return (
    <footer className="bg-ink text-background">
      <div className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo className="h-8" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-background/60">
              Sneakers e acessórios selecionados. Encomendas preparadas em Angola e destinadas a
              Portugal.
            </p>
          </div>

          <div>
            <h3 className="eyebrow text-background/50">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm text-background/80">
              <li><Link to="/category/$slug" params={{ slug: "sneakers" }}>Sneakers</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "acessorios" }}>Acessórios</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "new-in" }}>New In</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "best-sellers" }}>Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-background/50">M-Shop</h3>
            <ul className="mt-4 space-y-2 text-sm text-background/80">
              <li><Link to="/how-it-works" hash="sobre">Sobre nós</Link></li>
              <li><Link to="/how-it-works">Como funciona</Link></li>
              <li>
                <a href={waUrl} target="_blank" rel="noopener noreferrer">Contactos</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-background/50">Help</h3>
            <ul className="mt-4 space-y-2 text-sm text-background/80">
              <li><Link to="/how-it-works" hash="faq">FAQ</Link></li>
              <li><Link to="/how-it-works" hash="envios">Envios</Link></li>
              <li><Link to="/how-it-works" hash="trocas">Trocas</Link></li>
            </ul>
            <h3 className="eyebrow mt-8 text-background/50">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-background/80">
              <li>
                <a href={waUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-[11px] tracking-[0.14em] text-background/50">
          <p>© 2026 M-SHOP. TODOS OS DIREITOS RESERVADOS.</p>
        </div>
      </div>
    </footer>
  );
}
