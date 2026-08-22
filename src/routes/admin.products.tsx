import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/products")({
  component: () => <ProductsLayout />,
});

function ProductsLayout() {
  useRouterState({ select: (s) => s.location.pathname });
  return <Outlet />;
}
