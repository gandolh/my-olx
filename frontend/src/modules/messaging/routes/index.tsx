import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const ConversationsPage = lazy(() =>
  import("../pages/ConversationsPage").then((m) => ({ default: m.ConversationsPage })),
);

const ConversationPage = lazy(() =>
  import("../pages/ConversationPage").then((m) => ({ default: m.ConversationPage })),
);

export const messagingRoutes: RouteObject[] = [
  {
    path: "/mesaje",
    element: <ConversationsPage />,
  },
  {
    path: "/mesaje/:conversationId",
    element: <ConversationsPage />,
    children: [
      {
        index: true,
        element: <ConversationPage />,
      },
    ],
  },
];

export default messagingRoutes;
