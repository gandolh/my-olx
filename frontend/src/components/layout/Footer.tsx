import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-100 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 gap-8 max-w-screen-2xl mx-auto">
        <div className="space-y-4 text-center md:text-left">
          <div className="font-[Manrope] font-bold text-2xl text-slate-900">
            Piață<span className="text-[#006a6a]">Ro</span>
          </div>
          <p className="text-slate-500 font-[Inter] text-sm tracking-wide">
            © {new Date().getFullYear()} PiațăRo. Toate drepturile rezervate.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {[
            { label: 'Termeni și Condiții', to: '/termeni' },
            { label: 'Politică de Confidențialitate', to: '/confidentialitate' },
            { label: 'Ajutor', to: '/ajutor' },
            { label: 'Contact', to: '/contact' },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="text-slate-500 font-medium hover:text-[#0040a1] transition-colors no-underline"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          <button className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-[#0040a1] hover:text-[#0040a1] transition-all">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
          </button>
          <button className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-[#0040a1] hover:text-[#0040a1] transition-all">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
