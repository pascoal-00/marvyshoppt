import { supabase } from "@/integrations/supabase/client";
import {
  mapAd,
  mapCategory,
  mapProduct,
  mapSettings,
  mapSiteImage,
  SITE_IMAGE_SLOTS,
  type Ad,
  type Category,
  type Product,
  type SiteImage,
  type StoreSettings,
} from "./catalog";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type ProductInput = { [K in keyof Product]?: Product[K] | undefined };
export type CategoryInput = { [K in keyof Category]?: Category[K] | undefined };

export type AdminOrder = {
  id: string;
  orderNumber: string;
  subtotal: number;
  currency: string;
  contact: string | null;
  status: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  addressLine: string;
  postalCode: string;
  city: string;
  country: string;
  note: string | null;
  items: { id: string; productName: string; size: string; quantity: number; unitPrice: number }[];
};

export type AdminCustomer = {
  key: string;
  name: string;
  phone: string;
  email: string;
  addressLine: string;
  postalCode: string;
  city: string;
  country: string;
  orders: AdminOrder[];
  totalSpent: number;
  firstOrderAt: string;
  lastOrderAt: string;
};

export async function fetchAdminProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function fetchAdminCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function fetchAdminSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase.from("store_settings").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return mapSettings(data);
}

export async function saveSettings(values: StoreSettings) {
  const { error } = await supabase
    .from("store_settings")
    .update({
      store_name: values.storeName,
      whatsapp_number: values.whatsappNumber,
      delivery_time: values.deliveryTime,
      shipping_from: values.shippingFrom,
      shipping_note: values.shippingNote,
      replica_notice: values.replicaNotice,
      currency: values.currency,
      shipping_base: values.shippingBase,
      shipping_extra: values.shippingExtra,
      free_shipping_over: values.freeShippingOver,
    })
    .eq("id", true);
  if (error) throw error;
}

export function productToRow(product: ProductInput) {
  return {
    slug: product.slug,
    name: product.name,
    description: product.description ?? "",
    details: product.details ?? [],
    price: product.price ?? 0,
    compare_at_price: product.compareAtPrice ?? null,
    currency: product.currency ?? "EUR",
    on_sale: product.onSale ?? false,
    category_slug: product.category ?? "sneakers",
    subcategory: product.subcategory ?? null,
    style: product.style ?? "everyday",
    images: product.images ?? [],
    sizes: product.sizes ?? [],
    availability: product.availability ?? "in_stock",
    product_type: product.productType ?? "unbranded",
    featured: product.featured ?? false,
    is_new: product.isNew ?? false,
    best_seller: product.bestSeller ?? false,
    active: product.active ?? true,
    sort_order: product.sortOrder ?? 0,
  };
}

export async function upsertProduct(product: ProductInput) {
  const row = productToRow(product);
  if (product.id) {
    const { error } = await supabase.from("products").update(row as any).eq("id", product.id);
    if (error) throw error;
    return product.id;
  }
  const { data, error } = await supabase.from("products").insert(row as any).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function setProductActive(id: string, active: boolean) {
  const { error } = await supabase.from("products").update({ active }).eq("id", id);
  if (error) throw error;
}

export async function duplicateProduct(product: Product) {
  const copy = {
    ...product,
    id: undefined,
    slug: `${product.slug}-copia-${Date.now().toString().slice(-4)}`,
    name: `${product.name} (CÓPIA)`,
    active: false,
  };
  return upsertProduct(copy);
}

export async function saveCategory(category: CategoryInput) {
  const row = {
    slug: category.slug,
    label: category.label,
    image_url: category.image ?? null,
    sort_order: category.sortOrder ?? 0,
    active: category.active ?? true,
  };
  if (category.id) {
    const { error } = await supabase.from("categories").update(row as any).eq("id", category.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("categories").insert(row as any);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    orderNumber: row.order_number,
    subtotal: Number(row.subtotal ?? 0),
    currency: row.currency ?? "EUR",
    contact: row.contact ?? null,
    status: row.status,
    createdAt: row.created_at,
    customerName: row.customer_name ?? "",
    customerPhone: row.customer_phone ?? "",
    customerEmail: row.customer_email ?? "",
    addressLine: row.address_line ?? "",
    postalCode: row.postal_code ?? "",
    city: row.city ?? "",
    country: row.country ?? "",
    note: row.note ?? null,
    items: (row.order_items ?? []).map((item: any) => ({
      id: item.id,
      productName: item.product_name,
      size: item.size,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price ?? 0),
    })),
  }));
}

/** Agrupa os pedidos por cliente (telefone, ou email como alternativa). */
export function groupCustomers(orders: AdminOrder[]): AdminCustomer[] {
  const map = new Map<string, AdminCustomer>();
  for (const order of orders) {
    const key = (order.customerPhone || order.customerEmail || order.orderNumber).toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.orders.push(order);
      existing.totalSpent += order.subtotal;
      if (order.createdAt < existing.firstOrderAt) existing.firstOrderAt = order.createdAt;
      if (order.createdAt > existing.lastOrderAt) {
        existing.lastOrderAt = order.createdAt;
        existing.addressLine = order.addressLine;
        existing.postalCode = order.postalCode;
        existing.city = order.city;
        existing.country = order.country;
      }
      continue;
    }
    map.set(key, {
      key,
      name: order.customerName || order.contact || "Cliente sem nome",
      phone: order.customerPhone,
      email: order.customerEmail,
      addressLine: order.addressLine,
      postalCode: order.postalCode,
      city: order.city,
      country: order.country,
      orders: [order],
      totalSpent: order.subtotal,
      firstOrderAt: order.createdAt,
      lastOrderAt: order.createdAt,
    });
  }
  return [...map.values()].sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt));
}

export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(file: File, folder = "products") {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

/* ---------- Imagens do site ---------- */

export async function fetchSiteImages(): Promise<SiteImage[]> {
  const { data, error } = await (supabase as any)
    .from("site_images")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapSiteImage);
}

export async function saveSiteImage(slot: string, values: { image: string | null; alt: string; active: boolean }) {
  const { error } = await (supabase as any)
    .from("site_images")
    .upsert(
      {
        slot,
        image_url: values.image,
        alt: values.alt,
        active: values.active,
        sort_order: SITE_IMAGE_SLOTS.findIndex((s) => s.slot === slot),
      },
      { onConflict: "slot" },
    );
  if (error) throw error;
}

/* ---------- Publicidade ---------- */

export type AdInput = { [K in keyof Ad]?: Ad[K] | undefined };

export async function fetchAds(): Promise<Ad[]> {
  const { data, error } = await (supabase as any)
    .from("ads")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapAd);
}

export async function saveAd(ad: AdInput) {
  const row = {
    title: ad.title ?? "",
    subtitle: ad.subtitle ?? "",
    image_url: ad.image ?? null,
    link_url: ad.linkUrl ?? null,
    cta_label: ad.ctaLabel ?? "",
    placement: ad.placement ?? "home_mid",
    sort_order: ad.sortOrder ?? 0,
    active: ad.active ?? true,
  };
  if (ad.id) {
    const { error } = await (supabase as any).from("ads").update(row).eq("id", ad.id);
    if (error) throw error;
    return;
  }
  const { error } = await (supabase as any).from("ads").insert(row);
  if (error) throw error;
}

export async function deleteAd(id: string) {
  const { error } = await (supabase as any).from("ads").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Variantes de cor ---------- */

export type VariantDraft = {
  id?: string;
  colorSlug: string;
  colorName: string;
  colorHex: string;
  images: string[];
  sku: string;
  stock: number;
  sortOrder: number;
  active: boolean;
};

function variantToRow(productId: string, variant: VariantDraft) {
  return {
    product_id: productId,
    color_slug: variant.colorSlug,
    color_name: variant.colorName,
    color_hex: variant.colorHex || "#000000",
    images: variant.images,
    sku: variant.sku,
    stock: variant.stock,
    sort_order: variant.sortOrder,
    active: variant.active,
  };
}

/** Cria ou atualiza uma única variante (sem tocar nas restantes). */
export async function saveProductVariant(productId: string, variant: VariantDraft) {
  const client = supabase as any;
  const row = variantToRow(productId, variant);
  if (variant.id) {
    const { error } = await client.from("product_variants").update(row).eq("id", variant.id);
    if (error) throw error;
    return variant.id;
  }
  const { data, error } = await client.from("product_variants").insert(row).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function setVariantActive(id: string, active: boolean) {
  const { error } = await (supabase as any).from("product_variants").update({ active }).eq("id", id);
  if (error) throw error;
}

export async function deleteProductVariant(id: string) {
  const { error } = await (supabase as any).from("product_variants").delete().eq("id", id);
  if (error) throw error;
}

export async function saveProductVariants(productId: string, variants: VariantDraft[]) {
  const client = supabase as any;
  const { data: existing, error: readError } = await client
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);
  if (readError) throw readError;

  const keep = new Set(variants.map((v) => v.id).filter(Boolean));
  const toDelete = (existing ?? []).map((r: any) => r.id).filter((id: string) => !keep.has(id));
  if (toDelete.length) {
    const { error } = await client.from("product_variants").delete().in("id", toDelete);
    if (error) throw error;
  }

  for (const [index, variant] of variants.entries()) {
    const row = {
      product_id: productId,
      color_slug: variant.colorSlug,
      color_name: variant.colorName,
      color_hex: variant.colorHex || "#000000",
      images: variant.images,
      sku: variant.sku,
      stock: variant.stock,
      sort_order: index,
      active: variant.active,
    };
    if (variant.id) {
      const { error } = await client.from("product_variants").update(row).eq("id", variant.id);
      if (error) throw error;
    } else {
      const { error } = await client.from("product_variants").insert(row);
      if (error) throw error;
    }
  }
}
