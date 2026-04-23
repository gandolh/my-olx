import { useQuery } from '@tanstack/react-query'
import { fetchMockListings } from '../data/mockListings'
import type { FilterState } from '../types'

export function useCategoryListings(slug: string, filters: FilterState) {
  return useQuery({
    queryKey: ['listings', slug, filters],
    queryFn: () => fetchMockListings(slug, filters),
  })
}
