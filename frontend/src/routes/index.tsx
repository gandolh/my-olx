import { Suspense } from "react";
import {
  Outlet,
  Route,
  RootRoute,
  Router,
  type AnyRoute,
} from "@tanstack/react-router";
import type { ModuleRoute } from "@/routes/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { CardSkeleton } from "@/components/ui/Skeleton";

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

const moduleRoutes: ModuleRoute[] = [
  ...homeRoutes,
  ...categoryRoutes,
  ...searchRoutes,
  ...listingsRoutes,
  ...createListingRoutes,
  ...authRoutes,
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

function PageLoader() {
  return (
    <main className="pt-24 flex-1">
      <div className="max-w-screen-2xl mx-auto px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
      <Footer />
    </div>
  );
}

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

function createRoutes(parent: AnyRoute, routes: ModuleRoute[]): AnyRoute[] {
  return routes.map((route) => {
    const { component, children, index, path, ...rest } = route;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tanstackRoute = new Route({
      ...rest,
      getParentRoute: () => parent,
      path: normalizePath(path, index),
      component,
    } as any);

    if (children?.length) {
      tanstackRoute.addChildren(createRoutes(tanstackRoute, children));
    }

    return tanstackRoute;
  });
}

const rootRoute = new RootRoute({
  component: RootLayout,
});

const routeTree = rootRoute.addChildren(
  createRoutes(rootRoute, [...moduleRoutes, fallbackRoute]),
);

export const router = new Router({
  routeTree,
});

export type AppRouter = typeof router;
