import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Navbar() {
  const { t } = useTranslation()
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[var(--shadow-ambient)]">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
        <Link to="/" className="text-2xl font-black text-primary tracking-tight font-[Manrope] no-underline">
          Piață<span className="text-secondary">Ro</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/categorii" className="text-on-surface-variant font-medium hover:text-primary transition-colors no-underline">
            {t('nav.categories')}
          </Link>
          <Link to="/favorite" className="text-on-surface-variant font-medium hover:text-primary transition-colors no-underline">
            {t('nav.favorites')}
          </Link>
          <Link to="/mesaje" className="text-on-surface-variant font-medium hover:text-primary transition-colors no-underline">
            {t('nav.messages')}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
              aria-label="Notificări"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button
              className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
              aria-label="Profil"
            >
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
          <Link
            to="/adauga-anunt"
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-150 shadow-lg no-underline"
          >
            {t('nav.addListing')}
          </Link>
        </div>
      </div>
    </nav>
  )
}
