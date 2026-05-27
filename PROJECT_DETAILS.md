# Admin Dashboard — Project Details

A professional, production-ready admin dashboard built with **React 18 + Vite + TypeScript + Supabase**.

---

## 1. Tech Stack

| Layer              | Technology                                  |
| ------------------ | ------------------------------------------- |
| Framework          | React 18 + Vite                             |
| Language           | TypeScript (strict mode)                    |
| Styling            | Tailwind CSS v3                             |
| Backend & DB       | Supabase (auth, database, storage, edge functions) |
| Data Fetching      | TanStack Query v5 (React Query)             |
| State Management   | Zustand                                     |
| Routing            | React Router v6                             |
| Forms              | React Hook Form + Zod validation            |
| Tables             | TanStack Table v8                           |
| Charts             | Recharts                                    |
| Icons              | Lucide React                                |
| Utilities          | clsx + tailwind-merge (via `cn()` helper)   |

---

## 2. Full Folder Structure

```
learningApp_admin_dashboard/
├── .env.example              # Template for environment variables
├── .eslintrc.js              # ESLint configuration
├── .prettierrc               # Prettier formatting rules
├── vite.config.ts            # Vite bundler config + @ alias
├── tsconfig.json             # TypeScript strict config + path aliases
├── tailwind.config.ts        # Tailwind theme, colors, fonts
├── postcss.config.js         # PostCSS + autoprefixer
├── package.json              # Dependencies & scripts
│
├── public/
│   └── favicon.ico           # App favicon
│
├── supabase/
│   ├── migrations/
│   │   └── 001_init.sql      # Initial DB schema migration
│   ├── functions/            # Supabase Edge Functions
│   └── config.toml           # Supabase CLI configuration
│
└── src/
    ├── main.tsx              # App entry — mounts <App /> + QueryClientProvider
    ├── App.tsx               # Root component — RouterProvider wrapper
    ├── vite-env.d.ts         # Vite env type declarations
    │
    ├── api/                  # Server interaction layer (typed, named exports only)
    │   ├── supabase.ts       # Typed Supabase client (uses VITE_ env vars)
    │   ├── auth.api.ts       # signIn / signOut / getSession / getUser
    │   ├── users.api.ts      # CRUD operations for users
    │   ├── products.api.ts   # CRUD operations for products
    │   └── dashboard.api.ts  # getDashboardStats() — aggregated metrics
    │
    ├── components/
    │   ├── ui/               # Generic, reusable UI primitives
    │   │   ├── Button.tsx    # Variants: primary/secondary/danger/ghost, sizes, loading
    │   │   ├── Input.tsx     # RHF-compatible input with label & error
    │   │   ├── Modal.tsx     # Accessible modal/dialog
    │   │   ├── Badge.tsx     # Status/role pill (success/warning/danger)
    │   │   ├── Card.tsx      # Container with consistent padding/shadow
    │   │   └── Spinner.tsx   # Inline loading indicator
    │   ├── layout/           # Shell components
    │   │   ├── Sidebar.tsx   # Nav with Lucide icons, active route highlight
    │   │   ├── Navbar.tsx    # Hamburger + page title + user dropdown
    │   │   └── PageWrapper.tsx  # Page heading + consistent padding
    │   ├── charts/           # Recharts wrappers
    │   │   ├── BarChart.tsx  # Typed BarChart wrapper
    │   │   └── LineChart.tsx # Typed LineChart wrapper
    │   └── tables/           # TanStack Table v8 wrappers
    │       ├── DataTable.tsx # Generic table — sorting, filter, pagination
    │       └── Pagination.tsx # Standalone pagination controls
    │
    ├── features/             # Feature-sliced modules (page + queries + forms)
    │   ├── auth/
    │   │   ├── LoginPage.tsx       # RHF + Zod login form
    │   │   ├── AuthGuard.tsx       # Redirect to /login if not authed
    │   │   └── useAuthQuery.ts     # useSession, useSignIn, useSignOut hooks
    │   ├── dashboard/
    │   │   ├── DashboardPage.tsx   # Stats + charts overview
    │   │   ├── StatsCards.tsx      # 4-card metric grid
    │   │   └── useDashboardQuery.ts # useDashboardStats() hook
    │   ├── users/
    │   │   ├── UserList.tsx        # DataTable + search + pagination
    │   │   ├── UserForm.tsx        # Create/edit user modal form
    │   │   ├── UserDetail.tsx      # Single-user view
    │   │   └── useUsersQuery.ts    # useUsers, useCreateUser, useUpdateUser, useDeleteUser
    │   ├── products/
    │   │   ├── ProductList.tsx     # DataTable for products
    │   │   ├── ProductForm.tsx     # Create/edit product form
    │   │   └── useProductsQuery.ts # Product query/mutation hooks
    │   └── settings/
    │       ├── ProfilePage.tsx     # Current user profile editor
    │       └── RolesPage.tsx       # Role management (admin only)
    │
    ├── hooks/                # Reusable headless hooks
    │   ├── useDebounce.ts    # Debounce any value (default 400 ms)
    │   ├── usePagination.ts  # { page, pageSize, setPage, setPageSize, reset }
    │   └── useSupabase.ts    # Convenience re-export of typed supabase client
    │
    ├── store/                # Zustand global state
    │   ├── authStore.ts      # user, isAuthenticated, setUser, logout (persisted)
    │   ├── uiStore.ts        # sidebarOpen, theme, toggleSidebar, toggleTheme
    │   └── index.ts          # Barrel exports
    │
    ├── routes/               # React Router v6 wiring
    │   ├── index.tsx         # createBrowserRouter — route map
    │   ├── ProtectedRoute.tsx # Auth guard + layout shell (Outlet)
    │   └── PublicRoute.tsx    # Redirects to /dashboard if already authed
    │
    ├── types/                # Shared TypeScript types
    │   ├── supabase.types.ts # Auto-generated by Supabase CLI — do not edit
    │   ├── api.types.ts      # User, Product, DashboardStats, PaginatedResponse<T>
    │   └── common.types.ts   # Cross-cutting helper types
    │
    ├── utils/                # Pure utility functions
    │   ├── formatDate.ts     # formatDate + formatRelativeTime
    │   ├── formatCurrency.ts # Intl.NumberFormat wrapper
    │   ├── validators.ts     # Zod schemas (loginSchema, userSchema, productSchema)
    │   └── constants.ts      # ROLES, PAGE_SIZES, DEFAULT_PAGE_SIZE, STALE_TIME
    │
    └── styles/
        ├── globals.css       # @tailwind base/components/utilities + base layer
        └── variables.css     # CSS custom properties (theme tokens)
```

---

## 3. Routing Map

| Path           | Component       | Wrapper                           |
| -------------- | --------------- | --------------------------------- |
| `/login`       | `LoginPage`     | `PublicRoute`                     |
| `/dashboard`   | `DashboardPage` | `ProtectedRoute` + layout shell   |
| `/users`       | `UserList`      | `ProtectedRoute` + layout shell   |
| `/users/:id`   | `UserDetail`    | `ProtectedRoute` + layout shell   |
| `/products`    | `ProductList`   | `ProtectedRoute` + layout shell   |
| `/settings`    | `ProfilePage`   | `ProtectedRoute` + layout shell   |
| `*` (fallback) | redirect → `/dashboard` |                          |

---

## 4. Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ UI Components (features/, components/)                       │
│   - Read data via useQuery hooks                             │
│   - Trigger mutations via useMutation hooks                  │
└──────────────────────────────────────────────────────────────┘
                          ▲
                          │
┌──────────────────────────────────────────────────────────────┐
│ Feature Query Layer (features/*/use*Query.ts)                │
│   - Defines query keys                                       │
│   - Wraps API calls with TanStack Query                      │
│   - Handles cache invalidation                               │
└──────────────────────────────────────────────────────────────┘
                          ▲
                          │
┌──────────────────────────────────────────────────────────────┐
│ API Layer (src/api/)                                         │
│   - Pure async functions calling supabase                    │
│   - Strictly typed with api.types.ts                         │
│   - No React, no hooks, no state                             │
└──────────────────────────────────────────────────────────────┘
                          ▲
                          │
┌──────────────────────────────────────────────────────────────┐
│ Supabase Client (src/api/supabase.ts)                        │
│   - Typed createClient<Database>()                           │
└──────────────────────────────────────────────────────────────┘

  Zustand (store/) lives beside this stack:
    - authStore   → session/user identity (persisted)
    - uiStore     → sidebar open/closed, theme (persisted)
```

**Rule:** components never call Supabase directly. They use a hook → API function → Supabase client.

---

## 5. Global Code Quality Rules

- No `any` types — use `unknown` and narrow, or define proper interfaces.
- No default exports from `api/` files — named exports only.
- Every async function handles errors with `try/catch` or returns `{ data, error }`.
- All components have explicit prop interfaces: `interface Props { ... }`.
- Never fetch data inside `useEffect` — always use `useQuery` from TanStack Query.
- Zod schemas defined once in `validators.ts` — reused across forms and API layer.
- Use the `cn()` utility (clsx + tailwind-merge) for all conditional Tailwind classes.
- Use the `@` path alias everywhere — no `../../` relative imports.
- Barrel `index.ts` exports only where they reduce import noise — not by default.
- Every page component wrapped in `<PageWrapper title="…">`.
- Loading states: skeleton divs (`animate-pulse`), not spinners, for page-level data.
- Error states: friendly inline error message with a retry button.

---

## 6. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 7. Dependencies

### Runtime
- `@supabase/supabase-js` ^2
- `@tanstack/react-query` ^5
- `@tanstack/react-table` ^8
- `react` ^18, `react-dom` ^18
- `react-hook-form` ^7
- `react-router-dom` ^6
- `zustand` ^4
- `zod` ^3
- `lucide-react` ^0.400.0
- `clsx` ^2, `tailwind-merge` ^2
- `recharts` ^2

### Dev
- `@types/react` ^18, `@types/react-dom` ^18
- `@vitejs/plugin-react` ^4
- `autoprefixer` ^10, `postcss` ^8
- `eslint` ^8, `prettier` ^3
- `tailwindcss` ^3
- `typescript` ^5, `vite` ^5

---

## 8. Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Generate Supabase types (do not edit supabase.types.ts manually)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.types.ts

# 4. Start the dev server
npm run dev
```

---

## 9. Conventions Cheat-Sheet

### Query keys
```ts
export const userKeys = {
  all:     ['users'] as const,
  lists:   () => [...userKeys.all, 'list'] as const,
  list:    (page: number, pageSize: number) => [...userKeys.lists(), { page, pageSize }] as const,
  detail:  (id: string) => [...userKeys.all, 'detail', id] as const,
}
```

### Mutation with invalidation
```ts
export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  })
}
```

### Path alias
```ts
import { supabase } from '@/api/supabase'
import { Button } from '@/components/ui/Button'
```

---

## 10. Status

- [x] Folder structure scaffolded
- [ ] Config files (`vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, etc.)
- [ ] `package.json` + dependency install
- [ ] API layer (`src/api/`)
- [ ] Types (`src/types/`)
- [ ] Stores (`src/store/`)
- [ ] UI primitives (`src/components/ui/`)
- [ ] Layout (`src/components/layout/`)
- [ ] Routes (`src/routes/`)
- [ ] Feature: auth
- [ ] Feature: dashboard
- [ ] Feature: users
- [ ] Feature: products
- [ ] Feature: settings
- [ ] Supabase migrations
- [ ] First `npm run dev`
