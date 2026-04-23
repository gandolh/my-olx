import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { icon: 'devices', label: 'Electronice', slug: 'electronice' },
  { icon: 'directions_car', label: 'Auto, moto și ambarcațiuni', slug: 'auto' },
  { icon: 'home', label: 'Imobiliare', slug: 'imobiliare' },
  { icon: 'chair', label: 'Casă și grădină', slug: 'casa-gradina' },
  { icon: 'apparel', label: 'Modă și frumusețe', slug: 'moda' },
  { icon: 'work', label: 'Locuri de muncă', slug: 'joburi' },
  { icon: 'build', label: 'Servicii, afaceri', slug: 'servicii' },
  { icon: 'fitness_center', label: 'Sport și timp liber', slug: 'sport' },
  { icon: 'volunteer_activism', label: 'Oferite gratuit', slug: 'gratuit' },
];

const FEATURED_LISTINGS = [
  {
    id: 1,
    price: '4.200 RON',
    title: 'Laptop Gaming Performance Edition - Stare Impecabilă',
    location: 'BUCUREȘTI',
    time: 'ACUM 2 MINUTE',
    verified: false,
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80',
  },
  {
    id: 2,
    price: '89.500 RON',
    title: 'SUV Electric Premium 2022 - Primul Proprietar',
    location: 'CLUJ-NAPOCA',
    time: 'ACUM 15 MINUTE',
    verified: true,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80',
  },
  {
    id: 3,
    price: '3.400 RON / lună',
    title: 'Apartament 2 Camere - Design Scandinavian - Zona Centrală',
    location: 'IAȘI',
    time: 'AZI 09:30',
    verified: false,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
  },
  {
    id: 4,
    price: '1.250 RON',
    title: 'Ceas Smart Ultima Generație - Sigilat - Garanție',
    location: 'TIMIȘOARA',
    time: 'IERI 18:45',
    verified: false,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
  },
];

export function HomePage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (location) params.set('loc', location);
    navigate(`/anunturi?${params.toString()}`);
  };

  return (
    <main className="pt-24">
      {/* Hero */}
      <section className="px-8 py-16 md:py-24 bg-[#f2f3fe]">
        <div className="max-w-screen-xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#191b23]">
              Caută în toată <span className="text-[#0040a1]">România</span>
            </h1>
            <p className="text-lg text-[#424654] max-w-2xl mx-auto">
              Descoperă mii de anunțuri verificate, de la electronice de ultimă generație
              până la locuințe de vis și servicii profesionale.
            </p>
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-white p-2 rounded-full shadow-[0_20px_50px_rgba(0,64,161,0.08)] flex items-center gap-2"
          >
            <div className="flex-1 flex items-center px-6 gap-3">
              <span className="material-symbols-outlined text-[#737785]">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-lg py-3 placeholder:text-[#737785]"
                placeholder="Ce cauți astăzi?"
                type="text"
              />
            </div>
            <div className="hidden md:flex items-center px-4 border-l border-[#c3c6d6]/30 gap-2">
              <span className="material-symbols-outlined text-[#737785]">location_on</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent border-none outline-none text-lg py-3 w-40 placeholder:text-[#737785]"
                placeholder="Toată România"
                type="text"
              />
            </div>
            <button
              type="submit"
              className="bg-[#0040a1] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#0056d2] transition-colors"
            >
              Caută
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="px-8 py-20 max-w-screen-2xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Categorii Populare</h2>
          <button
            onClick={() => navigate('/categorii')}
            className="text-[#0040a1] font-bold hover:underline bg-transparent border-none cursor-pointer"
          >
            Vezi toate categoriile
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {CATEGORIES.map(({ icon, label, slug }) => (
            <button
              key={slug}
              onClick={() => navigate(`/categorii/${slug}`)}
              className="bg-white p-8 rounded-xl flex flex-col items-center justify-center text-center gap-4 hover:shadow-xl transition-all border border-transparent hover:border-[#0040a1]/10 group cursor-pointer"
            >
              <div className="w-16 h-16 bg-[#f2f3fe] rounded-full flex items-center justify-center text-[#0040a1] group-hover:bg-[#0040a1] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{icon}</span>
              </div>
              <span className="font-bold text-[#191b23] text-sm leading-tight">{label}</span>
            </button>
          ))}

          <button
            onClick={() => navigate('/categorii')}
            className="bg-[#f2f3fe] p-8 rounded-xl flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-[#c3c6d6] group cursor-pointer hover:border-[#0040a1]/30 transition-colors"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#737785] group-hover:text-[#0040a1] transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>grid_view</span>
            </div>
            <span className="font-bold text-[#191b23] text-sm">Toate categoriile</span>
          </button>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="px-8 py-20 bg-[#f2f3fe]">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Anunțuri Recomandate</h2>
              <p className="text-[#424654]">Cele mai noi oportunități selectate pentru tine</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURED_LISTINGS.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={() => navigate('/anunturi')}
              className="bg-white border border-[#c3c6d6] px-8 py-4 rounded-full font-bold hover:bg-[#faf8ff] transition-colors shadow-sm"
            >
              Încarcă mai multe anunțuri
            </button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-8 py-24 max-w-screen-xl mx-auto">
        <div className="bg-[#0056d2] rounded-[2rem] p-12 md:p-20 text-center space-y-8 overflow-hidden relative">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white">Vrei să vinzi ceva rapid?</h2>
            <p className="text-[#ccd8ff] text-lg max-w-xl mx-auto">
              Alătură-te celei mai active comunități din România. Postează primul tău anunț
              în mai puțin de 2 minute!
            </p>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/adauga-anunt')}
              className="bg-white text-[#0040a1] px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
            >
              Postează un Anunț Acum
            </button>
            <button className="text-white border border-white/30 px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
              Cum funcționează?
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

interface Listing {
  id: number;
  price: string;
  title: string;
  location: string;
  time: string;
  verified: boolean;
  image: string;
}

function ListingCard({ listing }: { listing: Listing }) {
  const [favorited, setFavorited] = useState(false);

  return (
    <div className="bg-white rounded-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer">
      <div className="relative h-64 overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setFavorited((f) => !f); }}
          className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '20px',
              color: favorited ? '#ba1a1a' : '#0040a1',
              fontVariationSettings: favorited ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : undefined,
            }}
          >
            favorite
          </span>
        </button>
        {listing.verified && (
          <span className="absolute bottom-4 left-4 bg-[#1c6d24] text-white text-xs font-bold px-3 py-1 rounded-full">
            VERIFICAT
          </span>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-[#0040a1]">{listing.price}</span>
          <h3 className="text-lg font-bold leading-tight text-[#191b23] group-hover:text-[#0040a1] transition-colors">
            {listing.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#737785] font-medium tracking-wide">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>location_on</span>
          <span>{listing.location} • {listing.time}</span>
        </div>
      </div>
    </div>
  );
}
