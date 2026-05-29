# Folder Structure Rules — Learninough Admin Dashboard

> **Read this before adding any new screen, component, hook, or API call.**
> Agents and developers must follow these rules so the codebase stays consistent.

---

## 1. Golden rule

| Layer | Folder | Responsibility |
|-------|--------|----------------|
| **Route entry** | `src/pages/` | Thin wrapper linked to a URL. No business logic. |
| **Feature logic & UI** | `src/features/<name>/` | Everything for one product area (dashboard, users, etc.). |
| **Shared UI** | `src/components/` | Reused by 2+ features (layout shell, buttons, tables). |
| **Routing config** | `src/routes/` | Route map only. |
| **App config** | `src/config/` | Navigation, constants, env-related config. |
| **API calls** | `src/api/` | Pure async functions — no React, no hooks. |
| **Shared hooks** | `src/hooks/` | Generic hooks used across features. |
| **Types** | `src/types/` | Shared TypeScript types. |
| **Utils** | `src/utils/` | Pure helpers (`cn`, formatters, etc.). |
| **Styles** | `src/styles/` | Global CSS and design tokens. |

**Never put heavy UI or data logic in `pages/`.**  
**Never put feature-only code in `components/ui/`.**

---

## 2. Current project tree

```
src/
├── main.tsx                 # Entry: QueryClient + App
├── App.tsx                  # BrowserRouter wrapper
│
├── routes/
│   └── index.tsx            # All Route definitions
│
├── pages/                   # ← ROUTE ONLY (thin)
│   ├── DashboardPage.tsx
│   ├── UserManagementPage.tsx
│   ├── CourseManagementPage.tsx
│   ├── FinancialManagementPage.tsx
│   ├── ChatsPage.tsx
│   ├── ReportsAnalyticsPage.tsx
│   ├── AccountPage.tsx
│   └── HelpCenterPage.tsx
│
├── features/                # ← BUILD REAL SCREENS HERE
│   ├── dashboard/
│   ├── users/
│   ├── courses/
│   ├── financial/
│   ├── chats/
│   ├── reports/
│   ├── account/
│   └── help/
│
├── components/
│   ├── layout/              # App shell (Sidebar, TopBar, DashboardLayout)
│   └── ui/                  # Generic primitives (Button, Card, Table…)
│
├── config/
│   └── navigation.ts        # Sidebar items, paths, icons
│
├── api/                     # (add when backend is wired)
├── hooks/
├── types/
├── utils/
│   └── cn.ts
└── styles/
    ├── globals.css
    └── variables.css        # Figma design tokens
```

---

## 3. Route → page → feature mapping

| URL path | Page file (`pages/`) | Feature folder (`features/`) |
|----------|----------------------|------------------------------|
| `/` | `DashboardPage.tsx` | `dashboard/` |
| `/users` | `UserManagementPage.tsx` | `users/` |
| `/courses` | `CourseManagementPage.tsx` | `courses/` |
| `/financial` | `FinancialManagementPage.tsx` | `financial/` |
| `/chats` | `ChatsPage.tsx` | `chats/` |
| `/reports` | `ReportsAnalyticsPage.tsx` | `reports/` |
| `/account` | `AccountPage.tsx` | `account/` |
| `/help` | `HelpCenterPage.tsx` | `help/` |

When adding a new sidebar item:
1. Add entry in `src/config/navigation.ts`
2. Add route in `src/routes/index.tsx`
3. Add thin file in `src/pages/`
4. Create folder in `src/features/<name>/`

---

## 4. Inside a feature folder

Use this layout for every feature:

```
src/features/users/
├── UserManagementView.tsx     # Main screen (composed layout)
├── components/                # Only used inside this feature
│   ├── UserTable.tsx
│   └── UserFilters.tsx
├── hooks/
│   └── useUsers.ts            # TanStack Query hooks
└── api/                       # Optional: feature-local API if tiny
    └── usersApi.ts            # Prefer src/api/users.api.ts for shared API
```

### Naming

| File type | Pattern | Example |
|-----------|---------|---------|
| Page wrapper (in `pages/`) | `<Area>Page.tsx` | `UserManagementPage.tsx` |
| Feature view | `<Area>View.tsx` or `<Area>ManagementView.tsx` | `UserManagementView.tsx` |
| Feature component | PascalCase, descriptive | `UserTable.tsx` |
| Hook | `use<Thing>.ts` | `useUsers.ts` |
| API function file | `<resource>.api.ts` in `src/api/` | `users.api.ts` |

---

## 5. `pages/` — what belongs here

**Allowed:** import feature view → return it.

```tsx
// src/pages/DashboardPage.tsx
import { DashboardView } from '@/features/dashboard/DashboardView'

export function DashboardPage() {
  return <DashboardView />
}
```

**Not allowed in `pages/`:**
- API calls, `useQuery`, `useEffect` data fetching
- Large JSX trees (stat cards, charts, tables)
- Feature-specific state

---

## 6. `components/` — shared vs feature

| Put in `components/ui/` | Put in `features/<x>/components/` |
|-------------------------|-----------------------------------|
| `Button`, `Card`, `Input`, `Modal` | `UserTable`, `EnrollmentChart` |
| `DataTable` (generic) | `PendingActionsList` |
| `PlaceholderPage` | `FinancialPulseCard` |
| Used by 2+ features | Used by 1 feature only |

| Put in `components/layout/` |
|-----------------------------|
| `Sidebar`, `TopBar`, `DashboardLayout`, `SidebarItem` |
| Anything that wraps the whole app shell |

---

## 7. Design & styling rules

- Use **Figma tokens** from `src/styles/variables.css` and `tailwind.config.ts`
- Primary gradient: `bg-primary-gradient` / `bg-primary-gradient-r`
- Page background: `bg-surface-page`
- Sidebar: `bg-surface-sidebar`
- Headings: `text-ink-heading` (`#000b60`)
- Use `cn()` from `@/utils/cn` for conditional classes
- Use `@/` imports — no deep relative paths like `../../`

---

## 8. Data flow (when API is added)

```
Page (pages/) → View (features/) → Hook (features/*/hooks/) → API (src/api/) → Supabase
```

- Components **never** call Supabase directly
- Fetch with **TanStack Query** hooks — not `useEffect`
- API files: named exports only, no React imports

---

## 9. Agent checklist — run before every change

Before creating or editing files, answer:

1. **Is this a new route?** → `config/navigation.ts` + `routes/` + `pages/` + `features/<name>/`
2. **Is this screen UI?** → `features/<name>/`, not `pages/`
3. **Is this reusable across features?** → `components/ui/` or `components/layout/`
4. **Is this data fetching?** → `hooks/` inside feature + `api/` at root
5. **Is this a type used everywhere?** → `src/types/`
6. **Does it match existing naming?** → `<Area>Page` + `<Area>View`

---

## 10. Examples

### ✅ Correct — new Dashboard with stat cards

```
src/pages/DashboardPage.tsx              → imports DashboardView
src/features/dashboard/DashboardView.tsx → layout + sections
src/features/dashboard/components/StatCards.tsx
src/features/dashboard/hooks/useDashboardStats.ts
src/api/dashboard.api.ts
```

### ❌ Wrong — everything in pages

```
src/pages/DashboardPage.tsx   ← 400 lines of charts, API calls, tables
```

### ❌ Wrong — feature component in shared ui

```
src/components/ui/UserTable.tsx   ← only used on users page
```

---

## 11. Tech stack reminder

React 18 · Vite · TypeScript · Tailwind · React Router v6 · TanStack Query · Supabase · Zustand · React Hook Form + Zod · Lucide icons

Design reference: [Figma — Online Learning App](https://www.figma.com/design/aaGRnMSLXgSAYqI0PL4O3U/Online-Learning-App?node-id=950-209)
