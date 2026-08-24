import { useAds } from "@/lib/catalog-context";

/**
 * Renderiza os espaços publicitários geridos no admin para uma posição do site.
 * Não renderiza nada quando não há anúncios ativos.
 */
export function AdSlot({ placement, className }: { placement: string; className?: string }) {
  const ads = useAds(placement);
  if (ads.length === 0) return null;

  return (
    <section className={className ?? "mx-auto max-w-[1400px] px-4 py-10 lg:px-8"} aria-label="Publicidade">
      <p className="eyebrow text-muted-foreground">Publicidade</p>
      <div className={`mt-4 grid gap-3 ${ads.length > 1 ? "md:grid-cols-2" : ""}`}>
        {ads.map((ad) => {
          const inner = (
            <div className="group relative overflow-hidden border border-border bg-surface">
              {ad.image && (
                <img
                  src={ad.image}
                  alt={ad.title || "Publicidade"}
                  loading="lazy"
                  className="h-full max-h-[320px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              {(ad.title || ad.subtitle || ad.ctaLabel) && (
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/80 to-transparent p-6 text-background">
                  {ad.title && <p className="display text-2xl">{ad.title}</p>}
                  {ad.subtitle && <p className="mt-2 max-w-sm text-sm text-background/75">{ad.subtitle}</p>}
                  {ad.ctaLabel && (
                    <span className="mt-4 w-fit bg-background px-5 py-3 text-[11px] font-semibold tracking-[0.16em] text-ink">
                      {ad.ctaLabel.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>
          );

          return ad.linkUrl ? (
            <a
              key={ad.id}
              href={ad.linkUrl}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="block"
            >
              {inner}
            </a>
          ) : (
            <div key={ad.id}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
