import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const HomePage = lazy(() =>
  import("../pages/HomePage").then((m) => ({ default: m.HomePage })),
);

export const homeRoutes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
];

export default homeRoutes;
