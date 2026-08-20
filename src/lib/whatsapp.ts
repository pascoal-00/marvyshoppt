import { formatPrice, products } from "./products";
import type { CartItem } from "./store";

export const WHATSAPP_NUMBER = "244957280181";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function buildOrderMessage(items: CartItem[], subtotal: number) {
  const lines = items.map((item) => {
    const p = products.find((pr) => pr.id === item.productId);
    if (!p) return "";
    return [
      `• ${p.name}`,
      `Tamanho: ${item.size}`,
      `Quantidade: ${item.quantity}`,
      `Preço: ${formatPrice(p.price)}`,
    ].join("\n");
  });

  return [
    "Olá, M-Shop! Gostaria de fazer um pedido:",
    "",
    lines.join("\n\n"),
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
    "",
    "Gostaria de confirmar a disponibilidade, o valor final do envio para Portugal e as condições de pagamento.",
    "",
    "Obrigado.",
  ].join("\n");
}

export function orderUrl(items: CartItem[], subtotal: number) {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(buildOrderMessage(items, subtotal))}`;
}
