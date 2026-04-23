import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/axios'
import type { ListingCard } from '@/types/listing'
import { mapListingCard } from '@/modules/categories/services/listings'

interface ListingCardApi {
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
}

export function useFeaturedListings() {
  return useQuery({
    queryKey: ['featured-listings'],
    queryFn: async (): Promise<ListingCard[]> => {
      const response = await axiosInstance.get<ListingCardApi[]>('/listings/featured')
      return response.data.map(mapListingCard)
    },
    staleTime: 60_000,
  })
}
