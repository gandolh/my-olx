interface AuthRequiredToastProps {
  message?: string;
  loginLabel?: string;
  next?: string;
}

export function AuthRequiredToast({
  message = "Trebuie să fii autentificat pentru a efectua această acțiune.",
  loginLabel = "Autentifică-te",
  next,
}: AuthRequiredToastProps) {
  const loginHref = next
    ? `/autentificare?next=${encodeURIComponent(next)}`
    : "/autentificare";

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-inverse-surface text-inverse-on-surface rounded-xl shadow-ambient min-w-0 max-w-xs">
      <span
        className="material-symbols-outlined text-xl shrink-0"
        aria-hidden="true"
      >
        lock
      </span>
      <span className="text-sm font-medium leading-snug flex-1">{message}</span>
      <a
        href={loginHref}
        className="text-sm font-semibold text-primary-container shrink-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container rounded"
      >
        {loginLabel}
      </a>
    </div>
  );
}
