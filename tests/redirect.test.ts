import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isSafeRedirectPath } from "../src/lib/safe-redirect.ts";

describe("Safe Redirect Validation (lib/safe-redirect.ts)", () => {
  it("allows safe internal application routes", () => {
    assert.strictEqual(isSafeRedirectPath("/orders"), "/orders");
    assert.strictEqual(isSafeRedirectPath("/menu"), "/menu");
    assert.strictEqual(isSafeRedirectPath("/checkout"), "/checkout");
    assert.strictEqual(isSafeRedirectPath("/kitchen"), "/kitchen");
    assert.strictEqual(isSafeRedirectPath("/dashboard"), "/dashboard");
    assert.strictEqual(isSafeRedirectPath("/orders/ord_812"), "/orders/ord_812");
  });

  it("rejects absolute URLs pointing to external domains (Attack 3)", () => {
    assert.strictEqual(isSafeRedirectPath("https://example.com"), "/");
    assert.strictEqual(isSafeRedirectPath("http://malicious.org/phish"), "/");
    assert.strictEqual(isSafeRedirectPath("javascript:alert(1)"), "/");
  });

  it("rejects protocol-relative URLs (Attack 3 variant)", () => {
    assert.strictEqual(isSafeRedirectPath("//example.com"), "/");
    assert.strictEqual(isSafeRedirectPath("//malicious.site/login"), "/");
  });

  it("rejects backslash and mixed slash-backslash variants (Attack 3 variant)", () => {
    assert.strictEqual(isSafeRedirectPath("/\\example.com"), "/");
    assert.strictEqual(isSafeRedirectPath("\\example.com"), "/");
    assert.strictEqual(isSafeRedirectPath("/\\/example.com"), "/");
  });

  it("falls back to '/' on null, undefined, or empty strings", () => {
    assert.strictEqual(isSafeRedirectPath(null), "/");
    assert.strictEqual(isSafeRedirectPath(undefined), "/");
    assert.strictEqual(isSafeRedirectPath(""), "/");
    assert.strictEqual(isSafeRedirectPath("   "), "/");
  });
});
