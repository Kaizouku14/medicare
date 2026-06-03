import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden")).toBe("base");
  });

  it("resolves conflicting utilities (last wins)", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("filters falsy values", () => {
    expect(cn("a", null, undefined, false, "", "b")).toBe("a b");
  });

  it("handles array inputs", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("handles object inputs", () => {
    expect(cn({ a: true, b: false, c: true })).toBe("a c");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});
