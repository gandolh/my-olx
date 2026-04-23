# Category Browsing & Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/categorii/:slug` page — a category listings page with URL-driven filters, sidebar, sort/view controls, pagination, and React Query fetching against simulated async mock data.

**Architecture:** Filter state lives entirely in URL search params (`useSearchParams`). Every filter/sort/page change triggers a React Query refetch of `fetchMockListings` which applies all filters server-side and resolves after a 500ms delay. The `ListingCard` component from the home module is reused without modification.

**Tech Stack:** React 19, React Router DOM v7 (`useSearchParams`, `useParams`), TanStack React Query v5, TypeScript, Tailwind CSS v4 with Carpathian Clear CSS variables.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/modules/categories/types/index.ts` | `MockListing`, `FilterState`, `ListingsResponse`, `CITIES` |
| Create | `src/modules/categories/data/mockListings.ts` | 20 mock listings + `fetchMockListings` function |
| Create | `src/modules/categories/hooks/useCategoryListings.ts` | React Query hook wrapping `fetchMockListings` |
| Create | `src/modules/categories/components/FilterSidebar.tsx` | Sidebar with all filter controls |
| Create | `src/modules/categories/components/CategoryHeader.tsx` | Category title + result count |
| Create | `src/modules/categories/components/SortBar.tsx` | Grid/list toggle + sort dropdown |
| Create | `src/modules/categories/components/ListingGrid.tsx` | Listing grid/list with skeletons |
| Create | `src/modules/categories/components/Pagination.tsx` | Page navigation |
| Create | `src/modules/categories/pages/CategoryPage.tsx` | Page root — reads slug + search params |
| Modify | `src/routes/index.tsx` | Add `/categorii/:slug` route |

---

## Task 1: Types and constants

**Files:**
- Create: `src/modules/categories/types/index.ts`

- [ ] **Step 1: Create the types file**

```typescript
// src/modules/categories/types/index.ts

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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit
```
Expected: no errors related to this file.

---

## Task 2: Mock data and fetch function

**Files:**
- Create: `src/modules/categories/data/mockListings.ts`

- [ ] **Step 1: Create mock listings and fetch function**

```typescript
// src/modules/categories/data/mockListings.ts
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

      let results = MOCK_LISTINGS.filter((l) => {
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
        // 'noi' and 'relevanta' both sort by newest
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit
```
Expected: no errors.

---

## Task 3: React Query hook

**Files:**
- Create: `src/modules/categories/hooks/useCategoryListings.ts`

- [ ] **Step 1: Create the hook**

```typescript
// src/modules/categories/hooks/useCategoryListings.ts
import { useQuery } from '@tanstack/react-query'
import { fetchMockListings } from '../data/mockListings'
import type { FilterState } from '../types'

export function useCategoryListings(slug: string, filters: FilterState) {
  return useQuery({
    queryKey: ['listings', slug, filters],
    queryFn: () => fetchMockListings(slug, filters),
  })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit
```
Expected: no errors.

---

## Task 4: FilterSidebar component

**Files:**
- Create: `src/modules/categories/components/FilterSidebar.tsx`

- [ ] **Step 1: Create FilterSidebar**

```typescript
// src/modules/categories/components/FilterSidebar.tsx
import type { FilterState } from '../types'
import { CITIES } from '../types'

interface FilterSidebarProps {
  filters: FilterState
  onChange: (key: keyof FilterState, value: FilterState[keyof FilterState]) => void
  onReset: () => void
}

export function FilterSidebar({ filters, onChange, onReset }: FilterSidebarProps) {
  return (
    <aside className="w-72 flex-shrink-0 hidden md:block">
      <div className="sticky top-28 space-y-10">

        {/* Locație */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-outline">Locație</h3>
          <div className="relative">
            <select
              value={filters.loc ?? ''}
              onChange={(e) => onChange('loc', e.target.value || null)}
              className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm font-medium appearance-none focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="">Toată România</option>
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: '20px' }}>expand_more</span>
          </div>
        </div>

        {/* Preț */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-outline">Preț (RON)</h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.pret_min ?? ''}
              onChange={(e) => onChange('pret_min', e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-surface-container-low border-none rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.pret_max ?? ''}
              onChange={(e) => onChange('pret_max', e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-surface-container-low border-none rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          {/* decorative range bar */}
          <div className="h-1.5 bg-surface-container-highest rounded-full relative">
            <div className="absolute left-1/4 right-1/4 top-0 h-full bg-primary rounded-full" />
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md" />
            <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md" />
          </div>
        </div>

        {/* Data publicării */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-outline">Data Publicării</h3>
          <div className="space-y-2">
            {([
              { value: '24h', label: 'Ultimele 24 ore' },
              { value: 'saptamana', label: 'Ultima săptămână' },
              { value: 'oricand', label: 'Oricând' },
            ] as const).map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="data"
                  checked={filters.data === value}
                  onChange={() => onChange('data', value)}
                  className="w-4 h-4 text-primary focus:ring-0 border-outline-variant"
                />
                <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Vânzători verificați */}
        <div className="pt-6 border-t border-surface-container-high">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-bold text-on-surface">Vânzători Verificați</span>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={filters.verificat}
                onChange={(e) => onChange('verificat', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-tertiary-container peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
            </div>
          </label>
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          className="w-full py-3 bg-secondary-container text-on-secondary-container rounded-full font-bold text-sm tracking-wide hover:opacity-90 active:scale-95 transition-all"
        >
          Resetează Filtre
        </button>

      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit
```
Expected: no errors.

---

## Task 5: CategoryHeader component

**Files:**
- Create: `src/modules/categories/components/CategoryHeader.tsx`

- [ ] **Step 1: Create CategoryHeader**

```typescript
// src/modules/categories/components/CategoryHeader.tsx
import { Skeleton } from '@/components/ui/Skeleton'
import { CATEGORY_LABELS } from '../types'

interface CategoryHeaderProps {
  slug: string
  totalCount: number | undefined
  isLoading: boolean
}

export function CategoryHeader({ slug, totalCount, isLoading }: CategoryHeaderProps) {
  const label = CATEGORY_LABELS[slug] ?? slug

  return (
    <div>
      <h1 className="text-3xl font-black text-on-surface tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
        {label}
      </h1>
      {isLoading ? (
        <Skeleton className="h-4 w-48 mt-1" />
      ) : (
        <p className="text-outline font-medium mt-1">
          {totalCount ?? 0} de anunțuri găsite
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit
```
Expected: no errors.

---

## Task 6: SortBar component

**Files:**
- Create: `src/modules/categories/components/SortBar.tsx`

- [ ] **Step 1: Create SortBar**

```typescript
// src/modules/categories/components/SortBar.tsx
import type { FilterState } from '../types'

type ViewMode = 'grid' | 'list'

interface SortBarProps {
  sortare: FilterState['sortare']
  viewMode: ViewMode
  onSortChange: (value: FilterState['sortare']) => void
  onViewModeChange: (mode: ViewMode) => void
}

export function SortBar({ sortare, viewMode, onSortChange, onViewModeChange }: SortBarProps) {
  return (
    <div className="flex items-center gap-4 w-full md:w-auto">
      {/* Grid / List toggle */}
      <div className="flex bg-surface-container-low p-1 rounded-xl">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-surface-container-lowest shadow-sm' : 'hover:bg-surface-container-high'}`}
          aria-label="Vedere grilă"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px', color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-outline)' }}
          >
            grid_view
          </span>
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-surface-container-lowest shadow-sm' : 'hover:bg-surface-container-high'}`}
          aria-label="Vedere listă"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px', color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-outline)' }}
          >
            view_list
          </span>
        </button>
      </div>

      {/* Sort dropdown */}
      <div className="relative flex-grow md:flex-grow-0">
        <select
          value={sortare}
          onChange={(e) => onSortChange(e.target.value as FilterState['sortare'])}
          className="w-full bg-surface-container-low border-none rounded-xl py-2.5 pl-4 pr-10 text-sm font-bold appearance-none focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          <option value="noi">Cele mai noi</option>
          <option value="pret_asc">Preț: Mic la Mare</option>
          <option value="pret_desc">Preț: Mare la Mic</option>
          <option value="relevanta">Relevanță</option>
        </select>
        <span className="material-symbols-outlined absolute right-3 top-2 text-outline pointer-events-none" style={{ fontSize: '20px' }}>swap_vert</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit
```
Expected: no errors.

---

## Task 7: ListingGrid component

**Files:**
- Create: `src/modules/categories/components/ListingGrid.tsx`

The existing `ListingCard` expects a `HomeListing` shape: `{ id: number, price: string, title, location, time, verified, image }`. We adapt `MockListing` to it here.

- [ ] **Step 1: Create ListingGrid**

```typescript
// src/modules/categories/components/ListingGrid.tsx
import { CardSkeleton } from '@/components/ui/Skeleton'
import { ListingCard } from '@/modules/home/components/ListingCard'
import type { HomeListing } from '@/modules/home/types'
import type { MockListing } from '../types'

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffH = Math.floor(diffMs / 3_600_000)
  if (diffH < 1) return 'Acum câteva minute'
  if (diffH < 24) return `Acum ${diffH} ${diffH === 1 ? 'oră' : 'ore'}`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'Ieri'
  return `Acum ${diffD} zile`
}

function toHomeListing(l: MockListing): HomeListing {
  return {
    id: parseInt(l.id, 10),
    price: l.price !== null ? `${l.price.toLocaleString('ro-RO')} RON` : 'Gratuit',
    title: l.title,
    location: l.location,
    time: formatRelativeTime(l.postedAt),
    verified: l.verified,
    image: l.image,
  }
}

interface ListingGridProps {
  listings: MockListing[]
  isLoading: boolean
  viewMode: 'grid' | 'list'
  onReset: () => void
}

export function ListingGrid({ listings, isLoading, viewMode, onReset }: ListingGridProps) {
  if (isLoading) {
    return (
      <div className={viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
        : 'flex flex-col gap-6'
      }>
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>search_off</span>
        <p className="text-lg font-bold text-on-surface">Niciun anunț găsit</p>
        <p className="text-on-surface-variant text-sm">Încearcă să modifici filtrele pentru mai multe rezultate.</p>
        <button
          onClick={onReset}
          className="mt-2 px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
        >
          Resetează Filtrele
        </button>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {listings.map((l) => (
          <div key={l.id} className="flex gap-4 bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer">
            <img src={l.image} alt={l.title} className="w-40 h-32 object-cover flex-shrink-0" />
            <div className="p-4 flex flex-col justify-center gap-1">
              <span className="text-xl font-black text-primary">
                {l.price !== null ? `${l.price.toLocaleString('ro-RO')} RON` : 'Gratuit'}
              </span>
              <h3 className="font-bold text-on-surface">{l.title}</h3>
              <p className="text-xs text-outline uppercase tracking-wider font-medium">
                {l.location} • {formatRelativeTime(l.postedAt)}
              </p>
              {l.verified && (
                <span className="text-xs font-bold text-on-tertiary bg-tertiary-container px-2 py-0.5 rounded-full self-start">
                  Verificat
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={toHomeListing(l)} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit
```
Expected: no errors.

---

## Task 8: Pagination component

**Files:**
- Create: `src/modules/categories/components/Pagination.tsx`

- [ ] **Step 1: Create Pagination**

```typescript
// src/modules/categories/components/Pagination.tsx

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="mt-16 flex justify-center items-center gap-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-12 h-12 flex items-center justify-center rounded-full border border-surface-container-highest text-outline hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Pagina anterioară"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
      </button>

      <div className="flex items-center gap-2">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="text-outline px-2">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-12 h-12 rounded-full font-bold transition-colors ${
                p === currentPage
                  ? 'bg-primary text-on-primary'
                  : 'hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-12 h-12 flex items-center justify-center rounded-full border border-surface-container-highest text-outline hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Pagina următoare"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit
```
Expected: no errors.

---

## Task 9: CategoryPage — the page root

**Files:**
- Create: `src/modules/categories/pages/CategoryPage.tsx`

This component owns all state: reads `:slug` from `useParams`, reads/writes filter state via `useSearchParams`, keeps `viewMode` in local state, calls `useCategoryListings`, and composes all child components.

- [ ] **Step 1: Create CategoryPage**

```typescript
// src/modules/categories/pages/CategoryPage.tsx
import { useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { useCategoryListings } from '../hooks/useCategoryListings'
import { FilterSidebar } from '../components/FilterSidebar'
import { CategoryHeader } from '../components/CategoryHeader'
import { SortBar } from '../components/SortBar'
import { ListingGrid } from '../components/ListingGrid'
import { Pagination } from '../components/Pagination'
import { CATEGORY_LABELS } from '../types'
import type { FilterState } from '../types'

function parseFilters(params: URLSearchParams): FilterState {
  return {
    loc: params.get('loc'),
    pret_min: params.get('pret_min') ? Number(params.get('pret_min')) : null,
    pret_max: params.get('pret_max') ? Number(params.get('pret_max')) : null,
    data: (params.get('data') as FilterState['data']) ?? 'oricand',
    verificat: params.get('verificat') === '1',
    sortare: (params.get('sortare') as FilterState['sortare']) ?? 'noi',
    pagina: params.get('pagina') ? Number(params.get('pagina')) : 1,
  }
}

export function CategoryPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filters = parseFilters(searchParams)

  const { data, isFetching, isError, refetch } = useCategoryListings(slug, filters)

  function setFilter(key: keyof FilterState, value: FilterState[keyof FilterState]) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === null || value === false || value === '' || value === 'oricand' || value === 'noi') {
        next.delete(key)
      } else {
        next.set(key, String(value === true ? '1' : value))
      }
      if (key !== 'pagina') next.delete('pagina')
      return next
    })
  }

  function resetFilters() {
    setSearchParams({})
  }

  function handlePageChange(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('pagina', String(page))
      return next
    })
  }

  if (!CATEGORY_LABELS[slug]) {
    return (
      <main className="mt-24 flex-grow max-w-screen-2xl mx-auto w-full px-8 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl font-black text-on-surface" style={{ fontFamily: 'var(--font-headline)' }}>
            Categorie inexistentă
          </p>
          <p className="text-on-surface-variant">Categoria <strong>{slug}</strong> nu a fost găsită.</p>
          <Link to="/" className="inline-block mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
            Înapoi la pagina principală
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mt-24 flex-grow max-w-screen-2xl mx-auto w-full px-8 pb-16 flex gap-8">
      <FilterSidebar filters={filters} onChange={setFilter} onReset={resetFilters} />

      <section className="flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <CategoryHeader slug={slug} totalCount={data?.totalCount} isLoading={isFetching} />
          <SortBar
            sortare={filters.sortare}
            viewMode={viewMode}
            onSortChange={(v) => setFilter('sortare', v)}
            onViewModeChange={setViewMode}
          />
        </div>

        {isError ? (
          <ErrorCard message="Nu am putut încărca anunțurile." onRetry={() => refetch()} />
        ) : (
          <>
            <ListingGrid
              listings={data?.listings ?? []}
              isLoading={isFetching}
              viewMode={viewMode}
              onReset={resetFilters}
            />
            <Pagination
              currentPage={filters.pagina}
              totalPages={data?.totalPages ?? 1}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit
```
Expected: no errors.

---

## Task 10: Wire up route

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Add lazy import and route**

Open `src/routes/index.tsx`. It currently looks like:

```typescript
import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ComingSoon } from '@/components/ui/ComingSoon'
import { HomePage } from '@/modules/home/pages/HomePage'
import { CardSkeleton } from '@/components/ui/Skeleton'
```

Add the lazy import after the existing imports and add the route:

```typescript
import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ComingSoon } from '@/components/ui/ComingSoon'
import { HomePage } from '@/modules/home/pages/HomePage'
import { CardSkeleton } from '@/components/ui/Skeleton'

const CategoryPage = lazy(() =>
  import('@/modules/categories/pages/CategoryPage').then((m) => ({ default: m.CategoryPage }))
)

function PageLoader() {
  return (
    <main className="pt-24 flex-1">
      <div className="max-w-screen-2xl mx-auto px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </main>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categorii/:slug" element={<CategoryPage />} />
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </Suspense>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit
```
Expected: no errors.

---

## Task 11: Smoke test in the browser

- [ ] **Step 1: Start infrastructure and dev server**

```bash
cd /home/gandolh/projects/my-olx/infrastructure/local && docker-compose up -d
cd /home/gandolh/projects/my-olx/frontend && npm run dev
```

- [ ] **Step 2: Test the golden path**

Open `http://localhost:5173/categorii/electronice`

Expected:
- Sidebar renders with all filter controls
- 500ms delay then listings appear in a 3-column grid
- Header shows "Electronice" and listing count
- Sort dropdown and grid/list toggle visible

- [ ] **Step 3: Test filters**

1. Select "București" from location dropdown — URL updates to `?loc=bucuresti`, listings reload with 500ms delay, count changes
2. Enter `1000` in Min price, `5000` in Max — URL updates, results filter
3. Toggle "Vânzători Verificați" — URL updates with `?verificat=1`
4. Change sort to "Preț: Mic la Mare" — URL updates with `?sortare=pret_asc`
5. Click "Resetează Filtre" — URL clears, all listings return

- [ ] **Step 4: Test edge cases**

1. Open `http://localhost:5173/categorii/categorie-inexistenta` — "Categorie inexistentă" message with link home
2. Apply filters that return 0 results (e.g. loc=bucuresti + pret_max=1 + verificat=1) — empty state with reset button
3. Switch to list view — cards render horizontally
4. Navigate back in browser after changing filters — previous filter state restores

- [ ] **Step 5: Test from homepage category links**

Verify that clicking a category on the homepage navigates to `/categorii/{slug}` and the page loads correctly. If the homepage category links don't use the right slug yet, that's out of scope — note it for later.

---

## Out of scope (do not implement)

- Real API integration
- `/categorii` index page (stays ComingSoon)
- Listing detail navigation (cards link nowhere for now)
- Persistent favorites
- i18n translation keys (Romanian strings hardcoded)
- Mobile sidebar (hidden on small screens by design — future work)
