import { lazy } from "react";
import type { ModuleRoute } from "@/routes/types";

export const searchRoutes: ModuleRoute[] = [
  {
    path: "/anunturi",
    component: lazy(() =>
      import("../pages/SearchResultsPage").then((m) => ({
        default: m.SearchResultsPage,
      })),
    ),
  },
];
