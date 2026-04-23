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
