import { formatPrice, type Product, type StoreSettings } from "./catalog";
import type { CustomerInfo } from "./customer";
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
  customer?: CustomerInfo,
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

  const customerBlock = customer
    ? [
        "DADOS DO CLIENTE",
        `Nome: ${customer.name}`,
        `Telefone: ${customer.phone}`,
        `Email: ${customer.email}`,
        `Endereço: ${customer.addressLine}`,
        `Código postal: ${customer.postalCode} — ${customer.city}`,
        `País: ${customer.country}`,
        ...(customer.note ? [`Nota: ${customer.note}`] : []),
        "",
      ]
    : [];

  return [
    `Olá, ${settings.storeName}! Gostaria de fazer um pedido:`,
    ...(orderNumber ? [`Nº do pedido: ${orderNumber}`] : []),
    "",
    ...customerBlock,
    "PRODUTOS",
    lines.join("\n\n"),
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
    "",
    `Gostaria de confirmar a disponibilidade, o valor final do envio para a Europa (${settings.shippingFrom}) e as condições de pagamento.`,
    "",
    "Obrigado.",
  ].join("\n");
}

export function orderUrl(
  items: CartItem[],
  subtotal: number,
  products: Product[],
  settings: StoreSettings,
  orderNumber?: string,
  customer?: CustomerInfo,
) {
  return `${whatsappUrl(settings)}?text=${encodeURIComponent(
    buildOrderMessage(items, subtotal, products, settings, orderNumber, customer),
  )}`;
}
