import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  mapCategory,
  mapProduct,
  mapSettings,
  mapSiteImage,
  mapAd,
  DEFAULT_SETTINGS,
  type Catalog,
} from "./catalog";

export const getCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<Catalog> => {
  const { createPublicClient } = await import("./supabase-public.server");
  const supabase = createPublicClient();
  const [productsRes, categoriesRes, settingsRes, imagesRes, adsRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_variants(*)")
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    supabase.from("categories").select("*").eq("active", true).order("sort_order", { ascending: true }),
    supabase.from("store_settings").select("*").limit(1).maybeSingle(),
    supabase.from("site_images").select("*").eq("active", true).order("sort_order", { ascending: true }),
    supabase.from("ads").select("*").eq("active", true).order("sort_order", { ascending: true }),
  ]);

  return {
    products: (productsRes.data ?? []).map(mapProduct),
    categories: (categoriesRes.data ?? []).map(mapCategory),
    settings: settingsRes.data ? mapSettings(settingsRes.data) : DEFAULT_SETTINGS,
    siteImages: (imagesRes.data ?? []).map(mapSiteImage),
    ads: (adsRes.data ?? []).map(mapAd),
  };
});


export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        items: z
          .array(
            z.object({
              slug: z.string().min(1).max(120),
              size: z.string().min(1).max(40),
              color: z.string().trim().max(60).optional(),
              quantity: z.number().int().min(1).max(20),
            }),
          )
          .min(1)
          .max(50),
        customer: z.object({
          name: z.string().trim().min(2).max(120),
          phone: z.string().trim().min(6).max(30),
          email: z.string().trim().email().max(160),
          addressLine: z.string().trim().min(5).max(200),
          postalCode: z.string().trim().min(4).max(20),
          city: z.string().trim().min(2).max(80),
          country: z.string().trim().min(2).max(60),
          note: z.string().trim().max(500).optional(),
        }),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const slugs = [...new Set(data.items.map((i) => i.slug))];
    const { data: rows, error } = await supabaseAdmin
      .from("products")
      .select("id, slug, name, price, active")
      .in("slug", slugs);
    if (error) throw new Error("Não foi possível registar o pedido.");

    const found = (rows ?? []).filter((r) => r.active);
    const items = data.items.flatMap((item) => {
      const product = found.find((p) => p.slug === item.slug);
      if (!product) return [];
      return [
        {
          product_id: product.id,
          product_name: item.color ? `${product.name} (${item.color})` : product.name,
          size: item.size,
          quantity: item.quantity,
          unit_price: Number(product.price),
        },
      ];
    });
    if (items.length === 0) throw new Error("Nenhum produto válido no pedido.");

    const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
    const c = data.customer;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        subtotal,
        contact: `${c.name} · ${c.phone}`,
        customer_name: c.name,
        customer_phone: c.phone,
        customer_email: c.email,
        address_line: c.addressLine,
        postal_code: c.postalCode,
        city: c.city,
        country: c.country,
        note: c.note ?? null,
        status: "NOVO",
      })
      .select("id, order_number")
      .single();
    if (orderError || !order) throw new Error("Não foi possível registar o pedido.");

    await supabaseAdmin.from("order_items").insert(items.map((i) => ({ ...i, order_id: order.id })));

    return { orderNumber: order.order_number, subtotal };
  });

export const getProductMeta = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().max(160) }).parse(input))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
    const { data: row } = await supabase
      .from("products")
      .select("name, description, images")
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    if (!row) return null;
    return {
      name: row.name as string,
      description: (row.description as string) ?? "",
      image: ((row.images as string[]) ?? [])[0] ?? null,
    };
  });

export const getCategoryMeta = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().max(160) }).parse(input))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
    const { data: row } = await supabase
      .from("categories")
      .select("label")
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    return row ? { label: row.label as string } : null;
  });
