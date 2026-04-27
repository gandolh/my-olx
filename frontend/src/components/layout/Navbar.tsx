import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";
import { useLogoutMutation } from "@/modules/auth/hooks/useLogoutMutation";
import { useFavoriteIds } from "@/modules/favorites/hooks/useFavoriteIds";
import { useUnreadCount } from "@/modules/messaging/hooks/useUnreadCount";

export function Navbar() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const logoutMutation = useLogoutMutation();
  const favoriteIds = useFavoriteIds();
  const unreadCount = useUnreadCount(isAuthenticated);

  const handleLogout = () => {
    logoutMutation.mutate();
    setShowDropdown(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[var(--shadow-ambient)]">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
        <Link
          to="/"
          className="text-2xl font-black text-primary tracking-tight font-[Manrope] no-underline"
        >
          Piață<span className="text-secondary">Ro</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/categorii"
            className="text-on-surface-variant font-medium hover:text-primary transition-colors no-underline"
          >
            {t("nav.categories")}
          </Link>
          <Link
            to="/favorite"
            className="text-on-surface-variant font-medium hover:text-primary transition-colors no-underline"
          >
            {t("nav.favorites")}
            {isAuthenticated && (favoriteIds.data?.length ?? 0) > 0 && (
              <span className="ml-1 text-primary font-bold">
                ({favoriteIds.data?.length})
              </span>
            )}
          </Link>
          <Link
            to="/mesaje"
            className="text-on-surface-variant font-medium hover:text-primary transition-colors no-underline flex items-center gap-1"
          >
            {t("nav.messages")}
            {isAuthenticated && (unreadCount.data ?? 0) > 0 && (
              <span className="bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount.data}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex gap-2">
                <button
                  className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
                  aria-label="Notificări"
                >
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors flex items-center gap-2"
                    aria-label="Profil"
                  >
                    <span className="material-symbols-outlined">person</span>
                    {user?.email && (
                      <span className="hidden md:inline text-sm font-medium text-on-surface">
                        {user.display_name || user.email.split("@")[0]}
                      </span>
                    )}
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-lg py-2 z-50">
                      <Link
                        to="/contul-meu"
                        className="block px-4 py-2 text-on-surface hover:bg-surface-container transition-colors no-underline"
                        onClick={() => setShowDropdown(false)}
                      >
                        Contul meu
                      </Link>
                      <Link
                        to="/anunturile-mele"
                        className="block px-4 py-2 text-on-surface hover:bg-surface-container transition-colors no-underline"
                        onClick={() => setShowDropdown(false)}
                      >
                        Anunțurile mele
                      </Link>
                      {!user?.email_verified && (
                        <div className="px-4 py-2 text-xs text-on-error-container bg-error-container mx-2 my-1 rounded">
                          Email neverificat
                        </div>
                      )}
                      <hr className="my-2 border-outline-variant" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-error hover:bg-surface-container transition-colors"
                      >
                        Deconectare
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <Link
                to="/adauga-anunt"
                className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-150 shadow-lg no-underline"
              >
                {t("nav.addListing")}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/autentificare"
                className="text-on-surface-variant font-medium hover:text-primary transition-colors no-underline"
              >
                Conectare
              </Link>
              <Link
                to="/inregistrare"
                className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-150 shadow-lg no-underline"
              >
                Înregistrare
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
