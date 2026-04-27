import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { HomePage } from "@/modules/home/pages/HomePage";
import { CardSkeleton } from "@/components/ui/Skeleton";

const CategoryPage = lazy(() =>
  import("@/modules/categories/pages/CategoryPage").then((m) => ({
    default: m.CategoryPage,
  })),
);

const CategoryIndexPage = lazy(() =>
  import("@/modules/categories/pages/CategoryIndexPage").then((m) => ({
    default: m.CategoryIndexPage,
  })),
);

const SearchResultsPage = lazy(() =>
  import("@/modules/search/pages/SearchResultsPage").then((m) => ({
    default: m.SearchResultsPage,
  })),
);

const ListingDetailPage = lazy(() =>
  import("@/modules/listings/pages/ListingDetailPage").then((m) => ({
    default: m.ListingDetailPage,
  })),
);

const CreateListingPage = lazy(() =>
  import("@/modules/create-listing/pages/CreateListingPage").then((m) => ({
    default: m.CreateListingPage,
  })),
);

const LoginPage = lazy(() =>
  import("@/modules/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);

const RegisterPage = lazy(() =>
  import("@/modules/auth/pages/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
);

const EmailVerifyPage = lazy(() =>
  import("@/modules/auth/pages/EmailVerifyPage").then((m) => ({
    default: m.EmailVerifyPage,
  })),
);

const ForgotPasswordPage = lazy(() =>
  import("@/modules/auth/pages/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);

const FavoritesPage = lazy(() =>
  import("@/modules/favorites/pages/FavoritesPage").then((m) => ({
    default: m.FavoritesPage,
  })),
);

const ConversationsPage = lazy(() =>
  import("@/modules/messaging/pages/ConversationsPage").then((m) => ({
    default: m.ConversationsPage,
  })),
);

const ConversationPage = lazy(() =>
  import("@/modules/messaging/pages/ConversationPage").then((m) => ({
    default: m.ConversationPage,
  })),
);

const ResetPasswordPage = lazy(() =>
  import("@/modules/auth/pages/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);

const SettingsPage = lazy(() =>
  import("@/modules/settings/pages/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);

const EditListingPage = lazy(() =>
  import("@/modules/listings/pages/EditListingPage").then((m) => ({
    default: m.EditListingPage,
  })),
);

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
        <Route path="/" element={<HomePage />} />
        <Route path="/categorii" element={<CategoryIndexPage />} />
        <Route path="/categorii/:slug" element={<CategoryPage />} />
        <Route path="/anunturi" element={<SearchResultsPage />} />
        <Route path="/anunturi/:id" element={<ListingDetailPage />} />
        <Route path="/anunturi/:id/editeaza" element={<EditListingPage />} />
        <Route path="/adauga-anunt" element={<CreateListingPage />} />
        <Route path="/adauga-anunt/:draftId" element={<CreateListingPage />} />
        <Route path="/autentificare" element={<LoginPage />} />
        <Route path="/inregistrare" element={<RegisterPage />} />
        <Route path="/verifica-email" element={<EmailVerifyPage />} />
        <Route path="/parola-uitata" element={<ForgotPasswordPage />} />
        <Route path="/reseteaza-parola" element={<ResetPasswordPage />} />
        <Route path="/cont/setari" element={<SettingsPage />} />
        <Route path="/favorite" element={<FavoritesPage />} />
        <Route path="/mesaje" element={<ConversationsPage />} />
        <Route path="/mesaje/:conversationId" element={<ConversationsPage />}>
          <Route index element={<ConversationPage />} />
        </Route>
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </Suspense>
  );
}
