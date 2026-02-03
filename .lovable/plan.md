

# Convert Entire System to Pure React + Tailwind CSS

## Overview
This plan outlines the complete removal of all Radix UI primitives (shadcn/ui) and other design packages, replacing them with pure React components styled only with Tailwind CSS. This is a major refactoring effort affecting 50+ component files and 100+ consumer files.

## Scope Analysis

### Current Dependencies to Remove
- All @radix-ui/* packages (20+ packages)
- class-variance-authority (CVA)
- cmdk (Command Menu)
- vaul (Drawer)
- input-otp
- embla-carousel-react
- react-day-picker
- sonner (Toast)
- next-themes (if theme switching is rebuilt manually)

### Dependencies to Keep
- React, React DOM, React Router
- @tanstack/react-query
- @supabase/supabase-js
- Tailwind CSS and related (tailwind-merge, tailwindcss-animate)
- lucide-react (icons only, no UI primitives)
- qrcode.react, html5-qrcode
- date-fns, zod, react-hook-form
- recharts (charts)

---

## Implementation Phases

### Phase 1: Foundation Components (Critical Path)
Rewrite core primitives that all other components depend on.

| Component | Replacement Strategy |
|-----------|---------------------|
| button.tsx | Pure Tailwind with variant classes |
| input.tsx | Native input with Tailwind styling |
| textarea.tsx | Native textarea with Tailwind |
| label.tsx | Native label with Tailwind |
| checkbox.tsx | Custom checkbox with CSS/hidden input |
| switch.tsx | CSS-only toggle switch |
| radio-group.tsx | Native radio inputs styled |
| progress.tsx | CSS progress bar |
| skeleton.tsx | Already pure Tailwind (no changes) |
| badge.tsx | Already pure Tailwind (no changes) |
| separator.tsx | Simple div with border |
| avatar.tsx | Image with fallback handling |

### Phase 2: Layout Components
| Component | Replacement Strategy |
|-----------|---------------------|
| card.tsx | Already pure Tailwind (no changes) |
| scroll-area.tsx | Native overflow-auto with custom scrollbar CSS |
| sidebar.tsx | State-managed div layout with transitions |
| sheet.tsx | Fixed position drawer with transitions |
| resizable.tsx | react-resizable-panels can stay or remove |
| accordion.tsx | Collapsible div with useState |
| collapsible.tsx | Simple useState toggle |

### Phase 3: Overlay Components (Complex)
These require manual accessibility and focus trap implementation.

| Component | Replacement Strategy |
|-----------|---------------------|
| dialog.tsx | Fixed overlay + focus trap + escape handling |
| alert-dialog.tsx | Variant of dialog with confirm/cancel |
| popover.tsx | Positioned overlay with click-outside |
| tooltip.tsx | Hover-triggered positioned element |
| hover-card.tsx | Similar to tooltip with richer content |
| dropdown-menu.tsx | Click-triggered menu with keyboard nav |
| context-menu.tsx | Right-click triggered menu |
| menubar.tsx | Horizontal menu with dropdowns |

### Phase 4: Form Components
| Component | Replacement Strategy |
|-----------|---------------------|
| select.tsx | Custom dropdown with native fallback option |
| form.tsx | react-hook-form integration (keep) |
| calendar.tsx | Build from scratch or use simple date inputs |
| input-otp.tsx | Series of single-char inputs |

### Phase 5: Feedback Components
| Component | Replacement Strategy |
|-----------|---------------------|
| toast.tsx + toaster.tsx | Custom toast context + portal |
| sonner.tsx | Remove, merge into custom toast |
| alert.tsx | Styled div (already simple) |

### Phase 6: Navigation Components
| Component | Replacement Strategy |
|-----------|---------------------|
| tabs.tsx | Button group with content switching |
| navigation-menu.tsx | Dropdown nav with CSS |
| pagination.tsx | Button group with page logic |
| breadcrumb.tsx | Link list (already simple) |

### Phase 7: Data Display
| Component | Replacement Strategy |
|-----------|---------------------|
| table.tsx | Already uses native table elements |
| carousel.tsx | Remove embla, use CSS scroll-snap |
| chart.tsx | Keep recharts (data viz library) |

---

## Component Architecture Example

### Pure Tailwind Button (No CVA)
```text
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const variantStyles = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-secondary text-white hover:bg-secondary/90',
  outline: 'border-2 border-border bg-transparent hover:bg-muted',
  ghost: 'hover:bg-muted',
  destructive: 'bg-destructive text-white hover:bg-destructive/90',
};

const sizeStyles = {
  sm: 'h-9 px-4 text-sm rounded-lg',
  md: 'h-11 px-6 text-sm rounded-xl',
  lg: 'h-14 px-10 text-base rounded-xl',
  icon: 'h-10 w-10 rounded-lg',
};
```

### Pure Tailwind Dialog (Manual Implementation)
```text
- Fixed overlay with backdrop blur
- Centered modal with max-width
- useEffect for Escape key handling
- useRef + useEffect for focus trap
- Portal using ReactDOM.createPortal
- Body scroll lock when open
- Transition classes for animation
```

### Pure Tailwind Select (Custom Dropdown)
```text
- Button trigger showing selected value
- Absolutely positioned options list
- Click outside detection using useRef
- Keyboard navigation (ArrowUp/Down, Enter, Escape)
- Option hover states
- Hidden native select for form submission (accessibility)
```

---

## File Changes Summary

### Files to Rewrite Completely (~35 files)
```text
src/components/ui/
  - accordion.tsx
  - alert-dialog.tsx
  - button.tsx (remove CVA, Slot)
  - calendar.tsx
  - carousel.tsx
  - checkbox.tsx
  - collapsible.tsx
  - command.tsx
  - context-menu.tsx
  - dialog.tsx
  - drawer.tsx
  - dropdown-menu.tsx
  - form.tsx (simplify, keep react-hook-form)
  - hover-card.tsx
  - input-otp.tsx
  - label.tsx
  - menubar.tsx
  - navigation-menu.tsx
  - popover.tsx
  - progress.tsx
  - radio-group.tsx
  - scroll-area.tsx
  - select.tsx
  - separator.tsx
  - sheet.tsx
  - sidebar.tsx
  - slider.tsx
  - sonner.tsx
  - switch.tsx
  - tabs.tsx
  - toast.tsx + toaster.tsx
  - toggle.tsx + toggle-group.tsx
  - tooltip.tsx
```

### Files Requiring Import Updates (~70 files)
All files in:
- src/pages/ (all dashboard, hospital, doctor, admin pages)
- src/components/ (all feature components)

### Files to Delete
```text
src/components/ui/use-toast.ts (merge into toast.tsx)
```

### Package.json Changes
Remove ~25 dependencies, update scripts

---

## Accessibility Considerations

Without Radix UI primitives, you must manually implement:

1. **Focus Management**: Focus trap in modals, return focus on close
2. **Keyboard Navigation**: Arrow keys in menus, Escape to close
3. **ARIA Attributes**: role, aria-expanded, aria-selected, etc.
4. **Screen Reader Support**: aria-live regions for toasts
5. **Click Outside**: Close overlays when clicking backdrop

---

## Estimated Effort

| Phase | Estimated Effort |
|-------|-----------------|
| Phase 1: Foundation | 2-3 hours |
| Phase 2: Layout | 2-3 hours |
| Phase 3: Overlays | 6-8 hours (most complex) |
| Phase 4: Forms | 4-5 hours |
| Phase 5: Feedback | 2-3 hours |
| Phase 6: Navigation | 2-3 hours |
| Phase 7: Data Display | 1-2 hours |
| Consumer File Updates | 4-6 hours |
| Testing & Bug Fixes | 4-6 hours |

**Total: 27-39 hours of work**

---

## Recommended Implementation Order

1. **Start with foundation** (Button, Input, Label, Checkbox, Switch)
2. **Build toast system** early (needed for user feedback during dev)
3. **Build dialog/modal** (used extensively throughout)
4. **Build select dropdown** (many forms use this)
5. **Build tabs** (dashboard pages use this)
6. **Build sidebar** (layout component)
7. **Update consumer files** incrementally as components are ready
8. **Remove old packages** from package.json last

---

## Risk Mitigation

- **Incremental Migration**: Replace one component at a time
- **Type Safety**: Maintain TypeScript interfaces for component props
- **Regression Testing**: Test each page after component replacement
- **Accessibility Audit**: Run Lighthouse accessibility checks after conversion

---

## Do You Want to Proceed?

This is a substantial refactoring project. I recommend tackling it in phases, starting with the foundation components. Click **Approve** to begin with Phase 1 (Button, Input, Label, Checkbox, Switch, and basic form elements).

