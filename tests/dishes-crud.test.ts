import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getAllDishes,
  getDishById,
  createDish,
  updateDish,
  toggleDishAvailability,
  deleteDish,
  searchDishes,
  resetDishesToDefault,
} from "../src/lib/services/mock-dish-service.ts";
import { DEMO_USERS } from "../src/lib/fixtures/users.ts";

describe("Kitchen Menu Management CRUD & Availability (mock-dish-service.ts)", () => {
  const staffUser = DEMO_USERS.staff;
  const customerUser = DEMO_USERS.customer;

  it("prevents non-staff from creating a dish", async () => {
    const res = await createDish(
      {
        name: "Hacker Special",
        category: "Traditional",
        price: 100,
        description: "Unauthorized dish creation attempt",
      },
      customerUser
    );

    assert.strictEqual(res.success, false);
    assert.match(res.error || "", /Unauthorized/);
  });

  it("allows kitchen staff to create a new dish", async () => {
    const res = await createDish(
      {
        name: "Shiro Tegabino Clay Pot",
        category: "Vegetarian",
        price: 360,
        description: "Bubbling organic chickpea stew served in a hot earthenware pot with fresh injera.",
        prepTime: "12-15 min",
        spicy: false,
        isAvailable: true,
      },
      staffUser
    );

    assert.strictEqual(res.success, true);
    assert.ok(res.dish);
    assert.strictEqual(res.dish.name, "Shiro Tegabino Clay Pot");
    assert.strictEqual(res.dish.price, 360);
    assert.strictEqual(res.dish.isAvailable, true);

    // Verify it can be retrieved
    const fetched = await getDishById(res.dish.id);
    assert.ok(fetched);
    assert.strictEqual(fetched.name, "Shiro Tegabino Clay Pot");
  });

  it("allows kitchen staff to toggle availability to Sold Out (86'd) and back", async () => {
    const dishes = await getAllDishes();
    const target = dishes[0];

    // Toggle to Sold Out
    const toggle1 = await toggleDishAvailability(target.id, staffUser);
    assert.strictEqual(toggle1.success, true);
    assert.strictEqual(toggle1.dish?.isAvailable, false);

    // Verify via search
    const soldOutSearch = await searchDishes({ availability: "sold_out" });
    assert.ok(soldOutSearch.dishes.some((d) => d.id === target.id));

    // Toggle back to In Stock
    const toggle2 = await toggleDishAvailability(target.id, staffUser);
    assert.strictEqual(toggle2.success, true);
    assert.strictEqual(toggle2.dish?.isAvailable, true);
  });

  it("allows kitchen staff to update dish details", async () => {
    const dishes = await getAllDishes();
    const target = dishes[0];
    const newPrice = target.price + 50;

    const updateRes = await updateDish(
      target.id,
      {
        price: newPrice,
        description: "Updated chef description with highland herbs.",
      },
      staffUser
    );

    assert.strictEqual(updateRes.success, true);
    assert.strictEqual(updateRes.dish?.price, newPrice);
    assert.strictEqual(updateRes.dish?.description, "Updated chef description with highland herbs.");
  });

  it("prevents non-staff from deleting dishes", async () => {
    const dishes = await getAllDishes();
    const target = dishes[0];

    const res = await deleteDish(target.id, customerUser);
    assert.strictEqual(res.success, false);
    assert.match(res.error || "", /Unauthorized/);
  });

  it("allows kitchen staff to delete a dish and reset to defaults", async () => {
    // Create a temporary dish to delete
    const created = await createDish(
      {
        name: "Temporary Sampler",
        category: "Desserts",
        price: 200,
        description: "Temporary tasting sampler dish",
      },
      staffUser
    );
    assert.strictEqual(created.success, true);
    const tempId = created.dish!.id;

    // Delete it
    const deleteRes = await deleteDish(tempId, staffUser);
    assert.strictEqual(deleteRes.success, true);

    const check = await getDishById(tempId);
    assert.strictEqual(check, null);

    // Reset back to defaults
    const resetRes = await resetDishesToDefault(staffUser);
    assert.strictEqual(resetRes.success, true);
    assert.ok(resetRes.dishes.length >= 10);
  });
});
