export function renderNutrients(
  nutrients: string | Record<string, string>,
): string {
  if (typeof nutrients === "string") {
    return nutrients;
  }
  return Object.entries(nutrients)
    .map(([key, val]) => `${key}: ${val}`)
    .join(" | ");
}
