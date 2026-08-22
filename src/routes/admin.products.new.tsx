import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminCategories } from "@/lib/admin-api";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/admin/products/new")({
  component: NewProductPage,
});

function NewProductPage() {
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: fetchAdminCategories });

  return (
    <div>
      <p className="eyebrow text-muted-foreground">
        <Link to="/admin/products">Produtos</Link> / Novo
      </p>
      <h1 className="display mt-2 text-3xl">Novo produto</h1>
      {categories.isLoading ? (
        <div className="mt-8 h-64 animate-pulse bg-surface" />
      ) : (
        <ProductForm categories={categories.data ?? []} />
      )}
    </div>
  );
}
