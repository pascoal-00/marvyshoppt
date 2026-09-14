import { formatPrice, type Product, type StoreSettings } from "./catalog";
import type { CartItem } from "./store";

export function whatsappUrl(settings: StoreSettings) {
  return `https://wa.me/${settings.whatsappNumber}`;
}

export function buildOrderMessage(
  items: CartItem[],
  subtotal: number,
  products: Product[],
  settings: StoreSettings,
  orderNumber?: string,
) {
  const lines = items.flatMap((item) => {
    const p = products.find((pr) => pr.id === item.productId);
    if (!p) return [];
    return [
      [
        `• ${p.name}`,
        `Tamanho: ${item.size}${item.color ? ` | Cor: ${item.color}` : ""}`,
        `Quantidade: ${item.quantity}`,
        `Preço: ${formatPrice(p.price, p.currency)}`,
      ].join("\n"),
    ];
  });

  return [
    `Olá, ${settings.storeName}! Gostaria de fazer um pedido:`,
    orderNumber ? `Nº do pedido: ${orderNumber}` : "",
    "",
    lines.join("\n\n"),
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
    "",
    `Gostaria de confirmar a disponibilidade, o valor final do envio para Portugal (${settings.shippingFrom}) e as condições de pagamento.`,
    "",
    "Obrigado.",
  ]
    .filter((line, index) => !(index === 1 && line === ""))
    .join("\n");
}

export function orderUrl(
  items: CartItem[],
  subtotal: number,
  products: Product[],
  settings: StoreSettings,
  orderNumber?: string,
) {
  return `${whatsappUrl(settings)}?text=${encodeURIComponent(
    buildOrderMessage(items, subtotal, products, settings, orderNumber),
  )}`;
}
