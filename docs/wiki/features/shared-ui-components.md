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
- `data-[active]` (Tabs), `data-[highlighted]` (Menu.Item), `data-[popup-open]` (Trigger) from base-ui drive visual states
- No Sonner integration — custom Toast component used instead
- Dropdown link navigation uses `useNavigate` from `@/lib/router` (TanStack Router), not render-prop Link wrappers

## Acceptance Criteria

- All 6 new components compile without TypeScript errors
- `MyListingsPage` uses `Tabs` and `ConfirmDialog` (no manual tab buttons, no `window.confirm`)
- `Navbar` user menu uses `Dropdown` (no `showDropdown` state)
