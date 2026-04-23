import { useQuery } from '@tanstack/react-query'
import { fetchMockListingDetail } from '../data/mockListing'

export function useListingDetail(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchMockListingDetail(id),
  })
}
