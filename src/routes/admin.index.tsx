import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminProducts, fetchOrders } from "@/lib/admin-api";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-5">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="display mt-3 text-3xl">{value}</p>
    </div>
  );
}

function Dashboard() {
  const products = useQuery({ queryKey: ["admin", "products"], queryFn: fetchAdminProducts });
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: fetchOrders });

  const total = products.data?.length ?? 0;
  const active = products.data?.filter((p) => p.active).length ?? 0;
  const orderCount = orders.data?.length ?? 0;
  const orderValue = orders.data?.reduce((sum, o) => sum + o.subtotal, 0) ?? 0;

  return (
    <div>
      <h1 className="display text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Visão geral da loja. Um pedido registado não significa pagamento confirmado.
      </p>

      {products.isLoading || orders.isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-surface" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Produtos" value={String(total)} />
          <Stat label="Ativos" value={String(active)} />
          <Stat label="Pedidos" value={String(orderCount)} />
          <Stat label="Valor dos pedidos" value={formatPrice(orderValue)} />
        </div>
      )}

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="eyebrow">Pedidos recentes</h2>
          <Link to="/admin/orders" className="text-[11px] tracking-[0.16em] underline underline-offset-4">
            VER TODOS
          </Link>
        </div>
        {(orders.data?.length ?? 0) === 0 ? (
          <p className="mt-6 border border-border py-12 text-center text-sm text-muted-foreground">
            Ainda não há pedidos registados.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {orders.data?.slice(0, 6).map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="text-sm font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString("pt-PT")} · {order.items.length} artigo(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] tracking-[0.14em] text-muted-foreground">{order.status}</span>
                  <span className="text-sm font-semibold">{formatPrice(order.subtotal)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
