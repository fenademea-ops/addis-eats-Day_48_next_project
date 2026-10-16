# Data Architecture and Query Strategy (DATA.md)

## 1. Decision Table: Where Data is Fetched

Rule: **"Server unless the person triggers it."**

| Data Resource | Execution Location | Query / Key | Freshness & Refresh Rule | Architectural Reasoning |
|---|---|---|---|---|
| **Menu Catalog & Dish Details** | Server (SSG / Prerender) | Local Fixture (`FIXTURE_DISHES`) | Build-time static generation | Public, indexable content; zero client bundle overhead; instant TTFB. |
| **Menu Search & Category Filter** | Client (`MenuBrowser`) | `["dishes", category, q, page]` | `keepPreviousData: true`, 350ms debounce | Triggered by user typing and interactive category selection; retains previous results to prevent UI flashing. |
| **Shopping Cart** | Client (`CartContext`) | `addis_eats_cart` in localStorage | Synced on client mutations | Ephemeral user state before order creation; persists across page transitions. |
| **Order History Table** | Client (`OrdersView`) | `["orders", userId, role, sort, dir, page, demo]` | Revalidates on navigation or identity switch | Filtered by current mock persona; bound to URL query params (`?sort=total&page=1`). |
| **Order Status** | Client (`OrderDetailPage`) | `["order", id, userId]` | 5-second polling interval via SWR | Seeded from fixtures/memory for immediate initial view; polls every 5s until reaching terminal state (`delivered`/`cancelled`). |
| **Live Delivery Stream** | Client (`MapPanel`) | Mock EventSource subscription | Simulated real-time push (10s step timer) | Pushes courier coordinates and status changes; pauses when tab is hidden; auto-closes on delivery. |
| **Operations Dashboard** | Server (`DashboardPage`) | Server Aggregation | Build-time static computation | Aggregates revenue by neighborhood and daily volume; passes plain numbers to Recharts client leaves. |

---

## 2. Pagination vs. Infinite Scroll

In food ordering and order-history management, **numbered URL pagination (`?page=2`) is strictly superior to infinite scrolling**:
1. **Direct Shareability and Bookmarking**: A user or kitchen operator can bookmark or share page 2 directly.
2. **Accessible Keyboard Navigation**: Infinite scroll causes keyboard focus traps and makes accessing the page footer impossible for screen reader and keyboard-only users.
3. **Deterministic Page Size**: In our application, `/orders` uses a documented page size of 20, and `/menu` uses 6 items per page.
4. **Pager Controls are Links**: Every pagination control is a real Next.js `<Link>` with visible focus states and valid `href`, never an unstyled `<div onClick>`.

---

## 3. Real-Time Transport Trade-off Comparison

| Protocol | Latency | Server Complexity | Network Overhead | Addis Eats Evaluation |
|---|---|---|---|---|
| **Short Polling (5s)** | Medium (~5s) | Lowest (Stateless HTTP GET) | High (repeated request headers) | Chosen for Day 41 order status; simple, resilient, and automatically stops on terminal state. |
| **Server-Sent Events (SSE)** | Low (<100ms) | Low-Medium (HTTP streaming connection) | Very Low (single connection, text frames) | Mimicked on Day 47 via client mock stream; ideal for unidirectional courier tracking updates. |
| **WebSockets** | Lowest (<50ms) | High (Stateful duplex connection server) | Low (framing overhead) | Unnecessary for food tracking: orders only require one-way status pushes from the restaurant to the customer. |

### Future Backend SSE Route Handler Framing (Reference Example)
In a production backend, the SSE stream would be served by an App Router route handler as follows:

```js
// Future app/api/orders/[id]/stream/route.js (Backend work, not implemented in this build)
export async function GET(request, { params }) {
  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial data frame
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: "received" })}\n\n`));

      const interval = setInterval(async () => {
        const order = await db.orders.findById(id);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(order)}\n\n`));
        if (order.status === "delivered") {
          clearInterval(interval);
          controller.close();
        }
      }, 5000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
```

---

## 4. TanStack Query Equivalent (Comparison Guide)

While this project uses **SWR** (as specified in Day 41), here is the equivalent TanStack Query (React Query) pattern with explicit cache parameters:

```ts
// TanStack Query Equivalent Pattern
import { useQuery } from "@tanstack/react-query";

const { data, isLoading } = useQuery({
  queryKey: ["orders", userId, sortKey, sortDir, page],
  queryFn: () => listOrders({ userId, sort: sortKey, dir: sortDir, page }),
  // staleTime: Duration (ms) before data is considered stale and re-fetched on window focus
  staleTime: 1000 * 60 * 2, // 2 minutes
  // gcTime (formerly cacheTime): Duration unused cache entries remain in memory before garbage collection
  gcTime: 1000 * 60 * 10,   // 10 minutes
  placeholderData: (previousData) => previousData, // Equivalent to SWR keepPreviousData: true
});
```
