import { supabase } from "@/integrations/supabase/client";
import { mapAd, mapCategory, mapProduct, mapSettings, mapSiteImage, DEFAULT_SETTINGS, type Catalog } from "./catalog";

/** Carrega o catálogo diretamente da base de dados (usado quando o servidor não está disponível, ex. Vercel). */
export async function fetchCatalogDirect(): Promise<Catalog> {
  const [p, c, s, i, a] = await Promise.all([
    supabase.from("products").select("*, product_variants(*)").eq("active", true).order("sort_order"),
    supabase.from("categories").select("*").eq("active", true).order("sort_order"),
    supabase.from("store_settings").select("*").limit(1).maybeSingle(),
    supabase.from("site_images").select("*").eq("active", true).order("sort_order"),
    supabase.from("ads").select("*").eq("active", true).order("sort_order"),
  ]);
  return {
    products: (p.data ?? []).map(mapProduct),
    categories: (c.data ?? []).map(mapCategory),
    settings: s.data ? mapSettings(s.data) : DEFAULT_SETTINGS,
    siteImages: (i.data ?? []).map(mapSiteImage),
    ads: (a.data ?? []).map(mapAd),
  };
}
