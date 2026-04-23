import { useQuery } from "@tanstack/react-query";
import { searchListings } from "../services/listings";
import type { FilterState } from "../types";

export function useCategoryListings(slug: string, filters: FilterState) {
  return useQuery({
    queryKey: ["listings", slug, filters],
    queryFn: () => searchListings({ category: slug, filters }),
  });
}
