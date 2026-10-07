import { supabase } from "@/integrations/supabase/client";
import { useCatalog } from "./catalog-context";
import type { CustomerInfo } from "./customer";
import { useStore } from "./store";

/**
 * Registers the order (status NOVO) through the database function place_order,
 * which recalculates prices and shipping server-side. Works on any host (Lovable, Vercel).
 */
export function useOrderSubmit() {
  const { items } = useStore();
  const { products } = useCatalog();

  return async (customer: CustomerInfo): Promise<string | null> => {
    const payload = items.flatMap((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return [];
      return [{ slug: product.slug, size: item.size, quantity: item.quantity, color: item.color ?? "" }];
    });
    if (payload.length === 0) return null;
    const { data, error } = await supabase.rpc("place_order", {
      _items: payload,
      _customer: { ...customer, note: customer.note ?? "" },
    });
    if (error) throw error;
    return ((data as { orderNumber?: string } | null)?.orderNumber ?? null) as string | null;
  };
}
