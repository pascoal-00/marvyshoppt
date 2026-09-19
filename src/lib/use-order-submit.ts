import { useServerFn } from "@tanstack/react-start";
import { createOrder } from "./catalog.functions";
import { useCatalog } from "./catalog-context";
import type { CustomerInfo } from "./customer";
import { useStore } from "./store";

/**
 * Registers the order in the backend (status NOVO) with the customer data.
 * A registered order is NOT a confirmed payment.
 */
export function useOrderSubmit() {
  const register = useServerFn(createOrder);
  const { items } = useStore();
  const { products } = useCatalog();

  return async (customer: CustomerInfo): Promise<string | null> => {
    const payload = items.flatMap((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return [];
      return [
        {
          slug: product.slug,
          size: item.size,
          quantity: item.quantity,
          ...(item.color ? { color: item.color } : {}),
        },
      ];
    });
    if (payload.length === 0) return null;
    const result = await register({ data: { items: payload, customer } });
    return result.orderNumber as string;
  };
}
