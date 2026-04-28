import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const PublicProfilePage = lazy(() =>
  import("../pages/PublicProfilePage").then((m) => ({ default: m.default })),
);

export const publicProfileRoutes: RouteObject[] = [
  {
    path: "/utilizator/:id",
    element: <PublicProfilePage />,
  },
];

export default publicProfileRoutes;
