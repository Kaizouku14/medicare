import { describe, it, expect } from "vitest";
import { isFoodRecArray, isDayMealArray } from "@/lib/ai/services/meal-planner";

const validFoodRec = {
  foodId: "oatmeal",
  name: "Oatmeal",
  description: "Steel-cut oats",
  estimatedCost: 25,
  nutrients: "Fiber",
  reason: "Low GI",
};

const validDayMeal = {
  day: "Monday",
  breakfast: "Oatmeal",
  lunch: "Rice",
  dinner: "Fish",
  snacks: ["Banana"],
  totalCost: 120,
};

describe("isFoodRecArray", () => {
  it("accepts valid array", () => {
    expect(isFoodRecArray([validFoodRec])).toBe(true);
  });

  it("accepts multiple items", () => {
    expect(isFoodRecArray([validFoodRec, validFoodRec])).toBe(true);
  });

  it("rejects empty array", () => {
    expect(isFoodRecArray([])).toBe(false);
  });

  it("rejects non-array", () => {
    expect(isFoodRecArray(null)).toBe(false);
    expect(isFoodRecArray(undefined)).toBe(false);
    expect(isFoodRecArray("string")).toBe(false);
    expect(isFoodRecArray(42)).toBe(false);
  });

  it("rejects array with missing name", () => {
    expect(isFoodRecArray([{ ...validFoodRec, name: undefined }])).toBe(false);
  });

  it("rejects array with non-number cost", () => {
    expect(isFoodRecArray([{ ...validFoodRec, estimatedCost: "free" }])).toBe(false);
  });

  it("rejects array with missing description", () => {
    expect(isFoodRecArray([{ ...validFoodRec, description: null }])).toBe(false);
  });

  it("accepts nutrients as object", () => {
    expect(isFoodRecArray([{ ...validFoodRec, nutrients: { Protein: "20g" } }])).toBe(true);
  });
});

describe("isDayMealArray", () => {
  it("accepts valid array", () => {
    expect(isDayMealArray([validDayMeal])).toBe(true);
  });

  it("accepts 7-day array", () => {
    const week = Array(7).fill(validDayMeal);
    expect(isDayMealArray(week)).toBe(true);
  });

  it("rejects empty array", () => {
    expect(isDayMealArray([])).toBe(false);
  });

  it("rejects non-array", () => {
    expect(isDayMealArray(null)).toBe(false);
    expect(isDayMealArray({})).toBe(false);
  });

  it("rejects array with missing day", () => {
    expect(isDayMealArray([{ ...validDayMeal, day: undefined }])).toBe(false);
  });

  it("rejects array with non-array snacks", () => {
    expect(isDayMealArray([{ ...validDayMeal, snacks: "banana" }])).toBe(false);
  });

  it("rejects array with non-number totalCost", () => {
    expect(isDayMealArray([{ ...validDayMeal, totalCost: "free" }])).toBe(false);
  });

  it("rejects array with missing dinner", () => {
    expect(isDayMealArray([{ ...validDayMeal, dinner: null }])).toBe(false);
  });
});
