export interface SpecItem {
  icon: string
  label: string
  value: string
}

export interface SellerSummary {
  name: string
  avatarUrl: string
  verified: boolean
  memberSince: string
  activeListings: number
  rating: number
  reviewCount: number
}

export interface ListingDetail {
  id: string
  title: string
  price: number | null
  images: string[]
  location: string
  viewCount: number
  description: string
  features: { icon: string; label: string; value: string }[]
  specs: SpecItem[]
  seller: SellerSummary
  categorySlug: string
  categoryLabel: string
  postedAt: Date
}

export interface RelatedListing {
  id: string
  title: string
  price: number | null
  image: string
  location: string
}
