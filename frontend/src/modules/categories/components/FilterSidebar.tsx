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
