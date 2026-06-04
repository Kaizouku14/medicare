export type CanonicalFood = {
  id: string;
  name: string;
  category: "protein" | "vegetable" | "fruit" | "grain" | "dairy" | "legume" | "fat" | "condiment" | "beverage" | "other";
  tags: string[];
};

const FOODS: CanonicalFood[] = [
  { id: "rice", name: "Rice", category: "grain", tags: ["staple", "filipino"] },
  { id: "brown-rice", name: "Brown Rice", category: "grain", tags: ["staple", "whole-grain"] },
  { id: "oatmeal", name: "Oatmeal", category: "grain", tags: ["breakfast", "fiber"] },
  { id: "chicken", name: "Chicken", category: "protein", tags: ["lean", "poultry"] },
  { id: "chicken-adobo", name: "Chicken Adobo", category: "protein", tags: ["filipino", "stew"] },
  { id: "pork-adobo", name: "Pork Adobo", category: "protein", tags: ["filipino", "stew"] },
  { id: "fish-tilapia", name: "Tilapia", category: "protein", tags: ["fish", "freshwater"] },
  { id: "fish-bangus", name: "Bangus (Milkfish)", category: "protein", tags: ["fish", "filipino"] },
  { id: "fish-tuna", name: "Tuna", category: "protein", tags: ["fish", "canned"] },
  { id: "fish-dilis", name: "Dilis (Anchovies)", category: "protein", tags: ["fish", "dried"] },
  { id: "shrimp", name: "Shrimp", category: "protein", tags: ["seafood"] },
  { id: "tofu", name: "Tofu", category: "protein", tags: ["vegetarian", "soy"] },
  { id: "egg", name: "Egg", category: "protein", tags: ["breakfast", "affordable"] },
  { id: "beef", name: "Beef", category: "protein", tags: ["red-meat", "iron"] },
  { id: "pork", name: "Pork", category: "protein", tags: ["red-meat"] },
  { id: "mongo-beans", name: "Mongo Beans", category: "legume", tags: ["filipino", "fiber"] },
  { id: "chickpeas", name: "Chickpeas", category: "legume", tags: ["fiber", "protein"] },
  { id: "lentils", name: "Lentils", category: "legume", tags: ["fiber", "protein"] },
  { id: "pechay", name: "Pechay (Bok Choy)", category: "vegetable", tags: ["leafy", "filipino"] },
  { id: "kangkong", name: "Kangkong (Water Spinach)", category: "vegetable", tags: ["leafy", "filipino"] },
  { id: "malunggay", name: "Malunggay (Moringa)", category: "vegetable", tags: ["leafy", "filipino", "nutritious"] },
  { id: "ampalaya", name: "Ampalaya (Bitter Gourd)", category: "vegetable", tags: ["filipino", "diabetes"] },
  { id: "calabasa", name: "Calabaza (Squash)", category: "vegetable", tags: ["filipino", "vitamin-a"] },
  { id: "okra", name: "Okra", category: "vegetable", tags: ["fiber", "fiber"] },
  { id: "eggplant", name: "Eggplant", category: "vegetable", tags: ["filipino"] },
  { id: "carrot", name: "Carrot", category: "vegetable", tags: ["vitamin-a"] },
  { id: "broccoli", name: "Broccoli", category: "vegetable", tags: ["cruciferous"] },
  { id: "camote", name: "Camote (Sweet Potato)", category: "vegetable", tags: ["root", "fiber", "vitamin-a"] },
  { id: "potato", name: "Potato", category: "vegetable", tags: ["root", "carb"] },
  { id: "banana", name: "Banana", category: "fruit", tags: ["potassium", "affordable"] },
  { id: "saging-na-saba", name: "Saging na Saba (Cooking Banana)", category: "fruit", tags: ["filipino", "carb"] },
  { id: "papaya", name: "Papaya", category: "fruit", tags: ["vitamin-c", "fiber"] },
  { id: "mango", name: "Mango", category: "fruit", tags: ["vitamin-c", "seasonal"] },
  { id: "pineapple", name: "Pineapple", category: "fruit", tags: ["vitamin-c"] },
  { id: "watermelon", name: "Watermelon", category: "fruit", tags: ["hydration"] },
  { id: "guyabano", name: "Guyabano (Soursop)", category: "fruit", tags: ["vitamin-c"] },
  { id: "dalandan", name: "Dalandan (Citrus)", category: "fruit", tags: ["vitamin-c"] },
  { id: "milk", name: "Milk", category: "dairy", tags: ["calcium", "protein"] },
  { id: "yogurt", name: "Yogurt", category: "dairy", tags: ["probiotic", "calcium"] },
  { id: "cheese", name: "Cheese", category: "dairy", tags: ["calcium", "protein"] },
  { id: "coconut-milk", name: "Coconut Milk", category: "fat", tags: ["filipino", "creamer"] },
  { id: "cooking-oil", name: "Cooking Oil", category: "fat", tags: ["frying"] },
  { id: "olive-oil", name: "Olive Oil", category: "fat", tags: ["healthy-fat"] },
  { id: "peanut-butter", name: "Peanut Butter", category: "fat", tags: ["protein", "healthy-fat"] },
  { id: "salmon", name: "Salmon", category: "protein", tags: ["fish", "omega-3"] },
  { id: "corned-beef", name: "Corned Beef", category: "protein", tags: ["canned", "affordable"] },
  { id: "ginisang-ampalaya", name: "Ginisang Ampalaya", category: "vegetable", tags: ["filipino", "diabetes"] },
  { id: "tinolang-manok", name: "Tinolang Manok", category: "protein", tags: ["filipino", "soup"] },
  { id: "sinigang-na-bangus", name: "Sinigang na Bangus", category: "protein", tags: ["filipino", "soup"] },
  { id: "nilagang-baka", name: "Nilagang Baka", category: "protein", tags: ["filipino", "soup"] },
  { id: "lugaw", name: "Lugaw (Rice Porridge)", category: "grain", tags: ["filipino", "breakfast", "soft"] },
  { id: "goto", name: "Goto (Beef Tripes Porridge)", category: "grain", tags: ["filipino", "breakfast"] },
  { id: "champorado", name: "Champorado (Chocolate Rice)", category: "grain", tags: ["filipino", "breakfast"] },
  { id: "puto", name: "Puto (Rice Cake)", category: "grain", tags: ["filipino", "snack"] },
  { id: "kamote", name: "Kamote (Sweet Potato)", category: "vegetable", tags: ["root", "fiber", "vitamin-a"] },
  { id: "gabi", name: "Gabi (Taro)", category: "vegetable", tags: ["root"] },
  { id: "tokwa", name: "Tokwa (Firm Tofu)", category: "protein", tags: ["vegetarian", "soy"] },
  { id: "itlog-na-pula", name: "Itlog na Pula (Salted Egg)", category: "protein", tags: ["filipino", "preserved"] },
  { id: "daing-na-bangus", name: "Daing na Bangus (Marinated Milkfish)", category: "protein", tags: ["filipino", "fried"] },
  { id: "tuyo", name: "Tuyo (Dried Fish)", category: "protein", tags: ["filipino", "dried"] },
  { id: "gulaman", name: "Gulaman (Seaweed Gelatin)", category: "other", tags: ["filipino", "dessert"] },
  { id: "sago", name: "Sago", category: "other", tags: ["filipino", "dessert"] },
  { id: "macaroni", name: "Macaroni", category: "grain", tags: ["pasta"] },
  { id: "whole-wheat-bread", name: "Whole Wheat Bread", category: "grain", tags: ["whole-grain"] },
  { id: "oatmeal-cookies", name: "Oatmeal Cookies", category: "grain", tags: ["snack"] },
  { id: "corn", name: "Corn", category: "grain", tags: ["whole-grain", "fiber"] },
];

const foodById = new Map<string, CanonicalFood>();
const foodByName = new Map<string, CanonicalFood>();

for (const f of FOODS) {
  foodById.set(f.id, f);
  foodByName.set(f.name.toLowerCase(), f);
}

export function getFoodById(id: string): CanonicalFood | undefined {
  return foodById.get(id);
}

function getFoodByName(name: string): CanonicalFood | undefined {
  return foodByName.get(name.trim().toLowerCase());
}

function searchFoods(query: string): CanonicalFood[] {
  const q = query.toLowerCase();
  return FOODS.filter((f) =>
    f.name.toLowerCase().includes(q) ||
    f.tags.some((t) => t.includes(q)) ||
    f.id.includes(q),
  );
}

function getFoodsByCategory(category: CanonicalFood["category"]): CanonicalFood[] {
  return FOODS.filter((f) => f.category === category);
}

export const FOOD_REFERENCE_LIST = FOODS.map((f) => ({ id: f.id, name: f.name, category: f.category }));
