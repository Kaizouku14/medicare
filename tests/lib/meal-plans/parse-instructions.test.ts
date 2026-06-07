import { describe, it, expect } from "vitest";
import { parseInstructions } from "@/lib/meal-plans/parse-instructions";

describe("parseInstructions", () => {
  it("splits numbered instructions and strips prefixes", () => {
    expect(
      parseInstructions(
        "1. Cook chicken and rice until very soft. 2. Blend until smooth. 3. Add broth to reach desired consistency.",
      ),
    ).toEqual([
      "Cook chicken and rice until very soft.",
      "Blend until smooth.",
      "Add broth to reach desired consistency.",
    ]);
  });

  it("splits unnumbered instructions on period-space", () => {
    expect(parseInstructions("Cook rice. Fry eggs. Serve together.")).toEqual([
      "Cook rice.",
      "Fry eggs.",
      "Serve together.",
    ]);
  });

  it("handles numbers inside instruction text without stripping them", () => {
    expect(parseInstructions("Boil 2 cups water. Add 1 cup rice. Simmer 15 min.")).toEqual([
      "Boil 2 cups water.",
      "Add 1 cup rice.",
      "Simmer 15 min.",
    ]);
  });

  it("handles mixed format (numbered with text containing numbers)", () => {
    expect(
      parseInstructions("1. Boil 2 cups water. 2. Add 1 cup rice. 3. Simmer 15 min."),
    ).toEqual(["Boil 2 cups water.", "Add 1 cup rice.", "Simmer 15 min."]);
  });

  it("returns single step when there is no period-space delimiter", () => {
    expect(parseInstructions("Cook until tender.")).toEqual(["Cook until tender."]);
  });

  it("handles empty string", () => {
    expect(parseInstructions("")).toEqual([]);
  });

  it("trims whitespace from each step", () => {
    expect(parseInstructions("Step one.   Step two.  Step three.")).toEqual([
      "Step one.",
      "Step two.",
      "Step three.",
    ]);
  });

  it("handles instructions that already end with period", () => {
    expect(
      parseInstructions("1. Wash rice. 2. Cook rice. 3. Serve."),
    ).toEqual(["Wash rice.", "Cook rice.", "Serve."]);
  });

  it("adds trailing period to steps missing it", () => {
    expect(parseInstructions("Chop onions. Fry garlic")).toEqual([
      "Chop onions.",
      "Fry garlic.",
    ]);
  });

  it("handles single-digit and multi-digit step numbers", () => {
    expect(
      parseInstructions("1. First. 10. Tenth. 100. Hundredth."),
    ).toEqual(["First.", "Tenth.", "Hundredth."]);
  });
});
