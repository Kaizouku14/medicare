import { describe, it, expect } from "vitest";

function formatCurrency(n: number) {
  return `₱${n.toLocaleString()}`;
}

describe("formatCurrency", () => {
  it("formats whole numbers", () => {
    expect(formatCurrency(1000)).toBe("₱1,000");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("₱0");
  });

  it("formats large numbers", () => {
    expect(formatCurrency(1500000)).toBe("₱1,500,000");
  });
});
