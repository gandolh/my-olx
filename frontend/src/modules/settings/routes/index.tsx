import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const SettingsPage = lazy(() =>
  import("../pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);

export const settingsRoutes: RouteObject[] = [
  {
    path: "/cont/setari",
    element: <SettingsPage />,
  },
];

export default settingsRoutes;
