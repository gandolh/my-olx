import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const ListingDetailPage = lazy(() =>
  import("../pages/ListingDetailPage").then((m) => ({ default: m.ListingDetailPage })),
);

const EditListingPage = lazy(() =>
  import("../pages/EditListingPage").then((m) => ({ default: m.EditListingPage })),
);

export const listingsRoutes: RouteObject[] = [
  {
    path: "/anunturi/:id",
    element: <ListingDetailPage />,
  },
  {
    path: "/anunturi/:id/editeaza",
    element: <EditListingPage />,
  },
];

export default listingsRoutes;
