# Authentication and Authorization (AUTH.md)

## 1. Decision Table: Who May See What

In this frontend-only build, every client-facing protection is an **interface guard** over the in-memory mock identity. True authorization cannot run solely inside the browser; a future backend service must enforce every security check.

| Route / Action | Who | Protected by | What that layer actually proves |
|---|---|---|---|
| `/`, `/menu`, `/menu/[id]` | Public (Everyone) | None | Public, statically prerendered and indexable content. No identity check required. |
| `/cart` | Public / Customer | Client State Provider (`CartContext`) | User's local shopping session in localStorage. Proves only client preferences; authoritative pricing is recalculated upon checkout. |
| `/checkout` | Any signed-in user | Interface Guard (`CheckoutPage`) + Mock Service session verification | User has selected an active mock identity. The mock service recalculates prices and prevents double-submission via idempotency keys. |
| `/orders` | Order Owner / Staff | Interface Guard (`OrdersView`) + Mock Service filter | Mock identity state only. Filters orders matching current `user.id`. In a real backend, queries must be scoped on the server via session cookies. |
| `/orders/[id]` | Order Owner / Staff | Interface Guard (`OrderDetailPage`) + Mock Service ownership check | Proves the signed-in mock identity matches `order.userId` or has the `staff` role. Mismatches return `{ success: false, error: "Order not found or permission denied." }`. |
| `/track/[id]` | Order Owner / Staff | Interface Guard (`TrackOrderPage`) + Map stream check | Visual mock live stream tracking. Text alternative provided for accessibility. |
| `/kitchen` | Staff Only | Interface Guard (`KitchenQueueView`) + `user.role === 'staff'` check | Proves only that the client interface is set to a staff persona. Rejects customer personas with a clear permission notice. |
| `/dashboard` | Staff Only | Server Component aggregation + Staff interface expectation | Presents aggregated operational metrics from fixture datasets. Plain serializable payloads passed to Recharts client leaves. |
| `createOrder` | Signed-in User | Mock Service check (`mock-order-service.ts`) | Refuses signed-out calls. Deduplicates requests by checking client idempotency keys against processed store. |
| `cancelOrder` | Order Owner | Mock Service check (`mock-order-service.ts`) | Validates authentication and verifies record ownership (`order.userId === currentUser.id`) and cancellable status (`received`). |
| `updateKitchenStatus` | Staff Only | Mock Service check (`mock-order-service.ts`) | Validates that `currentUser.role === 'staff'` before mutating order lifecycle state. |

---

## 2. The Three Attack Verifications (Frontend-Only Adaptation)

The course exercises test these attacks against server actions and database queries. In this frontend-only implementation, we test them against the mock service layer and return-destination validator. Every attack is actively tested in automated tests (`tests/orders.test.ts` and `tests/redirect.test.ts`):

### Attack 1: Signed-Out Mutation Call
- **Attack Vector**: An unauthenticated caller invokes `cancelOrder("ord_812", null)`.
- **Observed Result**: The mock service refuses the call gracefully and returns `{ success: false, error: "Authentication required." }` without crashing the application.
- **Exact Line Stopping the Attack**:
  [`src/lib/services/mock-order-service.ts#L270-L272`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/lib/services/mock-order-service.ts#L270-L272)
  ```ts
  // Line 270: Attack 1 check - must be signed in
  if (!currentUser) {
    return { success: false, error: "Authentication required." };
  }
  ```

### Attack 2: IDOR / Signed-In Customer A Mutating Customer B's Order
- **Attack Vector**: Customer A (`usr_cust_1`, Abebe Bikila) invokes `cancelOrder("ord_201", customerA)` targeting an order owned by Customer B (`usr_cust_2`, Sara Haile).
- **Observed Result**: Refused on ownership by the service layer, returning `{ success: false, error: "Order not found or permission denied." }`. The action is blocked regardless of client UI state.
- **Exact Line Stopping the Attack**:
  [`src/lib/services/mock-order-service.ts#L282-L284`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/lib/services/mock-order-service.ts#L282-L284)
  ```ts
  // Line 282: Attack 2 check - ownership authorization
  if (currentUser.role !== "staff" && targetOrder.userId !== currentUser.id) {
    return { success: false, error: "Order not found or permission denied." };
  }
  ```
- **Direct Order Lookup URL Modification**: Similarly, if a user navigates to `/orders/ord_201` while signed in as Customer A, [`src/lib/services/mock-order-service.ts#L148-L150`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/lib/services/mock-order-service.ts#L148-L150) stops the read:
  ```ts
  if (currentUser.role !== "staff" && order.userId !== currentUser.id) {
    return { success: false, error: "Order not found or permission denied." };
  }
  ```

### Attack 3: Open Redirect via `next` Parameter
- **Attack Vector**: Attacker provides `/signin?next=https://example.com`, `/signin?next=//malicious.com`, or `/signin?next=/\malicious.com`.
- **Observed Result**: The input is sanitized and rejected; the user is redirected safely to `/`.
- **Exact Lines Stopping the Attack**:
  [`src/lib/safe-redirect.ts#L32-L49`](file:///C:/Users/fena/Desktop/IBT/sq6-feneti-demissie/module-03-react-nextjs/Days/Day_48/addis-eats/src/lib/safe-redirect.ts#L32-L49)
  ```ts
  // Line 32: Reject protocol-relative and backslash variations
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\") || trimmed.startsWith("\\")) {
    return "/";
  }

  // Line 37: Reject any embedded backslashes
  if (trimmed.includes("\\")) {
    return "/";
  }

  // Line 42: Reject explicit schemes (https:, http:, javascript:, data:)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return "/";
  }
  ```

---

## 3. Safe Return Destinations

The sign-in interface validates the `next` query parameter against an allowlist of internal route prefixes:
`["/", "/menu", "/cart", "/checkout", "/orders", "/kitchen", "/dashboard", "/track", "/signin"]`.

Any value failing prefix matching, containing external hostnames, using backslashes, or using protocol-relative syntax (`//`) is immediately coerced to `/`.

---

## 4. Production Security Boundary (Gaps & Backend Requirements)

> [!WARNING]
> Because all of this runs in the browser, **none of this constitutes production security**. A malicious user can open DevTools, manipulate in-memory JavaScript variables, bypass client guards, or modify browser storage.

To promote this frontend application to production with real customer accounts and payments, a backend service must introduce:
1. **Server-Side Session Cookies**: HTTP-only, secure, SameSite=Lax HMAC-signed or encrypted session cookies (e.g. Iron Session, Auth.js, or Supabase Auth).
2. **Reverse Proxy / Middleware Verification**: Validating session signatures at the edge or gateway before routing requests to private handlers.
3. **Server-Side Authorization in Every Mutation**: Repeating session extraction, role validation, and resource ownership checks inside every API endpoint or Server Action. Never trust client claims.
4. **Session-Scoped Database Queries**: Querying database records using `WHERE id = $1 AND user_id = $session.user_id` so that IDOR attacks are structurally impossible at the SQL level.
5. **Durable Secret Storage**: Storing cryptographic signing keys and provider credentials in protected environment secrets, never exposed via `NEXT_PUBLIC_`.
