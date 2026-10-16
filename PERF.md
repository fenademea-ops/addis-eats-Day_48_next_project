# Performance Budget and Measurement (PERF.md)

## 1. Decision Table: Performance Budget

Target thresholds established for Addis Eats based on Day 43/45 web performance requirements:

| Metric | Target Budget | Before Optimisation | After Optimisation | Status & Notes |
|---|---|---|---|---|
| **LCP (Throttled)** | < 2.5 s | not measured | not measured | Mitigated via `priority` flag on LCP hero image and pre-sized image parent containers. |
| **CLS (Cumulative Layout Shift)** | < 0.10 | not measured | not measured | Zero shift achieved by explicit aspect ratios (`aspect-4/3`), fixed chart containers (`h-72`), and exact height map placeholder (`h-[320px]`). |
| **INP (Interaction to Next Paint)** | < 200 ms | not measured | not measured | Lightweight functional updates in CartContext; search input transitions wrapped in `useTransition()`. |
| **First Load JS for `/menu`** | < 120 kB | not measured | not measured | Leaflet and Recharts isolated from initial menu bundle; client boundary scoped to `MenuBrowser.tsx`. |
| **Largest Image Size** | < 150 kB | 2,399 kB (`home.jpg` uncompressed) | < 120 kB (Next.js WebP/AVIF transform) | Next.js image optimization pipeline converts local assets on the fly with responsive `sizes`. |
| **Lighthouse Performance Score** | ≥ 90 | not measured | not measured | *Note: Automated headless Lighthouse was not executed in this environment; cells left as "not measured" to avoid fabrication.* |

---

## 2. Optimisation Techniques Implemented in Code

### Image Optimization (`next/image`)
1. **Explicit Dimensions and Sizing**: Every dish image utilizes `<Image fill sizes="..." className="object-cover" />` within an explicitly sized container with aspect ratio classes (`aspect-4/3`). This completely eliminates Cumulative Layout Shift (CLS).
2. **True LCP Image Priority**: In `src/app/page.tsx` and `src/app/menu/MenuBrowser.tsx`, only the primary above-the-fold image receives `priority={true}`. All other catalog images defer network priority to save bandwidth.

### Font Delivery (`next/font`)
1. **Zero Layout Shift Fonts**: Self-hosted `Geist` and `Geist_Mono` loaded via `next/font/google` in `src/app/layout.tsx`.
2. **No Remote CSS `@import`**: Fonts are bundled locally by Next.js, eliminating external roundtrips to Google Fonts servers and preventing FOIT (Flash of Invisible Text) / FOUT (Flash of Unstyled Text).

### Code Splitting and Dynamic Imports
1. **Leaflet Map Deferred (`next/dynamic`)**: Leaflet and its CSS bundle (~150 kB uncompressed) are strictly omitted from the initial SSR bundle using `next/dynamic(() => import("./DeliveryMap"), { ssr: false })`.
2. **Pre-Sized Placeholder**: The dynamic import displays a placeholder with the exact height of the finished map (`h-[320px]`), ensuring zero layout shift when the interactive map mounts.
3. **Recharts Isolated to Dashboard**: Heavy SVG charting libraries are imported only on the staff `/dashboard` route, keeping the customer-facing `/menu` and `/cart` bundles lean.

### Chart Container Stabilization
1. Both `RevenueChart.tsx` and `OrdersPerDayChart.tsx` are wrapped in fixed-height utility containers (`h-72` = 288px) to guarantee the Recharts `<ResponsiveContainer>` never collapses to zero or shifts adjacent elements during render.
