import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
        <Link to="/" className="text-2xl font-black text-[#0040a1] tracking-tight font-[Manrope] no-underline">
          Piață<span className="text-[#006a6a]">Ro</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/categorii" className="text-slate-600 font-medium hover:text-[#0040a1] transition-colors no-underline">
            Categorii
          </Link>
          <Link to="/favorite" className="text-slate-600 font-medium hover:text-[#0040a1] transition-colors no-underline">
            Favorite
          </Link>
          <Link to="/mesaje" className="text-slate-600 font-medium hover:text-[#0040a1] transition-colors no-underline">
            Mesaje
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button className="p-2 text-slate-600 hover:bg-[#e7e7f2] rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-slate-600 hover:bg-[#e7e7f2] rounded-full transition-colors">
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
          <Link
            to="/adauga-anunt"
            className="bg-[#0040a1] text-white px-6 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-150 shadow-lg shadow-[#0040a1]/20 no-underline"
          >
            Adaugă Anunț
          </Link>
        </div>
      </div>
    </nav>
  );
}
