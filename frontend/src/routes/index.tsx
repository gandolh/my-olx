import { createElement } from "react";
import {
  Outlet,
  Router,
  createRoute,
  createRootRoute,
  type AnyRoute,
} from "@tanstack/react-router";
import type { ModuleRoute } from "@/routes/types";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ComingSoon } from "@/components/ui/ComingSoon";

import { homeRoutes } from "@/modules/home/routes";
import { categoryRoutes } from "@/modules/categories/routes";
import { searchRoutes } from "@/modules/search/routes";
import { listingsRoutes } from "@/modules/listings/routes";
import { createListingRoutes } from "@/modules/create-listing/routes";
import { authRoutes } from "@/modules/auth/routes";
import { favoritesRoutes } from "@/modules/favorites/routes";
import { dashboardRoutes } from "@/modules/dashboard/routes";
import { settingsRoutes } from "@/modules/settings/routes";
import { publicProfileRoutes } from "@/modules/public-profile/routes";
import { messagingRoutes } from "@/modules/messaging/routes";

const mainModuleRoutes: ModuleRoute[] = [
  ...homeRoutes,
  ...categoryRoutes,
  ...searchRoutes,
  ...listingsRoutes,
  ...createListingRoutes,
  ...dashboardRoutes,
  ...settingsRoutes,
  ...favoritesRoutes,
  ...publicProfileRoutes,
  ...messagingRoutes,
];

const fallbackRoute: ModuleRoute = {
  path: "*",
  component: ComingSoon,
};

function normalizePath(path: string, index?: boolean): string {
  if (index) return "";
  if (!path) return "/";
  if (path === "*" || path === "/") return path;

  const trimmed = path.replace(/^\/+/, "");

  const segments = trimmed
    .split("/")
    .map((segment) =>
      segment.startsWith(":") ? `$${segment.slice(1)}` : segment,
    );

  return segments.join("/") || "/";
}

function resolveComponent(component?: ModuleRoute["component"]) {
  if (!component) return undefined;
  return () => createElement(component);
}

function createRoutes(parent: AnyRoute, routes: ModuleRoute[]): AnyRoute[] {
  return routes.map((route) => {
    const { component, children, index, path, ...rest } = route;
    const tanstackRoute = createRoute({
      ...rest,
      getParentRoute: () => parent,
      path: normalizePath(path, index),
      component: resolveComponent(component),
    });

    if (children?.length) {
      tanstackRoute.addChildren(createRoutes(tanstackRoute, children));
    }

    return tanstackRoute;
  });
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_main",
  component: MainLayout,
});

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_auth",
  component: AuthLayout,
});

const routeTree = rootRoute.addChildren([
  mainLayoutRoute.addChildren(
    createRoutes(mainLayoutRoute, [...mainModuleRoutes, fallbackRoute]),
  ),
  authLayoutRoute.addChildren(createRoutes(authLayoutRoute, [...authRoutes])),
]);

export const router = new Router({
  routeTree,
});

export type AppRouter = typeof router;
