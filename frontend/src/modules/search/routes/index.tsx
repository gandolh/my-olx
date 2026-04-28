import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const SearchResultsPage = lazy(() =>
  import("../pages/SearchResultsPage").then((m) => ({ default: m.SearchResultsPage })),
);

export const searchRoutes: RouteObject[] = [
  {
    path: "/anunturi",
    element: <SearchResultsPage />,
  },
];

export default searchRoutes;
