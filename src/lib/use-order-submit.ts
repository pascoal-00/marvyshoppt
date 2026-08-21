import { useServerFn } from "@tanstack/react-start";
import { createOrder } from "./catalog.functions";
import { useCatalog } from "./catalog-context";
import { useStore } from "./store";

/**
 * Registers the WhatsApp order attempt in the backend (status NOVO).
 * A registered order is NOT a confirmed payment.
 */
export function useOrderSubmit() {
  const register = useServerFn(createOrder);
  const { items } = useStore();
  const { products } = useCatalog();

  return () => {
    const payload = items.flatMap((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return [];
      return [{ slug: product.slug, size: item.size, quantity: item.quantity }];
    });
    if (payload.length === 0) return;
    void register({ data: { items: payload } }).catch(() => undefined);
  };
}
