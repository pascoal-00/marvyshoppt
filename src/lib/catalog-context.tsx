import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SETTINGS, type Catalog } from "./catalog";

const EMPTY: Catalog = { products: [], categories: [], settings: DEFAULT_SETTINGS };

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
