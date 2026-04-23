import type { ListingCard } from "@/types/listing";
import type { FilterState, ListingsResponse } from "../types";
import { PAGE_SIZE } from "../types";

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000);

type MockListing = ListingCard & {
  locationSlug: string;
};

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: "1",
    category: "electronice",
    title: "iPhone 14 Pro 256GB",
    priceRon: 4200,
    city: "București",
    locationSlug: "bucuresti",
    postedAt: hoursAgo(1).toISOString(),
    sellerVerified: true,
    coverUrl:
      "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "2",
    category: "electronice",
    title: "MacBook Air M2",
    priceRon: 6500,
    city: "Cluj-Napoca",
    locationSlug: "cluj-napoca",
    postedAt: hoursAgo(3).toISOString(),
    sellerVerified: false,
    coverUrl:
      "https://images.unsplash.com/photo-1611186871525-d6debc14b791?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "3",
    category: "electronice",
    title: "Sony WH-1000XM5",
    priceRon: 1100,
    city: "Timișoara",
    locationSlug: "timisoara",
    postedAt: hoursAgo(10).toISOString(),
    sellerVerified: true,
    coverUrl:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "4",
    category: "electronice",
    title: 'Monitor LG 27" 4K',
    priceRon: 2300,
    city: "Iași",
    locationSlug: "iasi",
    postedAt: hoursAgo(36).toISOString(),
    sellerVerified: false,
    coverUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a573d5f5dc?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "5",
    category: "electronice",
    title: "Tastatură Mecanică Keychron",
    priceRon: 650,
    city: "Brașov",
    locationSlug: "brasov",
    postedAt: hoursAgo(50).toISOString(),
    sellerVerified: true,
    coverUrl:
      "https://images.unsplash.com/photo-1561112078-7d24e04c3407?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "6",
    category: "mobila",
    title: "Canapea Catifea Smarald",
    priceRon: 2450,
    city: "București",
    locationSlug: "bucuresti",
    postedAt: hoursAgo(2).toISOString(),
    sellerVerified: true,
    coverUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "7",
    category: "mobila",
    title: "Fotoliu Vintage Piele",
    priceRon: 890,
    city: "Cluj-Napoca",
    locationSlug: "cluj-napoca",
    postedAt: hoursAgo(8).toISOString(),
    sellerVerified: false,
    coverUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "8",
    category: "mobila",
    title: "Masă Dining Stejar Masiv",
    priceRon: 3200,
    city: "Timișoara",
    locationSlug: "timisoara",
    postedAt: hoursAgo(24).toISOString(),
    sellerVerified: true,
    coverUrl:
      "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "9",
    category: "mobila",
    title: "Bibliotecă Modulară Albă",
    priceRon: 750,
    city: "Constanța",
    locationSlug: "constanta",
    postedAt: hoursAgo(72).toISOString(),
    sellerVerified: false,
    coverUrl:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "10",
    category: "auto",
    title: "VW Golf 7 2018 Benzină",
    priceRon: 18500,
    city: "București",
    locationSlug: "bucuresti",
    postedAt: hoursAgo(5).toISOString(),
    sellerVerified: true,
    coverUrl:
      "https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "11",
    category: "auto",
    title: "Dacia Logan MCV 2020",
    priceRon: 11200,
    city: "Iași",
    locationSlug: "iasi",
    postedAt: hoursAgo(20).toISOString(),
    sellerVerified: false,
    coverUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "12",
    category: "auto",
    title: "Anvelope Iarnă 205/55 R16",
    priceRon: 800,
    city: "Brașov",
    locationSlug: "brasov",
    postedAt: hoursAgo(48).toISOString(),
    sellerVerified: true,
    coverUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "13",
    category: "sport",
    title: "Bicicletă MTB 29 inch",
    priceRon: 1850,
    city: "Timișoara",
    locationSlug: "timisoara",
    postedAt: hoursAgo(6).toISOString(),
    sellerVerified: true,
    coverUrl:
      "https://images.unsplash.com/photo-1558980394-034764373a8d?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "14",
    category: "sport",
    title: "Schiuri Atomic Redster",
    priceRon: 1200,
    city: "Brașov",
    locationSlug: "brasov",
    postedAt: hoursAgo(30).toISOString(),
    sellerVerified: false,
    coverUrl:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "15",
    category: "sport",
    title: "Cort Camping 4 Persoane",
    priceRon: 450,
    city: "Cluj-Napoca",
    locationSlug: "cluj-napoca",
    postedAt: hoursAgo(96).toISOString(),
    sellerVerified: false,
    coverUrl:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "16",
    category: "carti",
    title: "Colecție Cărți Design & Artă",
    priceRon: 350,
    city: "București",
    locationSlug: "bucuresti",
    postedAt: hoursAgo(4).toISOString(),
    sellerVerified: false,
    coverUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "17",
    category: "carti",
    title: "Enciclopedie Universală",
    priceRon: null,
    city: "Iași",
    locationSlug: "iasi",
    postedAt: hoursAgo(15).toISOString(),
    sellerVerified: false,
    coverUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "18",
    category: "haine",
    title: "Geacă Piele Maro Vintage",
    priceRon: 580,
    city: "București",
    locationSlug: "bucuresti",
    postedAt: hoursAgo(7).toISOString(),
    sellerVerified: true,
    coverUrl:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "19",
    category: "haine",
    title: "Pantofi Sport Nike Air Max",
    priceRon: 320,
    city: "Cluj-Napoca",
    locationSlug: "cluj-napoca",
    postedAt: hoursAgo(22).toISOString(),
    sellerVerified: false,
    coverUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
  {
    id: "20",
    category: "imobiliare",
    title: "Apartament 2 camere Floreasca",
    priceRon: 142000,
    city: "București",
    locationSlug: "bucuresti",
    postedAt: hoursAgo(12).toISOString(),
    sellerVerified: true,
    coverUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    active: true,
    expiresAt: new Date(now.getTime() + 20 * 86_400_000).toISOString(),
  },
];

export function fetchMockListings(
  slug: string,
  filters: FilterState,
): Promise<ListingsResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const DAY_MS = 86_400_000;
      const WEEK_MS = 7 * DAY_MS;
      const now = Date.now();

      const results = MOCK_LISTINGS.filter((l) => {
        if (l.category !== slug) return false;
        if (filters.loc && l.locationSlug !== filters.loc) return false;
        if (
          filters.pret_min !== null &&
          (l.priceRon === null || l.priceRon < filters.pret_min)
        )
          return false;
        if (
          filters.pret_max !== null &&
          (l.priceRon === null || l.priceRon > filters.pret_max)
        )
          return false;
        if (filters.verificat && !l.sellerVerified) return false;
        if (
          filters.data === "24h" &&
          now - new Date(l.postedAt).getTime() > DAY_MS
        )
          return false;
        if (
          filters.data === "saptamana" &&
          now - new Date(l.postedAt).getTime() > WEEK_MS
        )
          return false;
        return true;
      });

      if (filters.sortare === "pret_asc") {
        results.sort((a, b) => (a.priceRon ?? 0) - (b.priceRon ?? 0));
      } else if (filters.sortare === "pret_desc") {
        results.sort((a, b) => (b.priceRon ?? 0) - (a.priceRon ?? 0));
      } else {
        results.sort(
          (a, b) =>
            new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
        );
      }

      const totalCount = results.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
      const page = Math.max(1, Math.min(filters.pagina, totalPages));
      const start = (page - 1) * PAGE_SIZE;
      const listings = results.slice(start, start + PAGE_SIZE);

      resolve({ listings, totalCount, totalPages });
    }, 500);
  });
}
