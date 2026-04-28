import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const CategoryIndexPage = lazy(() =>
  import("../pages/CategoryIndexPage").then((m) => ({ default: m.CategoryIndexPage })),
);

const CategoryPage = lazy(() =>
  import("../pages/CategoryPage").then((m) => ({ default: m.CategoryPage })),
);

export const categoryRoutes: RouteObject[] = [
  {
    path: "/categorii",
    element: <CategoryIndexPage />,
  },
  {
    path: "/categorii/:slug",
    element: <CategoryPage />,
  },
];

export default categoryRoutes;
