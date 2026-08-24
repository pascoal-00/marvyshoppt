import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SETTINGS, type Catalog } from "./catalog";

const EMPTY: Catalog = {
  products: [],
  categories: [],
  settings: DEFAULT_SETTINGS,
  siteImages: [],
  ads: [],
};

const CatalogContext = createContext<Catalog>(EMPTY);

export function CatalogProvider({ value, children }: { value: Catalog; children: ReactNode }) {
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}

export function useProductBySlug(slug: string) {
  const { products } = useCatalog();
  return products.find((p) => p.slug === slug);
}

/** Imagem gerida no admin para um espaço do site, com fallback local. */
export function useSiteImage(slot: string, fallback: string, fallbackAlt: string) {
  const { siteImages } = useCatalog();
  const entry = siteImages.find((i) => i.slot === slot);
  return {
    src: entry?.image || fallback,
    alt: entry?.alt || fallbackAlt,
  };
}

export function useAds(placement: string) {
  const { ads } = useCatalog();
  return ads.filter((a) => a.placement === placement && a.active);
}
