# Application Rendering Strategy (STRATEGY.md)

## 1. Route Table and Rendering Output

Generated from Next.js production build (`npm run build`):

```text
Route (app)
┌ ○ /                              (Static)
├ ○ /_not-found                    (Static)
├ ○ /cart                          (Static)
├ ○ /checkout                      (Static)
├ ○ /dashboard                     (Static)
├ ○ /kitchen                       (Static)
├ ƒ /menu                          (Dynamic - reads searchParams: category, q, page)
├   /menu/[id]                     (SSG - prerendered 12 fixture dishes)
│ ├ ● /menu/kitfo
│ ├ ● /menu/doro-wot
│ ├ ● /menu/shekla-tibs
│ └ ● [+9 more paths]
├   /menu/[id]/opengraph-image     (SSG - 12 dynamic OG preview images)
├ ○ /opengraph-image               (Static - 1200x630 root OG banner)
├ ƒ /orders                        (Dynamic - reads searchParams: sort, dir, page, demo)
├ ƒ /orders/[id]                   (Dynamic - dynamic order ID status view)
├ ○ /robots.txt                    (Static - crawler directives)
├ ○ /signin                        (Static - demo identity switcher)
├ ○ /sitemap.xml                   (Static - dynamic sitemap excluding private routes)
└ ƒ /track/[id]                    (Dynamic - live delivery tracking with map)

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

---

## 2. Rendering Strategy per Route

### `/` — Home (Static `○`)
- **Strategy**: Static prerendering.
- **Reasoning**: The restaurant introduction, brand mission, cultural highlights, and featured house specials are known at build time. Zero request-time overhead; instant TTFB from edge CDN.

### `/menu` — Menu Browser (Dynamic `ƒ`)
- **Strategy**: Server Component shell streaming dynamic search parameters to client interactive `MenuBrowser`.
- **Reasoning**: Category filters (`?category=Traditional`), debounced search terms (`?q=tibs`), and pagination (`?page=2`) live in the URL so users can bookmark, share, and refresh filtered views. In Next.js 15/16 App Router, accessing `searchParams` on a page opts the route into request-time dynamic evaluation.

### `/menu/[id]` — Dish Detail (SSG `●`)
- **Strategy**: Static Site Generation with `generateStaticParams()`.
- **Reasoning**: The catalog of 12 authentic fixture dishes is fully known at build time. Prebuilding HTML, JSON-LD metadata, and Open Graph image routes ensures sub-50ms navigation and perfect search engine indexability. Unknown dish IDs trigger `notFound()` returning the 404 boundary.

### `/cart` — Cart (Static `○`)
- **Strategy**: Static outer shell wrapping client state provider.
- **Reasoning**: The cart is completely personal to the client browser session. The server delivers a static layout frame; after mounting, `CartContext` reads items from localStorage and computes integer ETB totals without hydration discrepancies.

### `/checkout` — Checkout (Static `○`)
- **Strategy**: Static shell with client interactive form.
- **Reasoning**: Delivers an instant form shell. The client manages provisional validation, double-submit protection, and idempotency key transmission to the mock order service.

### `/orders` and `/orders/[id]` — Orders & Status (Dynamic `ƒ`)
- **Strategy**: Dynamic server rendering with client SWR polling.
- **Reasoning**: The order table relies on URL parameters (`?sort=total&dir=desc&page=1`) and demo toggles (`?demo=empty|error|slow`). Order status screens use seed data from fixtures, then poll the frontend mock service every 5 seconds until a terminal state (`delivered` or `cancelled`) is reached.

### `/track/[id]` — Delivery Tracking (Dynamic `ƒ`)
- **Strategy**: Dynamic server route with client dynamic Leaflet import (`next/dynamic` with `ssr: false`).
- **Reasoning**: OpenStreetMap and Leaflet require browser `window` APIs and must not execute during SSR. The server streams a sized container (`h-[320px]`), then the client hydrates the map and connects to the EventSource mock stream.

### `/kitchen` and `/dashboard` — Operations (Static `○`)
- **Strategy**: Static Server Component shell with client leaves.
- **Reasoning**: `/dashboard` executes order aggregation on the server, producing lean JSON serializable objects passed to Recharts client components.

---

## 3. Course Strategy vs. Frontend-Only Adaptation

| Architectural Area | Original Full-Stack Course Model | Frontend-Only Adaptation Implemented Here |
|---|---|---|
| **Data Ingestion** | Database read from PostgreSQL/SQLite | Local fixture datasets (`dishes.ts`, `orders.ts`, `users.ts`) |
| **Order Mutations** | Server Actions (`"use server"`) writing to database | Frontend mock services (`mock-order-service.ts`) with in-memory persistence |
| **Authentication** | HMAC session cookies, Web Crypto middleware, bcrypt/scrypt hashes | Client `AuthContext` with 1-click identity switching among fictitious profiles |
| **Real-time Status** | Server-Sent Events (SSE) Route Handler (`/api/orders/[id]/stream`) | In-memory simulated EventSource stream (`subscribeToOrderStatus`) with timer |
| **Session Lifetime** | Durable database rows across browser restarts | Resets on full page reload (in-memory mock store) |

---

## 4. Templates and Route Groups Explanation

### Why Addis Eats Uses Layouts Instead of Templates
- **`layout.tsx`** preserves component state, avoids remounting, and maintains DOM trees across child route transitions. In Addis Eats, the `/menu` category sidebar lives in `app/menu/layout.tsx`. As users navigate between the catalog and individual dish details (`/menu/[id]`), the sidebar remains mounted without layout shifts or re-rendering flashes.
- **`template.tsx`** creates a brand-new instance for each navigation, remounting DOM elements and resetting state. It is ideal for enter/exit page transition animations or per-page logging, but would degrade performance if used for persistent navigation shells like our category sidebar.

### Route Groups (`(groupName)`)
- Route groups allow organizing route files into logical folders (e.g. `(marketing)` vs `(customer)` vs `(staff)`) without affecting the public URL pathname. In this project, routes follow a direct semantic URL structure (`/menu`, `/orders`, `/kitchen`, `/dashboard`), which keeps breadcrumb mapping and allowlist verification straightforward.
