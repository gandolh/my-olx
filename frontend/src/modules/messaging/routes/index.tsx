import { lazy } from "react";
import type { ModuleRoute } from "@/routes/types";

export const messagingRoutes: ModuleRoute[] = [
  {
    path: "/mesaje",
    component: lazy(() =>
      import("../pages/ConversationsPage").then((m) => ({
        default: m.ConversationsPage,
      })),
    ),
  },
  {
    path: "/mesaje/:conversationId",
    component: lazy(() =>
      import("../pages/ConversationPage").then((m) => ({
        default: m.ConversationPage,
      })),
    ),
  },
];
