import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { LOCALES, LOCALE_META, useI18n } from "@/lib/i18n";

export function LanguageSwitcher({ inline = false }: { inline?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (inline) {
    return (
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("a11y.language")}>
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={l === locale}
            className={`border px-3 py-2 text-[11px] font-semibold tracking-[0.16em] ${
              l === locale ? "border-background bg-background text-ink" : "border-white/20 text-background/70"
            }`}
          >
            {LOCALE_META[l].short}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("a11y.language")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[11px] font-semibold tracking-[0.16em]"
      >
        <Globe className="h-4 w-4" />
        {LOCALE_META[locale].short}
      </button>
      {open && (
        <ul className="absolute right-0 top-full z-70 mt-3 w-40 border border-white/10 bg-ink py-1 text-background">
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                type="button"
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-xs hover:bg-white/10 ${
                  l === locale ? "text-accent" : ""
                }`}
              >
                {LOCALE_META[l].label}
                <span className="text-[10px] text-background/50">{LOCALE_META[l].short}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
