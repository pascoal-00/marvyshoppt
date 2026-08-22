import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchOrders, updateOrderStatus } from "@/lib/admin-api";
import { ORDER_STATUSES, formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const queryClient = useQueryClient();
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: fetchOrders });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success("Estado do pedido atualizado.");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <p className="eyebrow text-muted-foreground">Admin / Pedidos</p>
      <h1 className="display mt-2 text-3xl">Pedidos</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Os pedidos são registados quando o cliente clica em “FAZER PEDIDO”. Isto não significa pagamento
        efetuado — confirma sempre por WhatsApp.
      </p>

      {orders.isLoading ? (
        <div className="mt-8 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-surface" />
          ))}
        </div>
      ) : (orders.data ?? []).length === 0 ? (
        <p className="mt-8 border border-border py-16 text-center text-sm text-muted-foreground">
          Ainda não há pedidos registados.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.data?.map((order) => (
            <li key={order.id} className="border border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString("pt-PT")}
                    {order.contact ? ` · ${order.contact}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatPrice(order.subtotal, order.currency)}</span>
                  <select
                    value={order.status}
                    onChange={(e) => setStatus.mutate({ id: order.id, status: e.target.value })}
                    className="border border-border bg-background px-2 py-2 text-xs"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
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
