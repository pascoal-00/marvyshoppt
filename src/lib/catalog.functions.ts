import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { mapCategory, mapProduct, mapSettings, DEFAULT_SETTINGS, type Catalog } from "./catalog";

export const getCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<Catalog> => {
  const { createPublicClient } = await import("./supabase-public.server");
  const supabase = createPublicClient();
  const [productsRes, categoriesRes, settingsRes] = await Promise.all([
    supabase.from("products").select("*").eq("active", true).order("sort_order", { ascending: true }),
    supabase.from("categories").select("*").eq("active", true).order("sort_order", { ascending: true }),
    supabase.from("store_settings").select("*").limit(1).maybeSingle(),
  ]);

  return {
    products: (productsRes.data ?? []).map(mapProduct),
    categories: (categoriesRes.data ?? []).map(mapCategory),
    settings: settingsRes.data ? mapSettings(settingsRes.data) : DEFAULT_SETTINGS,
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
              quantity: z.number().int().min(1).max(20),
            }),
          )
          .min(1)
          .max(50),
        contact: z.string().trim().max(120).optional(),
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
          product_name: product.name,
          size: item.size,
          quantity: item.quantity,
          unit_price: Number(product.price),
        },
      ];
    });
    if (items.length === 0) throw new Error("Nenhum produto válido no pedido.");

    const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({ subtotal, contact: data.contact ?? null, status: "NOVO" })
      .select("id, order_number")
      .single();
    if (orderError || !order) throw new Error("Não foi possível registar o pedido.");

    await supabaseAdmin.from("order_items").insert(items.map((i) => ({ ...i, order_id: order.id })));

    return { orderNumber: order.order_number, subtotal };
  });
