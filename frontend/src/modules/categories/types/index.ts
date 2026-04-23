export interface MockListing {
  id: string
  categorySlug: string
  title: string
  price: number | null  // null = gratis
  location: string      // display name e.g. "București"
  locationSlug: string  // URL slug e.g. "bucuresti"
  postedAt: Date
  verified: boolean
  image: string
}

export interface FilterState {
  loc: string | null
  pret_min: number | null
  pret_max: number | null
  data: '24h' | 'saptamana' | 'oricand'
  verificat: boolean
  sortare: 'noi' | 'pret_asc' | 'pret_desc' | 'relevanta'
  pagina: number
}

export interface ListingsResponse {
  listings: MockListing[]
  totalCount: number
  totalPages: number
}

export const PAGE_SIZE = 12

export const CITIES: { slug: string; label: string }[] = [
  { slug: 'bucuresti', label: 'București' },
  { slug: 'cluj-napoca', label: 'Cluj-Napoca' },
  { slug: 'timisoara', label: 'Timișoara' },
  { slug: 'iasi', label: 'Iași' },
  { slug: 'brasov', label: 'Brașov' },
  { slug: 'constanta', label: 'Constanța' },
]

export const CATEGORY_LABELS: Record<string, string> = {
  electronice: 'Electronice',
  mobila: 'Mobilă',
  auto: 'Auto',
  haine: 'Haine',
  sport: 'Sport',
  carti: 'Cărți',
  gradina: 'Grădină',
  jocuri: 'Jocuri',
  imobiliare: 'Imobiliare',
}
