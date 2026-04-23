interface PricingCardProps {
  title: string
  price: number | null
  location: string
  viewCount: number
}

export function PricingCard({ title, price, location, viewCount }: PricingCardProps) {
  const formattedPrice = price != null
    ? `${price.toLocaleString('ro-RO')} RON`
    : 'Gratuit'

  return (
    <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.04)] space-y-8">
      <div className="hidden lg:block">
        <h1
          className="text-2xl font-extrabold tracking-tight text-on-surface mb-2"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          {title}
        </h1>
        <div className="text-4xl font-black text-primary">{formattedPrice}</div>
      </div>

      <div className="space-y-4">
        <button className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all">
          <span className="material-symbols-outlined">chat</span>
          Trimite Mesaj
        </button>
        <button className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all">
          <span className="material-symbols-outlined">call</span>
          Arată Numărul de Telefon
        </button>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-surface-container-high">
        <div className="flex items-center gap-2 text-outline text-sm">
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          {location}
        </div>
        <div className="flex items-center gap-2 text-outline text-sm">
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          {viewCount} vizualizări
        </div>
      </div>
    </div>
  )
}
