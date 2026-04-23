import type { MockListing, FilterState, ListingsResponse } from '../types'
import { PAGE_SIZE } from '../types'

const now = new Date()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000)

export const MOCK_LISTINGS: MockListing[] = [
  { id: '1', categorySlug: 'electronice', title: 'iPhone 14 Pro 256GB', price: 4200, location: 'București', locationSlug: 'bucuresti', postedAt: hoursAgo(1), verified: true, image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&q=80' },
  { id: '2', categorySlug: 'electronice', title: 'MacBook Air M2', price: 6500, location: 'Cluj-Napoca', locationSlug: 'cluj-napoca', postedAt: hoursAgo(3), verified: false, image: 'https://images.unsplash.com/photo-1611186871525-d6debc14b791?w=600&q=80' },
  { id: '3', categorySlug: 'electronice', title: 'Sony WH-1000XM5', price: 1100, location: 'Timișoara', locationSlug: 'timisoara', postedAt: hoursAgo(10), verified: true, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80' },
  { id: '4', categorySlug: 'electronice', title: 'Monitor LG 27" 4K', price: 2300, location: 'Iași', locationSlug: 'iasi', postedAt: hoursAgo(36), verified: false, image: 'https://images.unsplash.com/photo-1527443224154-c4a573d5f5dc?w=600&q=80' },
  { id: '5', categorySlug: 'electronice', title: 'Tastatură Mecanică Keychron', price: 650, location: 'Brașov', locationSlug: 'brasov', postedAt: hoursAgo(50), verified: true, image: 'https://images.unsplash.com/photo-1561112078-7d24e04c3407?w=600&q=80' },
  { id: '6', categorySlug: 'mobila', title: 'Canapea Catifea Smarald', price: 2450, location: 'București', locationSlug: 'bucuresti', postedAt: hoursAgo(2), verified: true, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
  { id: '7', categorySlug: 'mobila', title: 'Fotoliu Vintage Piele', price: 890, location: 'Cluj-Napoca', locationSlug: 'cluj-napoca', postedAt: hoursAgo(8), verified: false, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80' },
  { id: '8', categorySlug: 'mobila', title: 'Masă Dining Stejar Masiv', price: 3200, location: 'Timișoara', locationSlug: 'timisoara', postedAt: hoursAgo(24), verified: true, image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80' },
  { id: '9', categorySlug: 'mobila', title: 'Bibliotecă Modulară Albă', price: 750, location: 'Constanța', locationSlug: 'constanta', postedAt: hoursAgo(72), verified: false, image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80' },
  { id: '10', categorySlug: 'auto', title: 'VW Golf 7 2018 Benzină', price: 18500, location: 'București', locationSlug: 'bucuresti', postedAt: hoursAgo(5), verified: true, image: 'https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=600&q=80' },
  { id: '11', categorySlug: 'auto', title: 'Dacia Logan MCV 2020', price: 11200, location: 'Iași', locationSlug: 'iasi', postedAt: hoursAgo(20), verified: false, image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80' },
  { id: '12', categorySlug: 'auto', title: 'Anvelope Iarnă 205/55 R16', price: 800, location: 'Brașov', locationSlug: 'brasov', postedAt: hoursAgo(48), verified: true, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { id: '13', categorySlug: 'sport', title: 'Bicicletă MTB 29 inch', price: 1850, location: 'Timișoara', locationSlug: 'timisoara', postedAt: hoursAgo(6), verified: true, image: 'https://images.unsplash.com/photo-1558980394-034764373a8d?w=600&q=80' },
  { id: '14', categorySlug: 'sport', title: 'Schiuri Atomic Redster', price: 1200, location: 'Brașov', locationSlug: 'brasov', postedAt: hoursAgo(30), verified: false, image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80' },
  { id: '15', categorySlug: 'sport', title: 'Cort Camping 4 Persoane', price: 450, location: 'Cluj-Napoca', locationSlug: 'cluj-napoca', postedAt: hoursAgo(96), verified: false, image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80' },
  { id: '16', categorySlug: 'carti', title: 'Colecție Cărți Design & Artă', price: 350, location: 'București', locationSlug: 'bucuresti', postedAt: hoursAgo(4), verified: false, image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80' },
  { id: '17', categorySlug: 'carti', title: 'Enciclopedie Universală', price: null, location: 'Iași', locationSlug: 'iasi', postedAt: hoursAgo(15), verified: false, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80' },
  { id: '18', categorySlug: 'haine', title: 'Geacă Piele Maro Vintage', price: 580, location: 'București', locationSlug: 'bucuresti', postedAt: hoursAgo(7), verified: true, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80' },
  { id: '19', categorySlug: 'haine', title: 'Pantofi Sport Nike Air Max', price: 320, location: 'Cluj-Napoca', locationSlug: 'cluj-napoca', postedAt: hoursAgo(22), verified: false, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
  { id: '20', categorySlug: 'imobiliare', title: 'Apartament 2 camere Floreasca', price: 142000, location: 'București', locationSlug: 'bucuresti', postedAt: hoursAgo(12), verified: true, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80' },
]

export function fetchMockListings(slug: string, filters: FilterState): Promise<ListingsResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const DAY_MS = 86_400_000
      const WEEK_MS = 7 * DAY_MS
      const now = Date.now()

      const results = MOCK_LISTINGS.filter((l) => {
        if (l.categorySlug !== slug) return false
        if (filters.loc && l.locationSlug !== filters.loc) return false
        if (filters.pret_min !== null && (l.price === null || l.price < filters.pret_min)) return false
        if (filters.pret_max !== null && (l.price === null || l.price > filters.pret_max)) return false
        if (filters.verificat && !l.verified) return false
        if (filters.data === '24h' && now - l.postedAt.getTime() > DAY_MS) return false
        if (filters.data === 'saptamana' && now - l.postedAt.getTime() > WEEK_MS) return false
        return true
      })

      if (filters.sortare === 'pret_asc') {
        results.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
      } else if (filters.sortare === 'pret_desc') {
        results.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
      } else {
        results.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
      }

      const totalCount = results.length
      const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
      const page = Math.max(1, Math.min(filters.pagina, totalPages))
      const start = (page - 1) * PAGE_SIZE
      const listings = results.slice(start, start + PAGE_SIZE)

      resolve({ listings, totalCount, totalPages })
    }, 500)
  })
}
