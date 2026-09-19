import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchOrders, groupCustomers } from "@/lib/admin-api";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Clientes | M-Shop Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: fetchOrders });
  const [search, setSearch] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const customers = useMemo(() => {
    const all = groupCustomers(orders.data ?? []);
    const term = search.trim().toLowerCase();
    if (!term) return all;
    return all.filter((c) =>
      [c.name, c.phone, c.email, c.city, c.addressLine].join(" ").toLowerCase().includes(term),
    );
  }, [orders.data, search]);

  const total = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div>
      <p className="eyebrow text-muted-foreground">Admin / Clientes</p>
      <h1 className="display mt-2 text-3xl">Clientes</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Lista construída a partir dos pedidos: cada cliente aparece com contactos, endereço mais
        recente, histórico de encomendas e total acumulado.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="min-w-56 flex-1">
          <span className="eyebrow">Procurar cliente</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome, telefone, email, cidade ou endereço"
            className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <p className="pb-2 text-xs text-muted-foreground">
          {customers.length} cliente(s) · {formatPrice(total)} em pedidos
        </p>
      </div>

      {orders.isLoading ? (
        <div className="mt-8 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-surface" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <p className="mt-8 border border-border py-16 text-center text-sm text-muted-foreground">
          Ainda não há clientes com pedidos registados.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {customers.map((customer) => {
            const open = openKey === customer.key;
            return (
              <li key={customer.key} className="border border-border p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {customer.phone && (
                        <a
                          href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4"
                        >
                          {customer.phone}
                        </a>
                      )}
                      {customer.phone && customer.email ? " · " : ""}
                      {customer.email && (
                        <a href={`mailto:${customer.email}`} className="underline underline-offset-4">
                          {customer.email}
                        </a>
                      )}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {[customer.addressLine, [customer.postalCode, customer.city].filter(Boolean).join(" "), customer.country]
                        .filter(Boolean)
                        .join(", ") || "Sem endereço registado"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatPrice(customer.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.orders.length} pedido(s) · último em{" "}
                      {new Date(customer.lastOrderAt).toLocaleDateString("pt-PT")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpenKey(open ? null : customer.key)}
                      className="mt-3 border border-border px-3 py-2 text-[11px] font-semibold tracking-[0.14em]"
                    >
                      {open ? "FECHAR HISTÓRICO" : "VER HISTÓRICO"}
                    </button>
                  </div>
                </div>

                {open && (
                  <ul className="mt-5 space-y-3 border-t border-border pt-4">
                    {customer.orders.map((order) => (
                      <li key={order.id} className="bg-surface p-4 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="font-semibold">{order.orderNumber}</span>
                          <span className="text-xs uppercase tracking-[0.14em] text-accent">{order.status}</span>
                          <span>{formatPrice(order.subtotal, order.currency)}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString("pt-PT")}
                          </span>
                        </div>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {order.items.map((item) => (
                            <li key={item.id}>
                              {item.quantity}× {item.productName} — tamanho {item.size}
                            </li>
                          ))}
                        </ul>
                        {order.note && <p className="mt-2 text-xs text-muted-foreground">Nota: {order.note}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
