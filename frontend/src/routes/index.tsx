import type { ReactElement } from "react";
import { Suspense } from "react";
import { Routes, Route, type RouteObject } from "react-router-dom";
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

const moduleRoutes: RouteObject[] = [
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

const appRoutes: RouteObject[] = [
  ...moduleRoutes,
  {
    path: "*",
    element: <ComingSoon />,
  },
];

function renderRoute(route: RouteObject, key: string): ReactElement {
  if (route.index) {
    return <Route key={key} index element={route.element} />;
  }

  return (
    <Route
      key={key}
      path={route.path}
      element={route.element}
      caseSensitive={route.caseSensitive}
    >
      {route.children?.map((child, idx) =>
        renderRoute(child, `${key}-${child.path ?? `index-${idx}`}`),
      )}
    </Route>
  );
}

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

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {appRoutes.map((route, idx) =>
          renderRoute(route, `route-${idx}-${route.path ?? "index"}`),
        )}
      </Routes>
    </Suspense>
  );
}
