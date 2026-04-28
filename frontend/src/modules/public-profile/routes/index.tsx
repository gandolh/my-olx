import { lazy } from "react";
import type { ModuleRoute } from "@/routes/types";

export const publicProfileRoutes: ModuleRoute[] = [
  {
    path: "/utilizator/:id",
    component: lazy(() => import("../pages/PublicProfilePage")),
  },
];
