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

const ListingDetailPage = lazy(() =>
  import("@/modules/listings/pages/ListingDetailPage").then((m) => ({
    default: m.ListingDetailPage,
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

const ResetPasswordPage = lazy(() =>
  import("@/modules/auth/pages/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
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
        <Route path="/categorii/:slug" element={<CategoryPage />} />
        <Route path="/anunturi/:id" element={<ListingDetailPage />} />
        <Route path="/autentificare" element={<LoginPage />} />
        <Route path="/inregistrare" element={<RegisterPage />} />
        <Route path="/verifica-email" element={<EmailVerifyPage />} />
        <Route path="/parola-uitata" element={<ForgotPasswordPage />} />
        <Route path="/reseteaza-parola" element={<ResetPasswordPage />} />
        <Route path="/favorite" element={<FavoritesPage />} />
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </Suspense>
  );
}
