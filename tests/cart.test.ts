import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FIXTURE_DISHES } from "../src/lib/fixtures/dishes.ts";

// Pure calculation helper reflecting CartContext state transformations
interface CartLine {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

function addItemToCart(items: CartLine[], dishId: string, quantity: number = 1): CartLine[] {
  const dish = FIXTURE_DISHES.find((d) => d.id === dishId);
  if (!dish) return items;

  const existingIndex = items.findIndex((i) => i.dishId === dishId);
  if (existingIndex > -1) {
    const next = [...items];
    next[existingIndex] = {
      ...next[existingIndex],
      quantity: next[existingIndex].quantity + quantity,
    };
    return next;
  }
  return [
    ...items,
    {
      dishId: dish.id,
      name: dish.name,
      price: Math.round(dish.price),
      quantity,
    },
  ];
}

function updateItemQuantity(items: CartLine[], dishId: string, quantity: number): CartLine[] {
  if (quantity <= 0) {
    return items.filter((i) => i.dishId !== dishId);
  }
  return items.map((i) => (i.dishId === dishId ? { ...i, quantity } : i));
}

function computeSubtotal(items: CartLine[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

describe("Cart Business Logic and Integer Currency (context/CartContext.tsx)", () => {
  it("adds a new item with unit price and initial quantity", () => {
    let cart: CartLine[] = [];
    cart = addItemToCart(cart, "kitfo", 1);

    assert.strictEqual(cart.length, 1);
    assert.strictEqual(cart[0].dishId, "kitfo");
    assert.strictEqual(cart[0].quantity, 1);
    assert.strictEqual(cart[0].price, 450);
    assert.strictEqual(computeSubtotal(cart), 450);
  });

  it("increments quantity instead of duplicating lines when adding the same dish", () => {
    let cart: CartLine[] = [];
    cart = addItemToCart(cart, "kitfo", 1);
    cart = addItemToCart(cart, "kitfo", 2); // Add 2 more

    assert.strictEqual(cart.length, 1, "Expected exactly 1 line item, not duplicate lines");
    assert.strictEqual(cart[0].quantity, 3);
    assert.strictEqual(computeSubtotal(cart), 1350); // 450 * 3
  });

  it("calculates multi-item subtotal in whole integer Birr (ETB)", () => {
    let cart: CartLine[] = [];
    cart = addItemToCart(cart, "kitfo", 2); // 450 * 2 = 900
    cart = addItemToCart(cart, "doro-wot", 1); // 520 * 1 = 520
    cart = addItemToCart(cart, "ethiopian-coffee", 3); // 80 * 3 = 240

    assert.strictEqual(cart.length, 3);
    assert.strictEqual(computeSubtotal(cart), 1660);
    assert.ok(Number.isInteger(computeSubtotal(cart)));
  });

  it("removes line item when quantity is decremented to 0", () => {
    let cart: CartLine[] = [];
    cart = addItemToCart(cart, "kitfo", 2);
    cart = updateItemQuantity(cart, "kitfo", 0);

    assert.strictEqual(cart.length, 0);
    assert.strictEqual(computeSubtotal(cart), 0);
  });
});
