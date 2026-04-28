import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const FavoritesPage = lazy(() =>
  import("../pages/FavoritesPage").then((m) => ({ default: m.FavoritesPage })),
);

export const favoritesRoutes: RouteObject[] = [
  {
    path: "/favorite",
    element: <FavoritesPage />,
  },
];

export default favoritesRoutes;
