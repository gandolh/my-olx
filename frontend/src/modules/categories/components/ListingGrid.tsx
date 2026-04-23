import { CardSkeleton } from '@/components/ui/Skeleton'
import { ListingCard } from '@/modules/home/components/ListingCard'
import type { HomeListing } from '@/modules/home/types'
import type { MockListing } from '../types'

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffH = Math.floor(diffMs / 3_600_000)
  if (diffH < 1) return 'Acum câteva minute'
  if (diffH < 24) return `Acum ${diffH} ${diffH === 1 ? 'oră' : 'ore'}`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'Ieri'
  return `Acum ${diffD} zile`
}

function toHomeListing(l: MockListing): HomeListing {
  return {
    id: parseInt(l.id, 10),
    price: l.price !== null ? `${l.price.toLocaleString('ro-RO')} RON` : 'Gratuit',
    title: l.title,
    location: l.location,
    time: formatRelativeTime(l.postedAt),
    verified: l.verified,
    image: l.image,
  }
}

interface ListingGridProps {
  listings: MockListing[]
  isLoading: boolean
  viewMode: 'grid' | 'list'
  onReset: () => void
}

export function ListingGrid({ listings, isLoading, viewMode, onReset }: ListingGridProps) {
  if (isLoading) {
    return (
      <div className={viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
        : 'flex flex-col gap-6'
      }>
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>search_off</span>
        <p className="text-lg font-bold text-on-surface">Niciun anunț găsit</p>
        <p className="text-on-surface-variant text-sm">Încearcă să modifici filtrele pentru mai multe rezultate.</p>
        <button
          onClick={onReset}
          className="mt-2 px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
        >
          Resetează Filtrele
        </button>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {listings.map((l) => (
          <div key={l.id} className="flex gap-4 bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer">
            <img src={l.image} alt={l.title} className="w-40 h-32 object-cover flex-shrink-0" />
            <div className="p-4 flex flex-col justify-center gap-1">
              <span className="text-xl font-black text-primary">
                {l.price !== null ? `${l.price.toLocaleString('ro-RO')} RON` : 'Gratuit'}
              </span>
              <h3 className="font-bold text-on-surface">{l.title}</h3>
              <p className="text-xs text-outline uppercase tracking-wider font-medium">
                {l.location} • {formatRelativeTime(l.postedAt)}
              </p>
              {l.verified && (
                <span className="text-xs font-bold text-white bg-tertiary-container px-2 py-0.5 rounded-full self-start">
                  Verificat
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={toHomeListing(l)} />
      ))}
    </div>
  )
}
