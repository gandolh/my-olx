# Shared UI Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 6 missing shared UI components (Tabs, ConfirmDialog, Dropdown/Menu, Tooltip, Pagination, Alert) using `@base-ui/react` as the headless primitive layer, wire them into existing callsites, and update docs.

**Architecture:** Each component lives in `frontend/src/components/ui/<ComponentName>/<ComponentName>.tsx`, exported from the barrel at `frontend/src/components/ui/index.ts`. Components follow the existing pattern: Tailwind CSS v4 design tokens from `index.css`, Material Symbols Outlined icons, `forwardRef` where appropriate, Romanian strings for aria labels. Existing callsites in `MyListingsPage` (manual Tabs, `window.confirm`) and `Navbar` (manual dropdown) are refactored to use the new components.

**Tech Stack:** React 19, TypeScript 6, Tailwind CSS v4, `@base-ui/react` 1.4.1, Material Symbols Outlined icons.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `frontend/src/components/ui/Tabs/Tabs.tsx` | Tabs root + List + Tab + Panel primitives |
| Create | `frontend/src/components/ui/ConfirmDialog/ConfirmDialog.tsx` | Accessible confirm dialog via AlertDialog |
| Create | `frontend/src/components/ui/Dropdown/Dropdown.tsx` | Menu trigger + items via base-ui Menu |
| Create | `frontend/src/components/ui/Tooltip/Tooltip.tsx` | Hover/focus tooltip via base-ui Tooltip |
| Create | `frontend/src/components/ui/Pagination/Pagination.tsx` | Page navigator (plain, no base-ui primitive) |
| Create | `frontend/src/components/ui/Alert/Alert.tsx` | Inline alert banner (plain styled div) |
| Modify | `frontend/src/components/ui/index.ts` | Add 6 new exports |
| Modify | `frontend/src/modules/dashboard/pages/MyListingsPage.tsx` | Replace manual tabs + window.confirm |
| Modify | `frontend/src/components/layout/Navbar.tsx` | Replace manual dropdown with Dropdown component |

---

## Task 1: Tabs component

**Files:**
- Create: `frontend/src/components/ui/Tabs/Tabs.tsx`
- Modify: `frontend/src/components/ui/index.ts`

- [ ] **Step 1: Check base-ui Tabs API**

Run:
```bash
cd /home/gandolh/projects/my-olx && curl -s https://base-ui.com/react/components/tabs.md | head -120
```

Expected: markdown docs showing `Tabs.Root`, `Tabs.List`, `Tabs.Tab`, `Tabs.Panel` API.

- [ ] **Step 2: Create the Tabs component**

Create `frontend/src/components/ui/Tabs/Tabs.tsx`:

```tsx
import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import type { ReactNode } from 'react'

interface TabItem {
  value: string
  label: string
  icon?: string
}

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  tabs: TabItem[]
  children: ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, tabs, children, className = '' }: TabsProps) {
  return (
    <BaseTabs.Root value={value} onValueChange={onValueChange} className={className}>
      <BaseTabs.List className="flex border-b border-outline-variant overflow-x-auto">
        {tabs.map((tab) => (
          <BaseTabs.Tab
            key={tab.value}
            value={tab.value}
            className={[
              'flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all relative min-w-max',
              'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
              'text-on-surface-variant hover:text-on-surface',
              'data-[selected]:text-primary',
            ].join(' ')}
          >
            {tab.icon && (
              <span className="material-symbols-outlined text-xl" aria-hidden="true">
                {tab.icon}
              </span>
            )}
            {tab.label}
            <span
              aria-hidden="true"
              className={[
                'absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-primary',
                'scale-x-0 transition-transform duration-200',
                'data-[selected]:scale-x-100',
              ].join(' ')}
            />
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
      {children}
    </BaseTabs.Root>
  )
}

interface TabPanelProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabPanel({ value, children, className = '' }: TabPanelProps) {
  return (
    <BaseTabs.Panel value={value} className={className}>
      {children}
    </BaseTabs.Panel>
  )
}
```

- [ ] **Step 3: Export from barrel**

In `frontend/src/components/ui/index.ts`, add at the end:

```ts
export { Tabs, TabPanel } from './Tabs'
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors for the new Tabs file (ignore pre-existing errors if any).

- [ ] **Step 5: Commit**

```bash
cd /home/gandolh/projects/my-olx
git add frontend/src/components/ui/Tabs/Tabs.tsx frontend/src/components/ui/index.ts
git commit -m "feat(ui): add Tabs component using @base-ui/react/tabs"
```

---

## Task 2: ConfirmDialog component

**Files:**
- Create: `frontend/src/components/ui/ConfirmDialog/ConfirmDialog.tsx`
- Modify: `frontend/src/components/ui/index.ts`

- [ ] **Step 1: Check base-ui AlertDialog API**

```bash
curl -s https://base-ui.com/react/components/alert-dialog.md | head -100
```

Expected: `AlertDialog.Root`, `AlertDialog.Trigger`, `AlertDialog.Portal`, `AlertDialog.Backdrop`, `AlertDialog.Popup`, `AlertDialog.Title`, `AlertDialog.Description`, `AlertDialog.Close`.

- [ ] **Step 2: Create the ConfirmDialog component**

Create `frontend/src/components/ui/ConfirmDialog/ConfirmDialog.tsx`:

```tsx
import { AlertDialog } from '@base-ui/react/alert-dialog'
import type { ReactNode } from 'react'
import { Button } from '../Button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmă',
  cancelLabel = 'Anulează',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-2xl shadow-ambient p-6 space-y-4">
          <AlertDialog.Title className="font-headline font-bold text-on-surface text-xl leading-tight">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-on-surface-variant text-sm leading-relaxed">
            {description}
          </AlertDialog.Description>
          <div className="flex gap-3 justify-end pt-2">
            <AlertDialog.Close render={<Button variant="ghost" size="sm" />} onClick={onClose}>
              {cancelLabel}
            </AlertDialog.Close>
            <Button variant={variant} size="sm" loading={loading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
```

- [ ] **Step 3: Export from barrel**

Add to `frontend/src/components/ui/index.ts`:

```ts
export { ConfirmDialog } from './ConfirmDialog'
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
cd /home/gandolh/projects/my-olx
git add frontend/src/components/ui/ConfirmDialog/ConfirmDialog.tsx frontend/src/components/ui/index.ts
git commit -m "feat(ui): add ConfirmDialog component using @base-ui/react/alert-dialog"
```

---

## Task 3: Dropdown/Menu component

**Files:**
- Create: `frontend/src/components/ui/Dropdown/Dropdown.tsx`
- Modify: `frontend/src/components/ui/index.ts`

- [ ] **Step 1: Check base-ui Menu API**

```bash
curl -s https://base-ui.com/react/components/menu.md | head -120
```

Expected: `Menu.Root`, `Menu.Trigger`, `Menu.Portal`, `Menu.Positioner`, `Menu.Popup`, `Menu.Item`, `Menu.Separator`.

- [ ] **Step 2: Create the Dropdown component**

Create `frontend/src/components/ui/Dropdown/Dropdown.tsx`:

```tsx
import { Menu } from '@base-ui/react/menu'
import type { ReactNode } from 'react'

export interface DropdownItem {
  key: string
  label: string
  icon?: string
  variant?: 'default' | 'danger'
  onClick?: () => void
  href?: string
  render?: (props: { children: ReactNode; className: string }) => ReactNode
}

interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  align?: 'start' | 'end'
}

export function Dropdown({ trigger, items, align = 'end' }: DropdownProps) {
  return (
    <Menu.Root>
      <Menu.Trigger render={<span />} asChild>
        {trigger}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align={align} sideOffset={8}>
          <Menu.Popup className="min-w-48 bg-surface-container-lowest rounded-xl shadow-ambient py-1.5 z-50 outline-none">
            {items.map((item, idx) => {
              if (item.key === '__separator__') {
                return <Menu.Separator key={idx} className="my-1 border-t border-outline-variant mx-2" />
              }
              const itemClass = [
                'flex items-center gap-2 w-full px-4 py-2 text-sm font-medium transition-colors',
                'outline-none focus-visible:bg-surface-container',
                'hover:bg-surface-container cursor-pointer',
                item.variant === 'danger'
                  ? 'text-error'
                  : 'text-on-surface',
              ].join(' ')

              return (
                <Menu.Item
                  key={item.key}
                  onClick={item.onClick}
                  className={itemClass}
                >
                  {item.icon && (
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </Menu.Item>
              )
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

export function DropdownSeparator(): DropdownItem {
  return { key: '__separator__', label: '' }
}
```

- [ ] **Step 3: Export from barrel**

Add to `frontend/src/components/ui/index.ts`:

```ts
export { Dropdown, DropdownSeparator } from './Dropdown'
export type { DropdownItem } from './Dropdown'
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
cd /home/gandolh/projects/my-olx
git add frontend/src/components/ui/Dropdown/Dropdown.tsx frontend/src/components/ui/index.ts
git commit -m "feat(ui): add Dropdown/Menu component using @base-ui/react/menu"
```

---

## Task 4: Tooltip component

**Files:**
- Create: `frontend/src/components/ui/Tooltip/Tooltip.tsx`
- Modify: `frontend/src/components/ui/index.ts`

- [ ] **Step 1: Check base-ui Tooltip API**

```bash
curl -s https://base-ui.com/react/components/tooltip.md | head -100
```

Expected: `Tooltip.Provider`, `Tooltip.Root`, `Tooltip.Trigger`, `Tooltip.Portal`, `Tooltip.Positioner`, `Tooltip.Popup`, `Tooltip.Arrow`.

- [ ] **Step 2: Create the Tooltip component**

Create `frontend/src/components/ui/Tooltip/Tooltip.tsx`:

```tsx
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import type { ReactNode } from 'react'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export function Tooltip({ content, children, side = 'top', delay = 300 }: TooltipProps) {
  return (
    <BaseTooltip.Provider delay={delay}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger render={<span className="inline-flex" />}>
          {children}
        </BaseTooltip.Trigger>
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner side={side} sideOffset={6}>
            <BaseTooltip.Popup className="bg-inverse-surface text-inverse-on-surface text-xs font-medium px-3 py-1.5 rounded-lg shadow-ambient max-w-xs z-50">
              {content}
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  )
}
```

- [ ] **Step 3: Export from barrel**

Add to `frontend/src/components/ui/index.ts`:

```ts
export { Tooltip } from './Tooltip'
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
cd /home/gandolh/projects/my-olx
git add frontend/src/components/ui/Tooltip/Tooltip.tsx frontend/src/components/ui/index.ts
git commit -m "feat(ui): add Tooltip component using @base-ui/react/tooltip"
```

---

## Task 5: Pagination component

**Files:**
- Create: `frontend/src/components/ui/Pagination/Pagination.tsx`
- Modify: `frontend/src/components/ui/index.ts`

- [ ] **Step 1: Create the Pagination component**

Create `frontend/src/components/ui/Pagination/Pagination.tsx`:

```tsx
interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageRange(page, totalPages)

  return (
    <nav
      role="navigation"
      aria-label="Paginare"
      className={['flex items-center justify-center gap-1', className].join(' ')}
    >
      <PaginationButton
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Pagina anterioară"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true">
          chevron_left
        </span>
      </PaginationButton>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-3 py-2 text-on-surface-variant text-sm select-none">
            …
          </span>
        ) : (
          <PaginationButton
            key={p}
            onClick={() => onPageChange(p as number)}
            active={p === page}
            aria-label={`Pagina ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </PaginationButton>
        )
      )}

      <PaginationButton
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Pagina următoare"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true">
          chevron_right
        </span>
      </PaginationButton>
    </nav>
  )
}

interface PaginationButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  'aria-label'?: string
  'aria-current'?: 'page' | undefined
}

function PaginationButton({ children, onClick, disabled, active, ...props }: PaginationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...props}
      className={[
        'min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-all duration-150',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'bg-primary text-on-primary'
          : 'text-on-surface-variant hover:bg-surface-container-high',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}
```

> Note: Add `import type { ReactNode } from 'react'` and replace `React.ReactNode` with `ReactNode` for consistency with the project.

Actually use this corrected version with explicit import:

```tsx
import type { ReactNode } from 'react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageRange(page, totalPages)

  return (
    <nav
      role="navigation"
      aria-label="Paginare"
      className={['flex items-center justify-center gap-1', className].join(' ')}
    >
      <PaginationButton
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Pagina anterioară"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true">
          chevron_left
        </span>
      </PaginationButton>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-3 py-2 text-on-surface-variant text-sm select-none">
            …
          </span>
        ) : (
          <PaginationButton
            key={p}
            onClick={() => onPageChange(p as number)}
            active={p === page}
            aria-label={`Pagina ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </PaginationButton>
        )
      )}

      <PaginationButton
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Pagina următoare"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true">
          chevron_right
        </span>
      </PaginationButton>
    </nav>
  )
}

interface PaginationButtonProps {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  'aria-label'?: string
  'aria-current'?: 'page' | undefined
}

function PaginationButton({ children, onClick, disabled, active, ...props }: PaginationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...props}
      className={[
        'min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-all duration-150',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'bg-primary text-on-primary'
          : 'text-on-surface-variant hover:bg-surface-container-high',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}
```

- [ ] **Step 2: Export from barrel**

Add to `frontend/src/components/ui/index.ts`:

```ts
export { Pagination } from './Pagination'
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
cd /home/gandolh/projects/my-olx
git add frontend/src/components/ui/Pagination/Pagination.tsx frontend/src/components/ui/index.ts
git commit -m "feat(ui): add Pagination component"
```

---

## Task 6: Alert component

**Files:**
- Create: `frontend/src/components/ui/Alert/Alert.tsx`
- Modify: `frontend/src/components/ui/index.ts`

- [ ] **Step 1: Create the Alert component**

Create `frontend/src/components/ui/Alert/Alert.tsx`:

```tsx
import type { ReactNode } from 'react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  onClose?: () => void
  className?: string
}

const variantConfig: Record<AlertVariant, { icon: string; classes: string }> = {
  info: {
    icon: 'info',
    classes: 'bg-primary-fixed/20 text-on-surface border border-primary/20',
  },
  success: {
    icon: 'check_circle',
    classes: 'bg-tertiary-container/40 text-on-tertiary-container border border-tertiary/20',
  },
  warning: {
    icon: 'warning',
    classes: 'bg-secondary-container/40 text-on-secondary-container border border-secondary/20',
  },
  error: {
    icon: 'error',
    classes: 'bg-error-container text-on-error-container border border-error/20',
  },
}

export function Alert({ variant = 'info', title, children, onClose, className = '' }: AlertProps) {
  const { icon, classes } = variantConfig[variant]

  return (
    <div
      role="alert"
      className={[
        'flex gap-3 rounded-xl px-4 py-3',
        classes,
        className,
      ].join(' ')}
    >
      <span className="material-symbols-outlined text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-sm mb-0.5">{title}</p>
        )}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Închide alerta"
          className="flex-shrink-0 rounded-full p-0.5 hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            close
          </span>
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Export from barrel**

Add to `frontend/src/components/ui/index.ts`:

```ts
export { Alert } from './Alert'
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
cd /home/gandolh/projects/my-olx
git add frontend/src/components/ui/Alert/Alert.tsx frontend/src/components/ui/index.ts
git commit -m "feat(ui): add Alert inline banner component"
```

---

## Task 7: Refactor MyListingsPage — replace manual Tabs + window.confirm

**Files:**
- Modify: `frontend/src/modules/dashboard/pages/MyListingsPage.tsx`

Current issues:
- Lines 80–104: Manual tab buttons with absolute-positioned indicator
- Lines 271–291: `window.confirm()` for delete action

- [ ] **Step 1: Read current MyListingsPage to identify exact line ranges**

```bash
cat -n /home/gandolh/projects/my-olx/frontend/src/modules/dashboard/pages/MyListingsPage.tsx
```

Note the exact lines for: import block, tab rendering block, window.confirm block, and pagination block (if manual pagination exists).

- [ ] **Step 2: Update the file**

Edit `frontend/src/modules/dashboard/pages/MyListingsPage.tsx`:

**a) Update imports** — replace the existing imports block at the top with:

```tsx
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMyListings } from "../hooks/useMyListings";
import { useListingMutations } from "@/modules/listings/hooks/useListingMutations";
import { formatDistanceToNow, format } from "date-fns";
import { ro } from "date-fns/locale";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Tabs, TabPanel, ConfirmDialog, Pagination } from "@/components/ui";
import { Link } from "@/lib/router";
import type { ListingCard as ListingCardType } from "@/types/listing";
```

**b) Add confirm dialog state** — after the `const [page, setPage] = useState(1)` line, add:

```tsx
const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
```

**c) Replace the manual tabs block** (the `<div className="flex border-b ...">` block):

```tsx
<Tabs
  value={activeTab}
  onValueChange={(v) => { setActiveTab(v as TabType); setPage(1); }}
  tabs={tabs}
>
  {/* content rendered below, not inside TabPanel to preserve existing layout */}
</Tabs>
```

> **Note:** Because MyListingsPage renders content conditionally (loading/error/list) rather than per-tab inside `TabPanel`, keep the `Tabs` component just for the tab list navigation and render content below as before. The content area does not need `TabPanel` here.

**d) Replace `window.confirm` block** — replace the delete button `onClick` handler:

Replace:
```tsx
onClick={() => {
  if (
    window.confirm(
      t(
        "dashboard.listings.deleteConfirm",
        "Ești sigur că vrei să ștergi acest anunț?",
      ),
    )
  ) {
    handleAction(() => remove.mutateAsync(listing.id));
  }
}}
```

With:
```tsx
onClick={() => setDeleteTarget(listing.id)}
```

**e) Add ConfirmDialog just before the closing `</main>` tag:**

```tsx
<ConfirmDialog
  open={deleteTarget !== null}
  onClose={() => setDeleteTarget(null)}
  onConfirm={() => {
    if (deleteTarget) {
      handleAction(() => remove.mutateAsync(deleteTarget));
      setDeleteTarget(null);
    }
  }}
  title={t("dashboard.listings.deleteTitle", "Șterge anunțul")}
  description={t(
    "dashboard.listings.deleteConfirm",
    "Ești sigur că vrei să ștergi acest anunț? Această acțiune nu poate fi anulată.",
  )}
  confirmLabel={t("listing.actions.delete", "Șterge")}
  variant="danger"
/>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit 2>&1 | head -40
```

Expected: no new errors.

- [ ] **Step 4: Check pagination in MyListingsPage**

```bash
grep -n "setPage\|page\|Pagination" /home/gandolh/projects/my-olx/frontend/src/modules/dashboard/pages/MyListingsPage.tsx | head -30
```

If there's manual pagination (prev/next buttons), replace with the `Pagination` component. If pagination data (`totalPages`) is available in the `data` response, use:

```tsx
{data && data.totalPages > 1 && (
  <Pagination
    page={page}
    totalPages={data.totalPages}
    onPageChange={setPage}
    className="mt-6"
  />
)}
```

If `totalPages` is not in the API response, skip this sub-step.

- [ ] **Step 5: Commit**

```bash
cd /home/gandolh/projects/my-olx
git add frontend/src/modules/dashboard/pages/MyListingsPage.tsx
git commit -m "refactor(dashboard): use Tabs and ConfirmDialog in MyListingsPage"
```

---

## Task 8: Refactor Navbar — replace manual dropdown with Dropdown component

**Files:**
- Modify: `frontend/src/components/layout/Navbar.tsx`

Current issue: `showDropdown` state + manual `<div>` absolutely-positioned menu (lines 75–136).

- [ ] **Step 1: Update Navbar imports**

Replace the existing import block top of `frontend/src/components/layout/Navbar.tsx`:

```tsx
import { Link } from "@/lib/router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";
import { useLogoutMutation } from "@/modules/auth/hooks/useLogoutMutation";
import { useFavoriteIds } from "@/modules/favorites/hooks/useFavoriteIds";
import { useUnreadCount } from "@/modules/messaging/hooks/useUnreadCount";
import { Dropdown } from "@/components/ui";
import type { DropdownItem } from "@/components/ui";
```

- [ ] **Step 2: Replace showDropdown state and manual dropdown**

Remove `const [showDropdown, setShowDropdown] = useState(false)` and `const handleLogout` referencing `setShowDropdown`.

Replace with:

```tsx
const logoutMutation = useLogoutMutation();
```

Build a `userMenuItems` array before the return:

```tsx
const userMenuItems: DropdownItem[] = [
  {
    key: 'dashboard',
    label: 'Contul meu',
    icon: 'dashboard',
    render: ({ children, className }) => (
      <Link to="/cont" className={className} onClick={() => {}}>
        {children}
      </Link>
    ),
  },
  {
    key: 'listings',
    label: 'Anunțurile mele',
    icon: 'inventory_2',
    render: ({ children, className }) => (
      <Link to="/cont/anunturi" className={className}>
        {children}
      </Link>
    ),
  },
  {
    key: 'settings',
    label: 'Setări',
    icon: 'settings',
    render: ({ children, className }) => (
      <Link to="/cont/setari" className={className}>
        {children}
      </Link>
    ),
  },
  { key: '__separator__', label: '' },
  {
    key: 'logout',
    label: 'Deconectare',
    icon: 'logout',
    variant: 'danger',
    onClick: () => logoutMutation.mutate(),
  },
]
```

Replace the entire `<div className="relative">` ... `</div>` block (the user menu button + manual dropdown) with:

```tsx
<Dropdown
  trigger={
    <button
      className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors flex items-center gap-2"
      aria-label="Profil"
    >
      <span className="material-symbols-outlined">person</span>
      {user?.email && (
        <span className="hidden md:inline text-sm font-medium text-on-surface">
          {user.display_name || user.email.split('@')[0]}
        </span>
      )}
    </button>
  }
  items={userMenuItems}
  align="end"
/>
```

- [ ] **Step 3: Handle the "email not verified" notice**

The current dropdown had an inline notice. Move it outside the dropdown as an `Alert` or remove it for now (it can be shown elsewhere). Add an import for `Alert` if keeping it, or simply remove the unverified notice from the dropdown (it doesn't fit the `DropdownItem` model):

Remove this block from the items — the email verification notice is better suited to the dashboard page.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /home/gandolh/projects/my-olx/frontend && npx tsc --noEmit 2>&1 | head -40
```

Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
cd /home/gandolh/projects/my-olx
git add frontend/src/components/layout/Navbar.tsx
git commit -m "refactor(navbar): replace manual dropdown with Dropdown component"
```

---

## Task 9: Update wiki, README and frontend skill

**Files:**
- Create: `docs/wiki/features/shared-ui-components.md`
- Modify: `docs/wiki/index.md`
- Modify: `docs/wiki/log.md`
- Modify: `README.md` (if it references frontend components)
- Modify: `.claude/skills/frontend-development.md` (if it exists, add mention of new components)

- [ ] **Step 1: Read current wiki index and log**

```bash
cat /home/gandolh/projects/my-olx/docs/wiki/index.md
cat /home/gandolh/projects/my-olx/docs/wiki/log.md
```

- [ ] **Step 2: Create shared-ui-components wiki page**

Create `docs/wiki/features/shared-ui-components.md`:

```markdown
# Shared UI Component Library

**Status:** Done

**Summary:** Base-ui-powered shared component library for PiațăRo, providing consistent UI primitives across all feature modules.

## Requirements

- All components use `@base-ui/react` headless primitives where available
- Design tokens from `frontend/src/index.css` (Carpathian Clear design system)
- Material Symbols Outlined for icons
- Romanian aria labels and strings
- TypeScript strict, exported from `frontend/src/components/ui/index.ts`

## Components

| Component | Base UI primitive | Location |
|-----------|-----------------|----------|
| Button | plain | `ui/Button/Button.tsx` |
| Input | plain | `ui/Input/Input.tsx` |
| Textarea | plain | `ui/Textarea/Textarea.tsx` |
| Select | plain | `ui/Select/Select.tsx` |
| Slider | `@base-ui/react/slider` | `ui/Slider/Slider.tsx` |
| CityAutocomplete | `@base-ui/react/autocomplete` | `ui/CityAutocomplete/` |
| SearchAutocomplete | `@base-ui/react/autocomplete` | `ui/SearchAutocomplete/` |
| Tabs | `@base-ui/react/tabs` | `ui/Tabs/Tabs.tsx` |
| ConfirmDialog | `@base-ui/react/alert-dialog` | `ui/ConfirmDialog/ConfirmDialog.tsx` |
| Dropdown | `@base-ui/react/menu` | `ui/Dropdown/Dropdown.tsx` |
| Tooltip | `@base-ui/react/tooltip` | `ui/Tooltip/Tooltip.tsx` |
| Pagination | plain | `ui/Pagination/Pagination.tsx` |
| Alert | plain | `ui/Alert/Alert.tsx` |
| Badge | plain | `ui/Badge/Badge.tsx` |
| Chip | plain | `ui/Chip/Chip.tsx` |
| Avatar | plain | `ui/Avatar/Avatar.tsx` |
| Card / CardHeader | plain | `ui/Card/Card.tsx` |
| Modal | plain | `ui/Modal/Modal.tsx` |
| Toast / AuthRequiredToast | plain | `ui/Toast/Toast.tsx` |
| PriceInput | plain | `ui/PriceInput/PriceInput.tsx` |
| EmptyState | plain | `ui/EmptyState/EmptyState.tsx` |
| Divider | plain | `ui/Divider/Divider.tsx` |
| ProgressBar | plain | `ui/ProgressBar/ProgressBar.tsx` |
| Skeleton / CardSkeleton | plain | `ui/Skeleton.tsx` |

## Design Notes

- Tailwind CSS v4 — no `tailwind.config.js`; all tokens via `@theme` in `index.css`
- `data-[selected]` / `data-[open]` / `data-[disabled]` attributes from base-ui drive visual states
- No Sonner integration — custom Toast component used instead

## Acceptance Criteria

- All 6 new components compile without TypeScript errors
- `MyListingsPage` uses `Tabs` and `ConfirmDialog` (no manual tab buttons, no `window.confirm`)
- `Navbar` user menu uses `Dropdown` (no `showDropdown` state)
```

- [ ] **Step 3: Update wiki index**

Add under `## Features` section of `docs/wiki/index.md`:

```markdown
- [Shared UI Component Library](features/shared-ui-components.md) — Base-ui-powered shared primitives [Done]
```

- [ ] **Step 4: Append to log**

Append to `docs/wiki/log.md`:

```
[2026-04-30] ingest | added shared-ui-components feature page covering Tabs, ConfirmDialog, Dropdown, Tooltip, Pagination, Alert
```

- [ ] **Step 5: Update frontend skill if it exists**

```bash
ls /home/gandolh/projects/my-olx/.claude/skills/
cat /home/gandolh/projects/my-olx/.claude/skills/frontend-development.md | head -60
```

If the skill has a component inventory section, add the 6 new components there. If not, add a note under the component section.

- [ ] **Step 6: Commit docs**

```bash
cd /home/gandolh/projects/my-olx
git add docs/wiki/features/shared-ui-components.md docs/wiki/index.md docs/wiki/log.md
git add .claude/skills/frontend-development.md 2>/dev/null || true
git commit -m "docs: add shared UI components wiki page and update index/log"
```

---

## Self-Review

### Spec coverage check

| Requirement | Covered by |
|-------------|-----------|
| Tabs component using base-ui | Task 1 |
| ConfirmDialog replacing window.confirm | Tasks 2 + 7 |
| Dropdown/Menu for Navbar | Tasks 3 + 8 |
| Tooltip component | Task 4 |
| Pagination component | Task 5 |
| Alert/Banner component | Task 6 |
| Wire Tabs into MyListingsPage | Task 7 |
| Wire Dropdown into Navbar | Task 8 |
| Update wiki | Task 9 |
| Update frontend skill | Task 9 |

### Known risks

- **Dropdown `render` prop pattern:** The `Dropdown` component in Task 3 uses a `render` prop on `DropdownItem` for link items. The base-ui `Menu.Item` may not support `render` prop in the same way. If the API doesn't support it, use `Menu.Item` as a `<Link>` wrapper via the `render` prop from base-ui's composition docs (`render={<Link to="..." />}`). Verify the exact base-ui 1.4.1 API during Task 3 Step 1.

- **`Tabs.Tab` `data-[selected]` attribute:** base-ui Tabs uses `data-selected` on the active tab. The `span` indicator inside uses CSS sibling selectors via `data-[selected]:scale-x-100`. Verify this works in base-ui 1.4.1 — if `data-selected` is on the Tab button, the child `span` can use `group-data-[selected]:scale-x-100` with `group` on the Tab. Adjust if needed.

- **`ConfirmDialog` close via onOpenChange:** The `AlertDialog.Root` `onOpenChange` fires with `false` when the user clicks outside or presses Escape. The pattern `(o) => { if (!o) onClose() }` handles this.
