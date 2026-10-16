# Addis Eats — Frontend-Only Next.js Web Application

[![Next.js](https://img.shields.io/badge/Next.js-16.4.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-31%20passing-emerald)](https://nodejs.org/api/test.html)

> **Live Deployment URL**: `[DEPLOYED_VERCEL_URL_PLACEHOLDER]` *(To be added upon deployment)*

---

## 1. What It Is and Who It's For

**Addis Eats** is a food-ordering web application delivering authentic Ethiopian culinary staples across Addis Ababa neighborhoods (Bole, Kazanchis, Megenagna, Piassa, and Sarbet). 

This application represents the complete **Days 36–50 Capstone Project** for the CodeOps Module 3 course. As instructed, this build is **frontend-only**: all databases, server actions, backend route handlers, and real payment processors are simulated through local fixture data, in-memory state, and mock service contracts.

---

## 2. Key Features

- **Menu Discovery & Search (`/menu`)**: Debounced text search, category filtering, numbered URL pagination (`?page=2`), and persistent nested layout sidebar (`app/menu/layout.tsx`).
- **Static Dish Detail Pages (`/menu/[id]`)**: Pre-rendered at build time with `generateStaticParams()`, Open Graph 1200×630 image generation, and schema.org `MenuItem` JSON-LD.
- **Client Shopping Cart (`/cart`)**: Persistent across navigation via React Context (`CartContext`), increments quantity on duplicate additions, and calculates integer ETB subtotals.
- **Hardened Checkout Demonstration (`/checkout`)**: Idempotency key tracking, double-submit prevention, and inline field validation.
- **Order History Table (`/orders`)**: Accessible semantic `<table>` with URL sorting (`?sort=total&dir=desc`), numbered pagination, 4 forced demo states (`?demo=empty|error|slow`), and RFC 4180 CSV export.
- **Order Status & Polling (`/orders/[id]`)**: SWR-powered 5-second polling interval seeded from fixture data, auto-cleaning on terminal status (`delivered` or `cancelled`).
- **Interactive Delivery Tracking (`/track/[id]`)**: Dynamically loaded Leaflet map (`next/dynamic` with `ssr: false`), courier coordinates, accessible text alternative, and mock EventSource live status push.
- **Staff Operations Dashboard (`/dashboard`)**: Server-aggregated metrics passed to client Recharts bar (`RevenueChart`) and line (`OrdersPerDayChart`) leaves with fixed container heights (`h-72`).
- **Demo Identity Provider (`/signin`)**: 1-click persona switcher (Customer, Customer B, Kitchen Staff, Signed Out) with open redirect rejection (`isSafeRedirectPath`).

---

## 3. Getting Started

### Prerequisites
- Node.js `v20.0.0` or later (tested on Node `v24.19.0`)
- npm `v10.0.0` or later

### Installation
```bash
# Clone repository
git clone <repository-url>
cd addis-eats

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Running Locally
```bash
# Start development server
npm run dev
# App will be accessible at http://localhost:3000
```

### Production Build & Automated Tests
```bash
# Run unit & integration test suite (31 tests)
npm test

# Build production bundle with Next.js Turbopack
npm run build

# Start production server
npm run start
```

---

## 4. Environment Variables

Documented in `.env.example`:

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for Open Graph images, sitemaps, and robots | `http://localhost:3000` |

> [!IMPORTANT]
> Because this is a frontend-only project, no secret keys or database credentials exist. Variables prefixed with `NEXT_PUBLIC_` are public and inlined at build time.

---

## 5. Demo Personas and Forcing States

### Demo Identities
Access `/signin` to switch identities in 1 click:
1. **Customer A (Abebe Bikila)**: `customer@addiseats.local` (Default customer; owns `ord_812`, `ord_811`, `ord_810`).
2. **Customer B (Sara Haile)**: `sara@addiseats.local` (Customer for IDOR testing; owns `ord_201`).
3. **Kitchen Staff (Head Chef)**: `kitchen@addiseats.local` (Permitted to view `/kitchen` and `/dashboard`).
4. **Signed Out**: Tests unauthenticated error handling.

### How to Force Visual States
On `/orders`, append query parameters to demonstrate UI resilience:
- `/orders?demo=empty`: Forces the empty state ("No orders yet").
- `/orders?demo=error`: Forces simulated service failure with a retry button.
- `/orders?demo=slow`: Simulates a 1.5-second network delay before rendering.

---

## 6. The Three Attack Verifications

Tested against the mock service layer in `tests/orders.test.ts` and `tests/redirect.test.ts`:
1. **Attack 1 (Signed-Out Mutation)**: Calling `cancelOrder("ord_812", null)` returns `{ success: false, error: "Authentication required." }` without crashing ([`mock-order-service.ts#L270`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/lib/services/mock-order-service.ts#L270)).
2. **Attack 2 (IDOR Cross-Customer Mutation)**: Customer A calling `cancelOrder("ord_201", customerA)` returns `{ success: false, error: "Order not found or permission denied." }` ([`mock-order-service.ts#L282`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/lib/services/mock-order-service.ts#L282)).
3. **Attack 3 (Open Redirect)**: Accessing `/signin?next=https://example.com` or `//malicious.com` sanitizes destination to `/` ([`safe-redirect.ts#L32`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/lib/safe-redirect.ts#L32)).

---

## 7. Course Mapping: Days 36–50 Implementation Status

| Course Day | Topic | Frontend-Only Implementation | Excluded / Adapted Backend Feature |
|---|---|---|---|
| **Day 36** | Project Intro & Routing | App Router structure (`app/`, layouts, pages) | None |
| **Day 37** | Layouts & Nested Routes | Nested `/menu/layout.tsx` keeping sidebar mounted | None |
| **Day 38** | Server vs Client Components | Presentation components default to Server Components | None |
| **Day 39** | Mutations & Forms | Checkout form with `onSubmit`, idempotency key, pending state | Excluded: Server Actions (`"use server"`), DB writes |
| **Day 40** | Validation & Errors | Accessible error messages beside fields on blur & submit | Excluded: Server-side validation schema |
| **Day 41** | Client Data Fetching | SWR polling (5s interval) on `/orders/[id]`, debounced search | Excluded: Route handlers (`app/api`) |
| **Day 42** | Authentication | Mock identity provider (`AuthContext`), 1-click switcher | Excluded: Real passwords, JWT, database sessions |
| **Day 43** | Performance Optimization | `next/image` with `sizes`, `next/font`, code splitting | None |
| **Day 44** | Metadata & SEO | `metadataBase`, dynamic OG images, `sitemap.ts`, `robots.ts`, JSON-LD | None |
| **Day 45** | Security & Capstone Prep | Three attacks verified, decision tables in docs | Excluded: Server-side middleware session verification |
| **Day 46** | Data Representation | `/dashboard` Recharts bar/line charts, accessible tables | Excluded: Database aggregation (done on server fixtures) |
| **Day 47** | Maps, Streaming & Formats | Leaflet map (`/track/[id]`), mock EventSource stream, CSV export | Excluded: Real SSE route handler (`/api/orders/stream`) |
| **Day 48** | Events & Interaction | Semantic HTML, no clickable divs, touch targets ≥ 44px | None |
| **Days 49–50** | Capstone Finishing | Comprehensive docs (`AUTH.md`, `DATA.md`, etc.), 31 automated tests | Excluded: Real production backend deployment |

---

## 8. Vercel Deployment and Rollback Steps

### Deploying to Vercel
1. Push project repository to GitHub:
   ```bash
   git add .
   git commit -m "Complete Addis Eats Days 36-50 Capstone"
   git push origin main
   ```
2. Log into [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set the Framework Preset to **Next.js**.
5. In **Environment Variables**, configure:
   - `NEXT_PUBLIC_SITE_URL`: `https://<your-project>.vercel.app`
6. Click **Deploy**.
7. Once deployed, verify live routes (`/`, `/menu`, `/cart`, `/checkout`, `/orders`, `/dashboard`, `/track/ord_812`).
8. Copy the live production URL and replace `[DEPLOYED_VERCEL_URL_PLACEHOLDER]` at the top of this `README.md`.

### Rollback Guidance
If a regression occurs on production:
1. Open the **Deployments** tab in your Vercel Dashboard.
2. Locate the previous successful deployment.
3. Click the three dots (`...`) menu and select **"Instant Rollback"**.
4. Confirm rollback; traffic redirects immediately to the previous deployment.
