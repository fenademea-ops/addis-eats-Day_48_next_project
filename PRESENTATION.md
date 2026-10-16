# Presentation Guide and Defense (PRESENTATION.md)

## 1. Eight-Minute Presentation Outline

### Minute 0:00 – 1:00: Purpose and Persona
- **Application Overview**: Addis Eats is a food-ordering web application delivering authentic Ethiopian culinary staples across Addis Ababa neighborhoods.
- **Architectural Scope**: Built strictly as a frontend-only Next.js App Router application. Fixture datasets and an in-memory service layer simulate authenticated personas, order lifecycles, and real-time courier dispatch without touching a real database.

### Minute 1:00 – 3:00: Live Customer Flow Demonstration
- **Browse Menu (`/menu`)**: Demonstrate debounced search for "tibs", category filtering for "Vegetarian", and URL-based pagination (`?page=2`).
- **Dish Detail (`/menu/[id]`)**: Show prebuilt SSG dish page, ingredients list, and interactive `AddToCartControl`.
- **Cart (`/cart`)**: Show line item quantities, duplicate item increments, and integer ETB subtotals.
- **Checkout (`/checkout`)**: Demonstrate keyboard submission via Enter (`onSubmit`), input validation on blur, and double-submit prevention. Show immediate transition to `/orders/[id]`.

### Minute 3:00 – 4:30: Key Architectural Decision: Server vs. Client Boundary
- Demonstrate how Server Components are preserved by default.
- Walk through `/dashboard`: raw fixture orders are aggregated entirely on the server into minimal plain numbers/arrays. Heavy charting libraries (Recharts) are isolated strictly as client leaves with fixed-height containers to prevent layout shift.

### Minute 4:30 – 6:00: The Three Security Attack Verifications
- **Attack 1**: Demonstrate signed-out cancellation refusal at [`mock-order-service.ts#L270`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/lib/services/mock-order-service.ts#L270).
- **Attack 2**: Demonstrate IDOR refusal when Customer A attempts to mutate Customer B's order at [`mock-order-service.ts#L282`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/lib/services/mock-order-service.ts#L282).
- **Attack 3**: Demonstrate open redirect neutralization when passing `/signin?next=https://malicious.com` at [`safe-redirect.ts#L32`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/lib/safe-redirect.ts#L32).

### Minute 6:00 – 7:00: Performance and Accessibility
- Review `PERF.md` optimizations: zero CLS via explicit aspect ratios and Leaflet dynamic import placeholders.
- Demonstrate keyboard-only navigation: Tab/Shift-Tab, Space, Enter on forms, and Escape key handling on mobile menus.

### Minute 7:00 – 8:00: Roadmap and Questions
- Recap Musts vs. Coulds triaged in `FUTURE.md`.
- Conclude on readiness for Module 4 backend integration.

---

## 2. Five Files to Have Open During Presentation

1. **Server Component Architecture**:
   [`src/app/dashboard/page.tsx`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/app/dashboard/page.tsx)
   *Why*: Demonstrates clean server-side data aggregation passing small, plain serializable summaries to client leaves.
2. **Client Leaf & Dynamic Import**:
   [`src/components/track/MapPanel.tsx`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/components/track/MapPanel.tsx)
   *Why*: Illustrates how heavy browser-only libraries (Leaflet) are dynamically imported with `ssr: false` and a sized placeholder to prevent layout shifts.
3. **Protected Mock Action with Both Checks**:
   [`src/lib/services/mock-order-service.ts`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/lib/services/mock-order-service.ts#L265-L295)
   *Why*: Contains `cancelOrder()`, showing exact line guards stopping Attack 1 (unauthenticated caller) and Attack 2 (cross-customer IDOR).
4. **Data Query & URL Synchronization**:
   [`src/app/menu/MenuBrowser.tsx`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/app/menu/MenuBrowser.tsx)
   *Why*: Shows debounced search transitions, SWR query key coordination, and `keepPreviousData: true` list retention.
5. **Interactive Event Refactor**:
   [`src/components/DishCard.tsx`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/components/DishCard.tsx)
   *Why*: Shows how the entire card navigates via a real `<Link>`, while the nested "Add" `<button>` uses `stopPropagation()` to prevent unwanted navigation.

---

## 3. Honest Answers to Likely Technical Questions

### Q1: Why is MenuBrowser a Client Component while MenuPage is a Server Component?
**Answer**: `MenuPage` is a Server Component that receives initial query parameters. `MenuBrowser` must be a Client Component because it manages immediate keyboard keystrokes, executes a 350ms debounce timer via `useEffect`, and calls the SWR hook to maintain cache freshness while retaining previous results during transitions.

### Q2: What happens if a write operation is called while signed out?
**Answer**: The mock service refuses the call immediately, returning `{ success: false, error: "Authentication required." }`. It never throws an unhandled exception or crashes the UI.

### Q3: Why choose SSG for dish detail pages instead of on-demand rendering?
**Answer**: Our dish catalog is stable and deterministic. Using `generateStaticParams()` pre-builds all 12 dishes at build time, yielding static HTML, instant page loads from the edge, and pre-generated Open Graph image previews.

### Q4: What was the hardest part of building this frontend-only application?
**Answer**: Ensuring strict fidelity to realistic backend semantics without actually having a backend—specifically orchestrating EventSource mock streaming with tab-visibility pauses, maintaining idempotency across duplicate form submissions, and enforcing IDOR checks entirely within in-memory mock service contracts.

### Q5: What would you build with another week of development?
**Answer**: Transitioning to Module 4: replacing the in-memory array with a PostgreSQL database, adding real HTTP-only session cookies with Web Crypto middleware, and implementing a native SSE route handler for real-time driver telemetry.

---

## 4. Addressing the Ten "Most-Missed" Concepts in Code

1. **Stable Keys (Not Index)**: All mapped lists use stable identifiers (e.g. `dish.id` or `order.id`), never array indices.
2. **Functional State Updates**: State setters use functional callbacks (e.g. `setItems(prev => ...)` in `CartContext.tsx`) to prevent stale closure bugs.
3. **Effect Cleanup**: Every timer and subscription cleans up on unmount (`clearInterval`, `clearTimeout`, `unsubscribe` in `mock-order-service.ts` and `MapPanel.tsx`).
4. **No Async Client Components**: All Client Components are synchronous functions returning JSX; asynchronous data fetching is handled via hooks (`useSWR` / `useTransition`).
5. **Dynamic Opt-In via URL**: Acknowledged that accessing `searchParams` on pages opts routes into dynamic evaluation.
6. **Middleware is Not the Only Security Check**: Documented in `AUTH.md` that middleware is merely a routing guard; every mutation must verify authentication and ownership independently.
7. **Never Trust an ID from the Request**: The mock order service validates dish prices and user ownership authoritatively from fixture records rather than accepting client-provided totals.
8. **NEXT_PUBLIC is Public**: Documented in `.env.example` that `NEXT_PUBLIC_` variables are bundled directly into client JS and cannot store secrets.
9. **`metadataBase` for Previews**: Configured in root `layout.tsx` so all Open Graph image previews and sitemap URLs resolve to absolute canonical URLs.
10. **`onSubmit` Not `onClick`**: Checkout uses `<form onSubmit={handleSubmit}>`, enabling standard Enter-key submission and form validation.
