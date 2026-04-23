import type { ListingCard, ListingDetail } from "@/types/listing";

export const MOCK_LISTING_DETAIL: ListingDetail = {
  id: "mock-listing",
  title: "Mock listing",
  description:
    "Acest fișier a rămas doar pentru compatibilitate în timpul migrării la API-ul real.",
  priceRon: null,
  isNegotiable: false,
  category: "electronice",
  categoryLabel: "Electronice",
  city: "București",
  images: [],
  viewCount: 0,
  postedAt: new Date().toISOString(),
  expiresAt: new Date().toISOString(),
  active: true,
  seller: {
    id: "mock-seller",
    displayName: "Vânzător mock",
    avatarUrl: null,
    phoneVerified: false,
    memberSince: new Date().toISOString(),
    activeListingsCount: 0,
  },
};

export const MOCK_RELATED_LISTINGS: ListingCard[] = [];

export function fetchMockListingDetail(_id: string): Promise<ListingDetail> {
  return Promise.resolve(MOCK_LISTING_DETAIL);
}
