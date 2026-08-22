import { supabase } from "@/integrations/supabase/client";
import { mapCategory, mapProduct, mapSettings, type Category, type Product, type StoreSettings } from "./catalog";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type AdminOrder = {
  id: string;
  orderNumber: string;
  subtotal: number;
  currency: string;
  contact: string | null;
  status: string;
  createdAt: string;
  items: { id: string; productName: string; size: string; quantity: number; unitPrice: number }[];
};

export async function fetchAdminProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
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
    })
    .eq("id", true);
  if (error) throw error;
}

export function productToRow(product: Partial<Product>) {
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

export async function upsertProduct(product: Partial<Product> & { id?: string }) {
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

export async function saveCategory(category: Partial<Category> & { id?: string }) {
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
    items: (row.order_items ?? []).map((item: any) => ({
      id: item.id,
      productName: item.product_name,
      size: item.size,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price ?? 0),
    })),
  }));
}

export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(file: File) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
