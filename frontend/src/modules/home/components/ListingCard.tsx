import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { HomeListing } from '../types'

interface ListingCardProps {
  listing: HomeListing
}

export function ListingCard({ listing }: ListingCardProps) {
  const { t } = useTranslation()
  const [favorited, setFavorited] = useState(false)

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer">
      <div className="relative h-64 overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setFavorited((f) => !f) }}
          className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          aria-label={favorited ? 'Elimină de la favorite' : 'Adaugă la favorite'}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '20px',
              color: favorited ? 'var(--color-error)' : 'var(--color-primary)',
              fontVariationSettings: favorited ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : undefined,
            }}
          >
            favorite
          </span>
        </button>
        {listing.verified && (
          <span className="absolute bottom-4 left-4 bg-tertiary-container text-on-tertiary text-xs font-bold px-3 py-1 rounded-full">
            {t('listing.verified')}
          </span>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-primary">{listing.price}</span>
          <h3 className="text-lg font-bold leading-tight text-on-surface group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium tracking-wide">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>location_on</span>
          <span>{listing.location} • {listing.time}</span>
        </div>
      </div>
    </div>
  )
}
