# Future Roadmap and Scope Triage (FUTURE.md)

## 1. Feature Triage (MoSCoW Method)

### Must-Have (Delivered in this Build)
- [x] End-to-end food ordering customer flow: Browse Menu → Dish Details → Shopping Cart → Checkout → Order Details.
- [x] State preservation across client-side navigation using React Context (`CartContext` and `AuthContext`).
- [x] In-memory mock service layer protecting all mutations (Attack 1 & Attack 2 ownership refusal).
- [x] Double-submission prevention with client-generated idempotency keys.
- [x] Hardened return destination validation rejecting open redirects (`isSafeRedirectPath`).
- [x] SWR 5-second polling for order status with automatic cleanup on terminal state.
- [x] Semantic HTML, visible focus states, and keyboard/touch compliance.

### Should-Have (Delivered in this Build)
- [x] Staff operational dashboard with Recharts bar and line charts plus accessible data tables.
- [x] Interactive delivery tracking map with Leaflet dynamically imported.
- [x] Live EventSource stream simulation with status advancement and tab visibility pause.
- [x] RFC 4180 compliant CSV export for order records.
- [x] Four visual states (Loading, Empty, Error, Loaded) with forced demo flags (`?demo=empty|error|slow`).

### Could-Have (Deliberately Cut to Preserve Quality and Reliability)
- [ ] **Dynamic Theme Switcher (Light / Dark mode)**: The application features a rich, accessible dark theme with warm Ethiopian tones. A toggle was deferred to avoid stylesheet bloat.
- [ ] **Micro-Interaction Sound Effects**: Audio chimes on adding items to cart or order delivery were excluded.
- [ ] **Multi-Step Checkout Wizard**: Kept as a clean, accessible single-page form with immediate inline validation.
- [ ] **Live Courier Chat**: Simulated messaging with delivery drivers was omitted as out-of-scope for Module 3.

---

## 2. Transition to Module 4: Backend Replacement Guide

In Module 4, the frontend mock service layer will be replaced with real backend services without redesigning the UI components:

1. **Database Persistence**: Replace the in-memory array in `mock-order-service.ts` with a durable relational database (PostgreSQL via Drizzle ORM or Prisma).
2. **Real Authentication**: Replace `AuthContext` with secure HTTP-only session cookies and Auth.js / Supabase Auth.
3. **Real Server-Sent Events (SSE)**: Replace `subscribeToOrderStatus()` timer simulation with the native Next.js SSE Route Handler (`/api/orders/[id]/stream`) connected to a Redis pub/sub queue.
4. **Payment Gateway Integration**: Integrate Telebirr / Chapa / Stripe payment gateways with webhook listeners to confirm transactions before transitioning order status from `received` to `preparing`.
