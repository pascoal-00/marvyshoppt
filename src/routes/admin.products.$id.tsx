import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminCategories, fetchAdminProducts } from "@/lib/admin-api";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/admin/products/$id")({
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: fetchAdminCategories });
  const products = useQuery({ queryKey: ["admin", "products"], queryFn: fetchAdminProducts });
  const product = products.data?.find((p) => p.id === id);

  return (
    <div>
      <p className="eyebrow text-muted-foreground">
        <Link to="/admin/products">Produtos</Link> / Editar
      </p>
      <h1 className="display mt-2 text-3xl">{product?.name ?? "Editar produto"}</h1>
      {products.isLoading || categories.isLoading ? (
        <div className="mt-8 h-64 animate-pulse bg-surface" />
      ) : !product ? (
        <p className="mt-8 border border-border py-16 text-center text-sm text-muted-foreground">
          Produto não encontrado.
        </p>
      ) : (
        <ProductForm product={product} categories={categories.data ?? []} />
      )}
    </div>
  );
}
