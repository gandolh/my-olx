import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const CreateListingPage = lazy(() =>
  import("../pages/CreateListingPage").then((m) => ({ default: m.CreateListingPage })),
);

export const createListingRoutes: RouteObject[] = [
  {
    path: "/adauga-anunt",
    element: <CreateListingPage />,
  },
  {
    path: "/adauga-anunt/:draftId",
    element: <CreateListingPage />,
  },
];

export default createListingRoutes;
