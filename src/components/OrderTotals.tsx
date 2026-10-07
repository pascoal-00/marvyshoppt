import { calcShipping } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-context";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

/** Subtotal + frete estimado + total, calculado com as regras de envio do admin. */
export function OrderTotals() {
  const { items, subtotal } = useStore();
  const { settings } = useCatalog();
  const { t, price } = useI18n();
  const units = items.reduce((n, i) => n + i.quantity, 0);
  const shipping = calcShipping(settings, subtotal, units);
  const remaining = settings.freeShippingOver > 0 ? settings.freeShippingOver - subtotal : 0;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <span>{t("cart.subtotal")}</span>
        <span>{price(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>{t("cart.shipping")}</span>
        <span>{shipping === 0 ? "0,00 €" : price(shipping)}</span>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-2 text-base">
        <span className="eyebrow">Total</span>
        <span className="font-semibold">{price(subtotal + shipping)}</span>
      </div>
      {remaining > 0 && (
        <p className="text-xs text-accent">
          +{price(remaining)} → {t("cart.shipping")} 0,00 €
        </p>
      )}
    </div>
  );
}
