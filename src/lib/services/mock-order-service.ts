/**
 * Frontend Mock Order Service (Days 39–48)
 *
 * Implements in-memory session-persisted order repository,
 * query filtering, URL sorting/pagination, idempotency deduplication,
 * ownership enforcement, and EventSource-style simulated streaming.
 */

import { FIXTURE_ORDERS } from "../fixtures/orders.ts";
import type { Order, OrderItem, OrderStatus } from "../fixtures/orders.ts";
import { FIXTURE_DISHES } from "../fixtures/dishes.ts";
import type { DemoUser } from "../fixtures/users.ts";

// In-memory order store initialized with fixtures (resets on full browser reload)
let orderStore: Order[] = FIXTURE_ORDERS.map((o) => ({
  ...o,
  items: o.items.map((item) => ({ ...item })),
}));

// Processed idempotency keys to prevent duplicate submissions
const processedIdempotencyKeys = new Map<string, Order>();

export interface ListOrdersParams {
  userId?: string;
  role?: string;
  sort?: "date" | "total";
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  demo?: "empty" | "error" | "slow";
}

export interface ListOrdersResult {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  address: string;
  neighborhood?: "Bole" | "Kazanchis" | "Megenagna" | "Piassa" | "Sarbet";
  items: { dishId: string; quantity: number }[];
  idempotencyKey?: string;
}

export interface OrderServiceResult<T = Order> {
  success: boolean;
  order?: T | null;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Lists orders with sorting, pagination, and demo simulation flags.
 */
export async function listOrders(params: ListOrdersParams = {}): Promise<ListOrdersResult> {
  // Support forced demo states for evaluation
  if (params.demo === "slow") {
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  if (params.demo === "error") {
    throw new Error("Simulated order service error for demonstration.");
  }

  const pageSize = Math.max(1, params.pageSize || 20);

  if (params.demo === "empty") {
    return {
      orders: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    };
  }

  // Filter by user ID unless staff
  let filtered = [...orderStore];
  if (params.role !== "staff" && params.userId) {
    filtered = filtered.filter((o) => o.userId === params.userId);
  } else if (!params.userId && params.role !== "staff") {
    // Signed-out user cannot see orders
    return {
      orders: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    };
  }

  // Sort orders
  const sortKey = params.sort === "total" ? "total" : "date";
  const sortDir = params.dir === "asc" ? "asc" : "desc";

  filtered.sort((a, b) => {
    if (sortKey === "total") {
      return sortDir === "asc" ? a.subtotal - b.subtotal : b.subtotal - a.subtotal;
    }
    // Default: date
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortDir === "asc" ? timeA - timeB : timeB - timeA;
  });

  const total = filtered.length;
  const page = Math.max(1, params.page || 1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return {
    orders: paginated,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Retrieves a single order with ownership authorization.
 * Changing an order ID in /orders/[id] to another account's returns a refused state.
 */
export async function getOrderById(
  orderId: string,
  currentUser?: DemoUser | null
): Promise<OrderServiceResult<Order>> {
  if (!orderId) {
    return { success: false, error: "Order ID is required." };
  }

  const order = orderStore.find((o) => o.id === orderId);
  if (!order) {
    return { success: false, error: "Order not found." };
  }

  // Ownership verification check
  if (!currentUser) {
    return { success: false, error: "Authentication required to view order details." };
  }

  if (currentUser.role !== "staff" && order.userId !== currentUser.id) {
    return { success: false, error: "Order not found or permission denied." };
  }

  return { success: true, order: { ...order } };
}

/**
 * Creates a simulated order with idempotency check and authoritative pricing.
 */
export async function createOrder(
  input: CreateOrderInput,
  currentUser?: DemoUser | null
): Promise<OrderServiceResult<Order>> {
  // Check mock authentication
  if (!currentUser) {
    return { success: false, error: "You must be signed in to place an order." };
  }

  // Idempotency check: prevent duplicate submissions
  if (input.idempotencyKey && processedIdempotencyKeys.has(input.idempotencyKey)) {
    const existing = processedIdempotencyKeys.get(input.idempotencyKey)!;
    return { success: true, order: { ...existing } };
  }

  // Validate fields
  const fieldErrors: Record<string, string> = {};
  if (!input.customerName || input.customerName.trim().length < 2) {
    fieldErrors.customerName = "Name is required (at least 2 characters).";
  }

  const phonePattern = /^\+?[0-9\s-]{9,15}$/;
  if (!input.phone || !phonePattern.test(input.phone.trim())) {
    fieldErrors.phone = "Valid phone number is required (e.g., +251 91 122 3344).";
  }

  if (!input.address || input.address.trim().length < 5) {
    fieldErrors.address = "Delivery address is required (at least 5 characters).";
  }

  if (!input.items || input.items.length === 0) {
    fieldErrors.items = "Cart cannot be empty.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please resolve the form errors.", fieldErrors };
  }

  // Authoritative price calculation from fixture dishes (client prices not trusted)
  const orderItems: OrderItem[] = [];
  let calculatedSubtotal = 0;

  for (const item of input.items) {
    const dish = FIXTURE_DISHES.find((d) => d.id === item.dishId);
    if (!dish) {
      return { success: false, error: `Invalid item selected: ${item.dishId}` };
    }
    const qty = Math.max(1, Math.floor(item.quantity));
    const linePrice = dish.price;
    calculatedSubtotal += linePrice * qty;

    orderItems.push({
      dishId: dish.id,
      name: dish.name,
      price: linePrice,
      quantity: qty,
    });
  }

  const newOrderId = `ord_${Date.now().toString().slice(-6)}`;
  const neighborhood = input.neighborhood || "Bole";

  const newOrder: Order = {
    id: newOrderId,
    userId: currentUser.id,
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    neighborhood,
    items: orderItems,
    subtotal: Math.round(calculatedSubtotal),
    status: "received",
    createdAt: new Date().toISOString(),
    estimatedDeliveryMinutes: 30,
    courier: {
      name: "Mulugeta Tadesse",
      phone: "+251911998877",
      lat: 9.0010,
      lng: 38.7850,
    },
    deliveryLocation: {
      lat: 8.9950,
      lng: 38.7896,
      description: input.address.trim(),
    },
    idempotencyKey: input.idempotencyKey,
  };

  // Prepend to orderStore so it appears first in the session
  orderStore.unshift(newOrder);

  if (input.idempotencyKey) {
    processedIdempotencyKeys.set(input.idempotencyKey, newOrder);
  }

  return { success: true, order: { ...newOrder } };
}

/**
 * Cancels an order with rigorous authorization and status validation.
 *
 * Attack 1 protection:
 * Line 219: Refuses signed-out calls with error "Authentication required."
 *
 * Attack 2 protection:
 * Line 229: Refuses call from customer A on customer B's order ID with "Order not found or permission denied."
 */
export async function cancelOrder(
  orderId: string,
  currentUser?: DemoUser | null
): Promise<OrderServiceResult<Order>> {
  // Line 219: Attack 1 check - must be signed in
  if (!currentUser) {
    return { success: false, error: "Authentication required." };
  }

  const orderIndex = orderStore.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) {
    return { success: false, error: "Order not found." };
  }

  const targetOrder = orderStore[orderIndex];

  // Line 229: Attack 2 check - ownership authorization
  if (currentUser.role !== "staff" && targetOrder.userId !== currentUser.id) {
    return { success: false, error: "Order not found or permission denied." };
  }

  // Status check: only 'received' status can be cancelled
  if (targetOrder.status !== "received") {
    return {
      success: false,
      error: "Order can no longer be cancelled once preparation has started.",
    };
  }

  targetOrder.status = "cancelled";
  return { success: true, order: { ...targetOrder } };
}

/**
 * Updates order status for kitchen staff.
 * Refuses calls from non-staff roles.
 */
export async function updateKitchenStatus(
  orderId: string,
  newStatus: OrderStatus,
  currentUser?: DemoUser | null
): Promise<OrderServiceResult<Order>> {
  if (!currentUser || currentUser.role !== "staff") {
    return { success: false, error: "Staff permissions required." };
  }

  const target = orderStore.find((o) => o.id === orderId);
  if (!target) {
    return { success: false, error: "Order not found." };
  }

  target.status = newStatus;
  return { success: true, order: { ...target } };
}

/**
 * Mock Live Stream Subscription (Day 47)
 * Mimics EventSource semantics on the client without a backend SSE route.
 * Automatically progresses order status over time for demonstration,
 * pauses updates on tab hide, and cleans up when the order reaches 'delivered'.
 */
export function subscribeToOrderStatus(
  orderId: string,
  onMessage: (order: Order) => void,
  onError?: (err: Error) => void
): () => void {
  let isClosed = false;

  // Initial read
  const current = orderStore.find((o) => o.id === orderId);
  if (!current) {
    onError?.(new Error("Order not found in mock stream."));
    return () => {};
  }

  // Push seeded state immediately
  onMessage({ ...current });

  // If already in terminal state, don't set up polling/timer
  if (current.status === "delivered" || current.status === "cancelled") {
    return () => {};
  }

  // Simulated SSE progression: received -> preparing -> out_for_delivery -> delivered
  const statusCycle: OrderStatus[] = ["received", "preparing", "out_for_delivery", "delivered"];
  let currentIndex = statusCycle.indexOf(current.status);

  const timer = setInterval(() => {
    if (isClosed) return;

    // Respect tab visibility: pause progression while document is hidden
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }

    if (currentIndex < statusCycle.length - 1) {
      currentIndex++;
      const nextStatus = statusCycle[currentIndex];
      current.status = nextStatus;

      // Courier movement simulation
      if (nextStatus === "out_for_delivery" && current.courier) {
        current.courier.lat += (Math.random() - 0.5) * 0.002;
        current.courier.lng += (Math.random() - 0.5) * 0.002;
      }

      onMessage({ ...current });

      if (nextStatus === "delivered") {
        clearInterval(timer);
        isClosed = true;
      }
    } else {
      clearInterval(timer);
      isClosed = true;
    }
  }, 10000); // 10 second mock cycle interval

  return () => {
    isClosed = true;
    clearInterval(timer);
  };
}

/**
 * Resets the in-memory order store (useful for automated testing)
 */
export function resetMockOrderStore(): void {
  orderStore = FIXTURE_ORDERS.map((o) => ({
    ...o,
    items: o.items.map((item) => ({ ...item })),
  }));
  processedIdempotencyKeys.clear();
}
