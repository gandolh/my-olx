import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useNavigate, Link } from "@/lib/router";
import { AuthCardShell } from "../components/AuthCardShell";
import { FormField } from "../components/FormField";
import { SubmitButton } from "../components/SubmitButton";
import { resetSchema, type ResetInput } from "../schemas";
import { useResetPasswordMutation } from "../hooks/useResetPasswordMutation";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
  });

  const resetMutation = useResetPasswordMutation();

  const onSubmit = (data: ResetInput) => {
    if (token) {
      resetMutation.mutate({ token, password: data.password });
    }
  };

  if (!token) {
    return (
      <AuthCardShell title="Link invalid">
        <div className="text-center">
          <p className="text-on-surface-variant mb-4">
            Link-ul de resetare este invalid sau lipsește.
          </p>
          <Link
            to="/parola-uitata"
            className="inline-block px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors"
          >
            Solicită un nou link
          </Link>
        </div>
      </AuthCardShell>
    );
  }

  if (resetMutation.isSuccess) {
    return (
      <AuthCardShell title="Parolă resetată!">
        <div className="text-center">
          <span
            className="material-symbols-outlined text-tertiary mb-4"
            style={{ fontSize: "48px" }}
          >
            check_circle
          </span>
          <p className="text-on-surface mb-2 font-medium">
            Parola ta a fost resetată cu succes!
          </p>
          <p className="text-on-surface-variant text-sm mb-6">
            Acum te poți autentifica cu noua parolă.
          </p>
          <button
            onClick={() => navigate("/autentificare")}
            className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors"
          >
            Autentifică-te
          </button>
        </div>
      </AuthCardShell>
    );
  }

  return (
    <AuthCardShell
      title="Setează o parolă nouă"
      description="Introdu noua ta parolă"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Parolă nouă"
          type="password"
          {...register("password")}
          error={errors.password?.message}
          autoComplete="new-password"
        />

        <FormField
          label="Confirmă parola nouă"
          type="password"
          {...register("passwordConfirm")}
          error={errors.passwordConfirm?.message}
          autoComplete="new-password"
        />

        {resetMutation.isError && (
          <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm">
            Link-ul a expirat sau a fost deja folosit. Te rugăm să soliciți un
            nou link de resetare.
          </div>
        )}

        <SubmitButton isLoading={resetMutation.isPending}>
          Resetează parola
        </SubmitButton>
      </form>
    </AuthCardShell>
  );
}
