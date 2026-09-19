import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchOrders, updateOrderStatus, type AdminOrder } from "@/lib/admin-api";
import { ORDER_STATUSES, formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Pedidos | M-Shop Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: OrdersPage,
});

function fullAddress(order: AdminOrder) {
  return [order.addressLine, [order.postalCode, order.city].filter(Boolean).join(" "), order.country]
    .filter(Boolean)
    .join(", ");
}

function OrdersPage() {
  const queryClient = useQueryClient();
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: fetchOrders });
  const [status, setStatusFilter] = useState("TODOS");
  const [search, setSearch] = useState("");

  const setStatus = useMutation({
    mutationFn: ({ id, status: value }: { id: string; status: string }) => updateOrderStatus(id, value),
    onSuccess: () => {
      toast.success("Estado do pedido atualizado.");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const list = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (orders.data ?? []).filter((order) => {
      if (status !== "TODOS" && order.status !== status) return false;
      if (!term) return true;
      return [order.orderNumber, order.customerName, order.customerPhone, order.customerEmail, order.city]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [orders.data, status, search]);

  const revenue = list.reduce((sum, o) => sum + o.subtotal, 0);

  return (
    <div>
      <p className="eyebrow text-muted-foreground">Admin / Pedidos</p>
      <h1 className="display mt-2 text-3xl">Pedidos</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Cada pedido é registado com os dados e o endereço que o cliente preencheu antes de a mensagem
        seguir para o WhatsApp. Um pedido registado não significa pagamento efetuado.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="min-w-56 flex-1">
          <span className="eyebrow">Procurar</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nº do pedido, nome, telefone, email ou cidade"
            className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label>
          <span className="eyebrow">Estado</span>
          <select
            value={status}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-2 block border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="TODOS">Todos</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <p className="pb-2 text-xs text-muted-foreground">
          {list.length} pedido(s) · {formatPrice(revenue)}
        </p>
      </div>

      {orders.isLoading ? (
        <div className="mt-8 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-surface" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="mt-8 border border-border py-16 text-center text-sm text-muted-foreground">
          Nenhum pedido corresponde a esta pesquisa.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {list.map((order) => (
            <li key={order.id} className="border border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString("pt-PT")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatPrice(order.subtotal, order.currency)}</span>
                  <select
                    value={order.status}
                    onChange={(e) => setStatus.mutate({ id: order.id, status: e.target.value })}
                    className="border border-border bg-background px-2 py-2 text-xs"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-4 border-t border-border pt-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="eyebrow text-muted-foreground">Cliente</p>
                  <p className="mt-2 font-semibold">{order.customerName || order.contact || "—"}</p>
                  {order.customerPhone && (
                    <p className="text-muted-foreground">
                      <a href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                        {order.customerPhone}
                      </a>
                    </p>
                  )}
                  {order.customerEmail && (
                    <p className="text-muted-foreground">
                      <a href={`mailto:${order.customerEmail}`} className="underline underline-offset-4">
                        {order.customerEmail}
                      </a>
                    </p>
                  )}
                </div>
                <div>
                  <p className="eyebrow text-muted-foreground">Endereço de entrega</p>
                  <p className="mt-2 text-muted-foreground">{fullAddress(order) || "—"}</p>
                  {order.note && <p className="mt-2 text-muted-foreground">Nota: {order.note}</p>}
                </div>
              </div>

              <ul className="mt-4 space-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.productName} — tamanho {item.size} · {formatPrice(item.unitPrice)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
