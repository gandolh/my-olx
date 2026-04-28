import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const DashboardPage = lazy(() =>
  import("../pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);

const MyListingsPage = lazy(() =>
  import("../pages/MyListingsPage").then((m) => ({ default: m.MyListingsPage })),
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: "/cont",
    element: <DashboardPage />,
  },
  {
    path: "/cont/anunturi",
    element: <MyListingsPage />,
  },
];

export default dashboardRoutes;
