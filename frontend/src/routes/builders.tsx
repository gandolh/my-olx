import { createElement } from "react";
import type { RouteComponent, ModuleRoute } from "@/routes/types";
import { Route, RootRoute, Router } from "@tanstack/react-router";

function resolveComponent(component: RouteComponent | undefined) {
  if (!component) return undefined;
  return () => createElement(component);
}

export function buildRoute({ component, children, ...rest }: ModuleRoute) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = {
    ...rest,
    component: resolveComponent(component),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const route = new Route(config as any);

  if (children?.length) {
    const childRoutes = children.map((child) => buildRoute(child));
    route.addChildren(childRoutes);
  }

  return route;
}

export function buildRouter(routes: ModuleRoute[]) {
  const rootRoute = new RootRoute({ component: () => null });
  const tanstackRoutes = routes.map((route) => buildRoute(route));
  const router = new Router({
    routeTree: rootRoute.addChildren(tanstackRoutes),
  });
  return router;
}
