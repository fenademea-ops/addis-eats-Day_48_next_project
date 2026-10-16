import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { searchDishes } from "../src/lib/services/mock-dish-service.ts";
import { listOrders } from "../src/lib/services/mock-order-service.ts";

describe("Search, Filter, and Pagination (lib/services/mock-dish-service.ts)", () => {
  it("filters dishes by category correctly", async () => {
    const vegResult = await searchDishes({ category: "Vegetarian" });
    assert.ok(vegResult.dishes.length > 0);
    assert.ok(vegResult.dishes.every((d) => d.category === "Vegetarian"));
  });

  it("filters dishes by search query", async () => {
    const kitfoResult = await searchDishes({ query: "kitfo" });
    assert.ok(kitfoResult.dishes.length >= 1);
    assert.strictEqual(kitfoResult.dishes[0].id, "kitfo");
  });

  it("paginates dishes according to page and pageSize", async () => {
    const page1 = await searchDishes({ page: 1, pageSize: 3 });
    const page2 = await searchDishes({ page: 2, pageSize: 3 });

    assert.strictEqual(page1.dishes.length, 3);
    assert.strictEqual(page2.dishes.length, 3);
    // Ensure pages do not have overlapping dishes
    assert.notStrictEqual(page1.dishes[0].id, page2.dishes[0].id);
  });

  it("returns all dishes when search query is empty", async () => {
    const allDishes = await searchDishes({ category: "All", query: "" });
    assert.ok(allDishes.total >= 10);
  });
});

describe("Order Listing and Sorting (lib/services/mock-order-service.ts)", () => {
  it("sorts orders by total descending", async () => {
    const result = await listOrders({
      role: "staff",
      sort: "total",
      dir: "desc",
    });

    assert.ok(result.orders.length > 1);
    for (let i = 0; i < result.orders.length - 1; i++) {
      assert.ok(
        result.orders[i].subtotal >= result.orders[i + 1].subtotal,
        `Expected ${result.orders[i].subtotal} >= ${result.orders[i + 1].subtotal}`
      );
    }
  });

  it("sorts orders by total ascending", async () => {
    const result = await listOrders({
      role: "staff",
      sort: "total",
      dir: "asc",
    });

    assert.ok(result.orders.length > 1);
    for (let i = 0; i < result.orders.length - 1; i++) {
      assert.ok(
        result.orders[i].subtotal <= result.orders[i + 1].subtotal,
        `Expected ${result.orders[i].subtotal} <= ${result.orders[i + 1].subtotal}`
      );
    }
  });

  it("handles demo empty flag correctly", async () => {
    const result = await listOrders({ demo: "empty" });
    assert.strictEqual(result.orders.length, 0);
    assert.strictEqual(result.total, 0);
  });
});
