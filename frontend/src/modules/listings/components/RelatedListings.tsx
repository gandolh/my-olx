import { ListingCard } from '@/modules/home/components/ListingCard'
import type { HomeListing } from '@/modules/home/types'
import type { RelatedListing } from '../types'

interface RelatedListingsProps {
  listings: RelatedListing[]
}

function toHomeListing(listing: RelatedListing, index: number): HomeListing {
  return {
    id: index + 1,
    title: listing.title,
    price: listing.price != null
      ? `${listing.price.toLocaleString('ro-RO')} RON`
      : 'Gratuit',
    location: listing.location,
    time: '',
    verified: false,
    image: listing.image,
  }
}

export function RelatedListings({ listings }: RelatedListingsProps) {
  if (listings.length === 0) return null

  return (
    <section className="mt-24">
      <h2
        className="text-3xl font-black mb-10 text-on-surface"
        style={{ fontFamily: 'var(--font-headline)' }}
      >
        Anunțuri Similare
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {listings.map((listing, i) => (
          <ListingCard key={listing.id} listing={toHomeListing(listing, i)} />
        ))}
      </div>
    </section>
  )
}
