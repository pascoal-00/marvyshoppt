import { supabase } from "@/integrations/supabase/client";

export async function getProductMetaSafe(slug: string, server: () => Promise<{ name: string; description: string; image: string | null } | null>) {
  try {
    return await server();
  } catch {
    const { data: row } = await supabase
      .from("products")
      .select("name, description, images")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    if (!row) return null;
    return {
      name: row.name as string,
      description: (row.description as string) ?? "",
      image: ((row.images as string[]) ?? [])[0] ?? null,
    };
  }
}

export async function getCategoryMetaSafe(slug: string, server: () => Promise<{ label: string } | null>) {
  try {
    return await server();
  } catch {
    const { data: row } = await supabase
      .from("categories")
      .select("label")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    return row ? { label: row.label as string } : null;
  }
}
