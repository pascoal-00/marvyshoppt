import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchOrders, type AdminOrder } from "@/lib/admin-api";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/admin/sales")({
  head: () => ({
    meta: [
      { title: "Vendas | M-Shop Admin" },
      { name: "description", content: "Faturação, pedidos, ticket médio e evolução de vendas da M-Shop." },
      { property: "og:title", content: "Vendas | M-Shop Admin" },
      { property: "og:description", content: "Faturação, pedidos, ticket médio e evolução de vendas da M-Shop." },
      { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SalesPage,
});

const RANGES = [
  { key: "7", label: "7 DIAS", days: 7 },
  { key: "30", label: "30 DIAS", days: 30 },
  { key: "90", label: "90 DIAS", days: 90 },
  { key: "365", label: "12 MESES", days: 365 },
  { key: "all", label: "SEMPRE", days: 0 },
] as const;

const GROUPS = [
  { key: "day", label: "POR DIA" },
  { key: "week", label: "POR SEMANA" },
  { key: "month", label: "POR MÊS" },
] as const;

type GroupKey = (typeof GROUPS)[number]["key"];

/** Separa "NOME (Cor)" em produto e cor. */
function splitVariant(productName: string) {
  const match = /^(.*)\s\(([^()]+)\)\s*$/.exec(productName);
  if (!match) return { product: productName.trim(), color: "—" };
  return { product: match[1]!.trim(), color: match[2]!.trim() };
}

function bucketKey(date: Date, group: GroupKey) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  if (group === "month") return `${y}-${m}`;
  if (group === "week") {
    const monday = new Date(date);
    const shift = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - shift);
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(
      monday.getDate(),
    ).padStart(2, "0")}`;
  }
  return `${y}-${m}-${String(date.getDate()).padStart(2, "0")}`;
}

function bucketLabel(key: string, group: GroupKey) {
  const parts = key.split("-");
  if (group === "month") return `${parts[1]}/${parts[0]!.slice(2)}`;
  return `${parts[2]}/${parts[1]}`;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-border p-5">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="display mt-3 text-3xl">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function RankList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { key: string; label: string; sub?: string; units: number; revenue: number }[];
  empty: string;
}) {
  const max = rows[0]?.revenue ?? 0;
  return (
    <section className="border border-border p-5">
      <h2 className="eyebrow">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {rows.map((row) => (
            <li key={row.key}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold">
                  {row.label}
                  {row.sub && <span className="ml-2 text-xs font-normal text-muted-foreground">{row.sub}</span>}
                </p>
                <p className="text-sm font-semibold">{formatPrice(row.revenue)}</p>
              </div>
              <div className="mt-2 h-1 w-full bg-muted">
                <div
                  className="h-1 bg-accent"
                  style={{ width: `${max > 0 ? Math.max(4, (row.revenue / max) * 100) : 0}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{row.units} unidade(s)</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SalesPage() {
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: fetchOrders });
  const [range, setRange] = useState<string>("30");
  const [group, setGroup] = useState<GroupKey>("day");
  const [paidOnly, setPaidOnly] = useState(false);

  const stats = useMemo(() => {
    const all: AdminOrder[] = orders.data ?? [];
    const days = RANGES.find((r) => r.key === range)?.days ?? 0;
    const since = days > 0 ? Date.now() - days * 86_400_000 : 0;

    const list = all.filter((o) => {
      if (o.status === "CANCELADO") return false;
      if (paidOnly && !["PAGAMENTO CONFIRMADO", "EM PREPARAÇÃO", "ENVIADO", "CONCLUÍDO"].includes(o.status))
        return false;
      return new Date(o.createdAt).getTime() >= since;
    });

    const revenue = list.reduce((sum, o) => sum + o.subtotal, 0);
    const units = list.reduce(
      (sum, o) => sum + o.items.reduce((acc, item) => acc + item.quantity, 0),
      0,
    );

    const buckets = new Map<string, { revenue: number; orders: number }>();
    for (const order of list) {
      const key = bucketKey(new Date(order.createdAt), group);
      const entry = buckets.get(key) ?? { revenue: 0, orders: 0 };
      entry.revenue += order.subtotal;
      entry.orders += 1;
      buckets.set(key, entry);
    }
    const series = [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => ({ key, label: bucketLabel(key, group), ...value }));

    const products = new Map<string, { units: number; revenue: number }>();
    const variants = new Map<string, { product: string; color: string; units: number; revenue: number }>();
    for (const order of list) {
      for (const item of order.items) {
        const { product, color } = splitVariant(item.productName);
        const value = item.unitPrice * item.quantity;
        const p = products.get(product) ?? { units: 0, revenue: 0 };
        p.units += item.quantity;
        p.revenue += value;
        products.set(product, p);

        const vKey = `${product}::${color}`;
        const v = variants.get(vKey) ?? { product, color, units: 0, revenue: 0 };
        v.units += item.quantity;
        v.revenue += value;
        variants.set(vKey, v);
      }
    }

    return {
      list,
      revenue,
      units,
      average: list.length > 0 ? revenue / list.length : 0,
      series,
      topProducts: [...products.entries()]
        .map(([label, value]) => ({ key: label, label, ...value }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8),
      topVariants: [...variants.entries()]
        .map(([key, value]) => ({
          key,
          label: value.product,
          sub: value.color,
          units: value.units,
          revenue: value.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8),
    };
  }, [orders.data, range, group, paidOnly]);

  return (
    <div>
      <h1 className="display text-3xl">Vendas</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Faturação, pedidos e ticket médio por período, produto e cor. Pedidos cancelados não entram nos totais.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`border px-3 py-2 text-[11px] font-semibold tracking-[0.14em] ${
                range === r.key ? "border-accent bg-accent text-background" : "border-border text-muted-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGroup(g.key)}
              className={`border px-3 py-2 text-[11px] font-semibold tracking-[0.14em] ${
                group === g.key ? "border-foreground text-foreground" : "border-border text-muted-foreground"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[11px] tracking-[0.14em] text-muted-foreground">
          <input type="checkbox" checked={paidOnly} onChange={(e) => setPaidOnly(e.target.checked)} />
          APENAS PAGOS
        </label>
      </div>

      {orders.isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-surface" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Faturação" value={formatPrice(stats.revenue)} />
            <Stat label="Pedidos" value={String(stats.list.length)} />
            <Stat label="Ticket médio" value={formatPrice(stats.average)} />
            <Stat label="Unidades vendidas" value={String(stats.units)} />
          </div>

          <section className="mt-10 border border-border p-5">
            <h2 className="eyebrow">Evolução da faturação</h2>
            {stats.series.length === 0 ? (
              <p className="mt-6 py-12 text-center text-sm text-muted-foreground">
                Sem pedidos no período selecionado.
              </p>
            ) : (
              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" width={56} />
                    <Tooltip
                      formatter={(value: number, name) =>
                        name === "revenue" ? [formatPrice(value), "Faturação"] : [String(value), "Pedidos"]
                      }
                    />
                    <Bar dataKey="revenue" fill="currentColor" className="text-accent" radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <RankList
              title="Produtos mais vendidos"
              rows={stats.topProducts}
              empty="Sem vendas no período."
            />
            <RankList
              title="Cores mais vendidas"
              rows={stats.topVariants}
              empty="Sem vendas no período."
            />
          </div>
        </>
      )}
    </div>
  );
}
