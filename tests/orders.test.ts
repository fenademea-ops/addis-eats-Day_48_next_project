import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  cancelOrder,
  createOrder,
  getOrderById,
  updateKitchenStatus,
  resetMockOrderStore,
} from "../src/lib/services/mock-order-service.ts";
import { DEMO_USERS } from "../src/lib/fixtures/users.ts";

describe("Order Security and Idempotency (lib/services/mock-order-service.ts)", () => {
  beforeEach(() => {
    resetMockOrderStore();
  });

  it("Attack 1: Refuses signed-out mutation call (cancelOrder)", async () => {
    // Attempting to cancel an order without being signed in (currentUser = null)
    const result = await cancelOrder("ord_812", null);

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Authentication required.");
  });

  it("Attack 2: Refuses customer A mutating customer B order (IDOR)", async () => {
    // ord_201 is owned by Customer B (Sara Haile, usr_cust_2)
    // Customer A (Abebe Bikila, usr_cust_1) attempts to cancel it
    const customerA = DEMO_USERS.customer;
    const result = await cancelOrder("ord_201", customerA);

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Order not found or permission denied.");
  });

  it("Allows legitimate owner to cancel order in 'received' state", async () => {
    // ord_812 is owned by Customer A (usr_cust_1) and is currently in 'received' state
    const customerA = DEMO_USERS.customer;
    const result = await cancelOrder("ord_812", customerA);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.order?.status, "cancelled");
  });

  it("Prevents double submission via idempotency key", async () => {
    const customerA = DEMO_USERS.customer;
    const idempotencyKey = `idem_test_${Date.now()}`;

    const orderInput = {
      customerName: "Abebe Bikila",
      phone: "+251911223344",
      address: "Bole Atlas, Cameroon St",
      items: [{ dishId: "kitfo", quantity: 2 }],
      idempotencyKey,
    };

    // First submission
    const firstResult = await createOrder(orderInput, customerA);
    assert.strictEqual(firstResult.success, true);
    const firstOrderId = firstResult.order?.id;

    // Second submission with exact same idempotency key
    const secondResult = await createOrder(orderInput, customerA);
    assert.strictEqual(secondResult.success, true);
    assert.strictEqual(secondResult.order?.id, firstOrderId);
  });

  it("Enforces ownership check when reading order details", async () => {
    const customerA = DEMO_USERS.customer;

    // Customer A reading own order
    const ownOrder = await getOrderById("ord_812", customerA);
    assert.strictEqual(ownOrder.success, true);
    assert.strictEqual(ownOrder.order?.id, "ord_812");

    // Customer A attempting to read Customer B's order
    const otherOrder = await getOrderById("ord_201", customerA);
    assert.strictEqual(otherOrder.success, false);
    assert.strictEqual(otherOrder.error, "Order not found or permission denied.");
  });

  it("Enforces staff role for kitchen order mutations", async () => {
    const customer = DEMO_USERS.customer;
    const staff = DEMO_USERS.staff;

    // Customer attempts kitchen update -> refused
    const customerAttempt = await updateKitchenStatus("ord_812", "preparing", customer);
    assert.strictEqual(customerAttempt.success, false);
    assert.strictEqual(customerAttempt.error, "Staff permissions required.");

    // Staff attempts kitchen update -> succeeds
    const staffAttempt = await updateKitchenStatus("ord_812", "preparing", staff);
    assert.strictEqual(staffAttempt.success, true);
    assert.strictEqual(staffAttempt.order?.status, "preparing");
  });
});
