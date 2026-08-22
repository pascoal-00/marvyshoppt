import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteProduct,
  duplicateProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  setProductActive,
} from "@/lib/admin-api";
import { formatPrice, type Product } from "@/lib/catalog";

export const Route = createFileRoute("/admin/products/")({
  component: ProductsPage,
});

function ProductsPage() {
  const queryClient = useQueryClient();
  const products = useQuery({ queryKey: ["admin", "products"], queryFn: fetchAdminProducts });
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: fetchAdminCategories });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [confirming, setConfirming] = useState<Product | null>(null);

  const refresh = () => queryClient.invalidateQueries();

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Produto eliminado.");
      setConfirming(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setProductActive(id, active),
    onSuccess: () => {
      toast.success("Estado atualizado.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const duplicate = useMutation({
    mutationFn: (product: Product) => duplicateProduct(product),
    onSuccess: () => {
      toast.success("Produto duplicado (inativo).");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const list = (products.data ?? []).filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase().trim());
    const matchCategory = category === "all" || p.category === category;
    const matchStatus = status === "all" || (status === "active" ? p.active : !p.active);
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted-foreground">Admin / Produtos</p>
          <h1 className="display mt-2 text-3xl">Produtos</h1>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-foreground px-5 py-3 text-[11px] font-semibold tracking-[0.16em] text-background"
        >
          + NOVO PRODUTO
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar produto"
          className="border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">Todas as categorias</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">Todos os estados</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>

      {products.isLoading ? (
        <div className="mt-8 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-surface" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="mt-8 border border-border py-16 text-center text-sm text-muted-foreground">
          Nenhum produto encontrado.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="py-3">Produto</th>
                <th className="py-3">Categoria</th>
                <th className="py-3">Preço</th>
                <th className="py-3">Tamanhos</th>
                <th className="py-3">Estado</th>
                <th className="py-3">Criado</th>
                <th className="py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((product) => (
                <tr key={product.id} className="border-b border-border align-middle">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 bg-surface">
                        {product.images[0] && (
                          <img src={product.images[0]} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">{product.category}</td>
                  <td className="py-3">{formatPrice(product.price, product.currency)}</td>
                  <td className="py-3 text-muted-foreground">{product.sizes.length || "—"}</td>
                  <td className="py-3">
                    <span className={product.active ? "text-foreground" : "text-muted-foreground"}>
                      {product.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(product.createdAt).toLocaleDateString("pt-PT")}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap justify-end gap-2 text-[10px] tracking-[0.12em]">
                      <Link
                        to="/admin/products/$id"
                        params={{ id: product.id }}
                        className="border border-border px-2 py-1"
                      >
                        EDITAR
                      </Link>
                      <button className="border border-border px-2 py-1" onClick={() => duplicate.mutate(product)}>
                        DUPLICAR
                      </button>
                      <button
                        className="border border-border px-2 py-1"
                        onClick={() => toggle.mutate({ id: product.id, active: !product.active })}
                      >
                        {product.active ? "DESATIVAR" : "ATIVAR"}
                      </button>
                      <button className="border border-accent px-2 py-1 text-accent" onClick={() => setConfirming(product)}>
                        ELIMINAR
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm bg-background p-6">
            <h2 className="display text-xl">Eliminar produto</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Vais eliminar “{confirming.name}”. Esta ação não pode ser revertida.
            </p>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 border border-border px-4 py-3 text-[11px] tracking-[0.16em]" onClick={() => setConfirming(null)}>
                CANCELAR
              </button>
              <button
                className="flex-1 bg-accent px-4 py-3 text-[11px] tracking-[0.16em] text-background"
                disabled={remove.isPending}
                onClick={() => remove.mutate(confirming.id)}
              >
                ELIMINAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
