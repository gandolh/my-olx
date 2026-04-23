import { axiosInstance } from '@/lib/axios'
import type { ListingCard, ListingDetail } from '@/types/listing'
import { mapListingCard } from '@/modules/categories/services/listings'

interface ListingImageApi {
  id: string
  url: string
  position: number
}

interface ListingSellerApi {
  id: string
  display_name: string | null
  avatar_url: string | null
  phone_verified: boolean
  member_since: string
  active_listings_count: number
}

interface ListingDetailApi {
  id: string
  title: string
  description: string
  price_ron: number | null
  is_negotiable: boolean
  category: string
  category_label: string
  city: string
  images: ListingImageApi[]
  view_count: number
  posted_at: string
  expires_at: string
  active: boolean
  seller: ListingSellerApi
}

export function mapListingDetail(detail: ListingDetailApi): ListingDetail {
  return {
    id: detail.id,
    title: detail.title,
    description: detail.description,
    priceRon: detail.price_ron,
    isNegotiable: detail.is_negotiable,
    category: detail.category,
    categoryLabel: detail.category_label,
    city: detail.city,
    images: detail.images,
    viewCount: detail.view_count,
    postedAt: detail.posted_at,
    expiresAt: detail.expires_at,
    active: detail.active,
    seller: {
      id: detail.seller.id,
      displayName: detail.seller.display_name,
      avatarUrl: detail.seller.avatar_url,
      phoneVerified: detail.seller.phone_verified,
      memberSince: detail.seller.member_since,
      activeListingsCount: detail.seller.active_listings_count,
    },
  }
}

export async function fetchListingDetail(id: string): Promise<ListingDetail> {
  const response = await axiosInstance.get<ListingDetailApi>(`/listings/${id}`)
  return mapListingDetail(response.data)
}

export async function fetchRelatedListings(id: string): Promise<ListingCard[]> {
  const response = await axiosInstance.get<Array<{
    id: string
    title: string
    price_ron: number | null
    city: string
    category: string
    cover_url: string | null
    seller_verified: boolean
    posted_at: string
    active: boolean
    expires_at: string
  }>>(`/listings/${id}/related`)

  return response.data.map(mapListingCard)
}
