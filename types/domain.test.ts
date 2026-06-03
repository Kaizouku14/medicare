import { describe, it, expect } from "vitest";
import { renderNutrients, FEEDING_METHODS } from "./domain";

describe("renderNutrients", () => {
  it("returns a string as-is", () => {
    expect(renderNutrients("Protein, Fiber, Iron")).toBe("Protein, Fiber, Iron");
  });

  it("joins an object with pipe separator", () => {
    expect(renderNutrients({ Protein: "20g", Fiber: "5g" })).toBe("Protein: 20g | Fiber: 5g");
  });

  it("returns empty string for empty object", () => {
    expect(renderNutrients({})).toBe("");
  });

  it("handles single-entry object", () => {
    expect(renderNutrients({ Calories: "200" })).toBe("Calories: 200");
  });

  it("handles many entries", () => {
    expect(
      renderNutrients({ A: "1", B: "2", C: "3", D: "4" }),
    ).toBe("A: 1 | B: 2 | C: 3 | D: 4");
  });
});

describe("FEEDING_METHODS", () => {
  it("contains three methods", () => {
    expect(FEEDING_METHODS).toEqual(["oral", "ngt-soft", "ngt-pureed"]);
  });
});
