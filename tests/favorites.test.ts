import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Favorites Business Logic and State Transformations", () => {
  it("toggles favorite addition and removal correctly", () => {
    let favorites: string[] = [];

    // Toggle add dish
    const toggle = (list: string[], id: string) =>
      list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

    favorites = toggle(favorites, "doro-wot");
    assert.deepStrictEqual(favorites, ["doro-wot"]);
    assert.strictEqual(favorites.length, 1);

    // Toggle add second dish
    favorites = toggle(favorites, "kitfo");
    assert.deepStrictEqual(favorites, ["doro-wot", "kitfo"]);
    assert.strictEqual(favorites.length, 2);

    // Toggle remove first dish
    favorites = toggle(favorites, "doro-wot");
    assert.deepStrictEqual(favorites, ["kitfo"]);
    assert.strictEqual(favorites.length, 1);
  });

  it("removes favorite by specific ID", () => {
    let favorites = ["doro-wot", "kitfo", "shiro-tegamino"];
    favorites = favorites.filter((id) => id !== "kitfo");

    assert.deepStrictEqual(favorites, ["doro-wot", "shiro-tegamino"]);
    assert.strictEqual(favorites.length, 2);
  });

  it("clears all favorites", () => {
    let favorites = ["doro-wot", "kitfo"];
    favorites = [];
    assert.strictEqual(favorites.length, 0);
  });

  it("serializes and deserializes safely from JSON storage format", () => {
    const list = ["kitfo", "special-tibs"];
    const serialized = JSON.stringify(list);
    const parsed = JSON.parse(serialized);

    assert.ok(Array.isArray(parsed));
    assert.deepStrictEqual(parsed, list);
  });
});
