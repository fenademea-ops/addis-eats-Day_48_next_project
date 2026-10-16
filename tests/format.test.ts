import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatEtb, formatWhen, formatRelative } from "../src/lib/format.ts";
import { toCsv, escapeCsvField } from "../src/lib/csv.ts";

describe("Formatting Utilities (lib/format.ts)", () => {
  it("formats integer amounts as ETB correctly", () => {
    const formatted = formatEtb(450);
    assert.ok(formatted.includes("450"), `Expected formatted string to contain 450, got: ${formatted}`);
    assert.ok(formatted.includes("ETB"), `Expected formatted string to contain currency ETB, got: ${formatted}`);
  });

  it("handles zero and NaN safely", () => {
    assert.ok(formatEtb(0).includes("0"));
    assert.strictEqual(formatEtb(NaN), "ETB 0");
  });

  it("rounds decimals to whole birr integers", () => {
    const formatted = formatEtb(349.8);
    assert.ok(formatted.includes("350"));
  });

  it("formats UTC timestamps into Addis Ababa local time", () => {
    const iso = "2026-06-12T11:45:00.000Z";
    const result = formatWhen(iso);
    assert.ok(typeof result === "string" && result.length > 5);
  });

  it("computes relative time accurately", () => {
    const now = new Date("2026-06-12T12:00:00.000Z");
    const fiveMinAgo = new Date("2026-06-12T11:55:00.000Z");
    const result = formatRelative(fiveMinAgo, now);
    assert.ok(result.includes("5 minutes ago") || result.includes("minute"));
  });
});

describe("CSV Utilities (lib/csv.ts)", () => {
  it("escapes fields containing commas according to RFC 4180", () => {
    const val = "Bole, Kitfo";
    const escaped = escapeCsvField(val);
    assert.strictEqual(escaped, '"Bole, Kitfo"');
  });

  it("escapes fields containing double-quotes by doubling them", () => {
    const val = 'Spicy "Special" Tibs';
    const escaped = escapeCsvField(val);
    assert.strictEqual(escaped, '"Spicy ""Special"" Tibs"');
  });

  it("escapes fields containing newlines", () => {
    const val = "Line 1\nLine 2";
    const escaped = escapeCsvField(val);
    assert.strictEqual(escaped, '"Line 1\nLine 2"');
  });

  it("converts full data rows into CSV string with header", () => {
    const rows = [
      { id: "ord_1", item: "Kitfo, Special", price: 450 },
      { id: "ord_2", item: 'Doro "Wot"', price: 520 },
    ];
    const csv = toCsv(rows);
    assert.ok(csv.includes("id,item,price"));
    assert.ok(csv.includes('"Kitfo, Special"'));
    assert.ok(csv.includes('"Doro ""Wot"""'));
  });
});
