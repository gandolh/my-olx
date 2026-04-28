import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const LoginPage = lazy(() =>
  import("../pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);

const RegisterPage = lazy(() =>
  import("../pages/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);

const EmailVerifyPage = lazy(() =>
  import("../pages/EmailVerifyPage").then((m) => ({ default: m.EmailVerifyPage })),
);

const ForgotPasswordPage = lazy(() =>
  import("../pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })),
);

const ResetPasswordPage = lazy(() =>
  import("../pages/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })),
);

export const authRoutes: RouteObject[] = [
  {
    path: "/autentificare",
    element: <LoginPage />,
  },
  {
    path: "/inregistrare",
    element: <RegisterPage />,
  },
  {
    path: "/verifica-email",
    element: <EmailVerifyPage />,
  },
  {
    path: "/parola-uitata",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reseteaza-parola",
    element: <ResetPasswordPage />,
  },
];

export default authRoutes;
