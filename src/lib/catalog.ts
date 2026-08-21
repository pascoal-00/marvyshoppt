export type Availability = "in_stock" | "low_stock" | "unknown";
export type ProductType = "original" | "replica" | "unbranded";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  details: string[];
  price: number;
  compareAtPrice: number | null;
  currency: string;
  onSale: boolean;
  category: string;
  subcategory: string | null;
  style: string;
  images: string[];
  sizes: string[];
  availability: Availability;
  productType: ProductType;
  featured: boolean;
  isNew: boolean;
  bestSeller: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
};

export type Category = {
  id: string;
  slug: string;
  label: string;
  image: string | null;
  sortOrder: number;
  active: boolean;
};

export type StoreSettings = {
  storeName: string;
  whatsappNumber: string;
  deliveryTime: string;
  shippingFrom: string;
  shippingNote: string;
  replicaNotice: string;
  currency: string;
};

export type Catalog = {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "M-Shop",
  whatsappNumber: "244957280181",
  deliveryTime: "Até 2 semanas",
  shippingFrom: "Desde €13,50",
  shippingNote:
    "Os custos de envio podem variar de acordo com a quantidade e características da encomenda. O valor final será confirmado pela M-Shop.",
  replicaNotice:
    "IMPORTANTE: Este produto é uma réplica/reprodução e NÃO é um produto original da marca apresentada. A M-Shop não representa nem é afiliada às marcas originais.",
  currency: "EUR",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    details: row.details ?? [],
    price: Number(row.price ?? 0),
    compareAtPrice: row.compare_at_price == null ? null : Number(row.compare_at_price),
    currency: row.currency ?? "EUR",
    onSale: !!row.on_sale,
    category: row.category_slug ?? "sneakers",
    subcategory: row.subcategory ?? null,
    style: row.style ?? "everyday",
    images: row.images ?? [],
    sizes: row.sizes ?? [],
    availability: (row.availability ?? "in_stock") as Availability,
    productType: (row.product_type ?? "unbranded") as ProductType,
    featured: !!row.featured,
    isNew: !!row.is_new,
    bestSeller: !!row.best_seller,
    active: row.active !== false,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export function mapCategory(row: any): Category {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    image: row.image_url ?? null,
    sortOrder: row.sort_order ?? 0,
    active: row.active !== false,
  };
}

export function mapSettings(row: any): StoreSettings {
  if (!row) return DEFAULT_SETTINGS;
  return {
    storeName: row.store_name ?? DEFAULT_SETTINGS.storeName,
    whatsappNumber: row.whatsapp_number ?? DEFAULT_SETTINGS.whatsappNumber,
    deliveryTime: row.delivery_time ?? DEFAULT_SETTINGS.deliveryTime,
    shippingFrom: row.shipping_from ?? DEFAULT_SETTINGS.shippingFrom,
    shippingNote: row.shipping_note ?? DEFAULT_SETTINGS.shippingNote,
    replicaNotice: row.replica_notice ?? DEFAULT_SETTINGS.replicaNotice,
    currency: row.currency ?? "EUR",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const availabilityLabel: Record<Availability, string> = {
  in_stock: "Disponível",
  low_stock: "Últimas unidades",
  unknown: "Disponibilidade a confirmar",
};

export const productTypeLabel: Record<ProductType, string> = {
  original: "Produto original/autorizado",
  replica: "Réplica/reprodução",
  unbranded: "Sem marca",
};

export const styles = [
  { slug: "everyday", label: "EVERYDAY" },
  { slug: "street", label: "STREET" },
  { slug: "sport", label: "SPORT" },
  { slug: "essentials", label: "ESSENTIALS" },
];

export const SNEAKER_SIZES = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
export const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Tamanho único"];

export const ORDER_STATUSES = [
  "NOVO",
  "EM CONTACTO",
  "AGUARDA PAGAMENTO",
  "PAGAMENTO CONFIRMADO",
  "EM PREPARAÇÃO",
  "ENVIADO",
  "CONCLUÍDO",
  "CANCELADO",
] as const;

export function formatPrice(value: number, currency = "EUR") {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency }).format(value);
}

export function filterByCategorySlug(products: Product[], slug: string) {
  if (slug === "new-in") return products.filter((p) => p.isNew);
  if (slug === "best-sellers") return products.filter((p) => p.bestSeller);
  return products.filter((p) => p.category === slug);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
