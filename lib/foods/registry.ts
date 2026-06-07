export type NutritionInfo = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type CanonicalFood = {
  id: string;
  name: string;
  category: "protein" | "vegetable" | "fruit" | "grain" | "dairy" | "legume" | "fat" | "condiment" | "beverage" | "other";
  tags: string[];
  nutrition: NutritionInfo;
};

const FOODS: CanonicalFood[] = [
  { id: "rice", name: "Rice", category: "grain", tags: ["staple", "filipino"], nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 } },
  { id: "brown-rice", name: "Brown Rice", category: "grain", tags: ["staple", "whole-grain"], nutrition: { calories: 111, protein: 2.6, carbs: 23, fat: 0.9 } },
  { id: "oatmeal", name: "Oatmeal", category: "grain", tags: ["breakfast", "fiber"], nutrition: { calories: 71, protein: 2.5, carbs: 12, fat: 1.4 } },
  { id: "chicken", name: "Chicken", category: "protein", tags: ["lean", "poultry"], nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6 } },
  { id: "chicken-adobo", name: "Chicken Adobo", category: "protein", tags: ["filipino", "stew"], nutrition: { calories: 180, protein: 25, carbs: 5, fat: 7 } },
  { id: "pork-adobo", name: "Pork Adobo", category: "protein", tags: ["filipino", "stew"], nutrition: { calories: 250, protein: 22, carbs: 4, fat: 16 } },
  { id: "fish-tilapia", name: "Tilapia", category: "protein", tags: ["fish", "freshwater"], nutrition: { calories: 96, protein: 20, carbs: 0, fat: 1.7 } },
  { id: "fish-bangus", name: "Bangus (Milkfish)", category: "protein", tags: ["fish", "filipino"], nutrition: { calories: 190, protein: 20, carbs: 0, fat: 12 } },
  { id: "fish-tuna", name: "Tuna", category: "protein", tags: ["fish", "canned"], nutrition: { calories: 130, protein: 28, carbs: 0, fat: 1.4 } },
  { id: "fish-dilis", name: "Dilis (Anchovies)", category: "protein", tags: ["fish", "dried"], nutrition: { calories: 210, protein: 29, carbs: 0, fat: 10 } },
  { id: "shrimp", name: "Shrimp", category: "protein", tags: ["seafood"], nutrition: { calories: 85, protein: 20, carbs: 0, fat: 0.5 } },
  { id: "tofu", name: "Tofu", category: "protein", tags: ["vegetarian", "soy"], nutrition: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 } },
  { id: "egg", name: "Egg", category: "protein", tags: ["breakfast", "affordable"], nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11 } },
  { id: "beef", name: "Beef", category: "protein", tags: ["red-meat", "iron"], nutrition: { calories: 250, protein: 26, carbs: 0, fat: 15 } },
  { id: "pork", name: "Pork", category: "protein", tags: ["red-meat"], nutrition: { calories: 242, protein: 27, carbs: 0, fat: 14 } },
  { id: "mongo-beans", name: "Mongo Beans", category: "legume", tags: ["filipino", "fiber"], nutrition: { calories: 118, protein: 7.8, carbs: 21, fat: 0.6 } },
  { id: "chickpeas", name: "Chickpeas", category: "legume", tags: ["fiber", "protein"], nutrition: { calories: 139, protein: 7.6, carbs: 23, fat: 2.6 } },
  { id: "lentils", name: "Lentils", category: "legume", tags: ["fiber", "protein"], nutrition: { calories: 116, protein: 9, carbs: 20, fat: 0.4 } },
  { id: "pechay", name: "Pechay (Bok Choy)", category: "vegetable", tags: ["leafy", "filipino"], nutrition: { calories: 13, protein: 1.5, carbs: 2.2, fat: 0.2 } },
  { id: "kangkong", name: "Kangkong (Water Spinach)", category: "vegetable", tags: ["leafy", "filipino"], nutrition: { calories: 19, protein: 2.6, carbs: 3.1, fat: 0.2 } },
  { id: "malunggay", name: "Malunggay (Moringa)", category: "vegetable", tags: ["leafy", "filipino", "nutritious"], nutrition: { calories: 64, protein: 9.4, carbs: 8.3, fat: 1.4 } },
  { id: "ampalaya", name: "Ampalaya (Bitter Gourd)", category: "vegetable", tags: ["filipino", "diabetes"], nutrition: { calories: 17, protein: 0.9, carbs: 3.7, fat: 0.2 } },
  { id: "calabasa", name: "Calabaza (Squash)", category: "vegetable", tags: ["filipino", "vitamin-a"], nutrition: { calories: 26, protein: 1, carbs: 6.5, fat: 0.1 } },
  { id: "okra", name: "Okra", category: "vegetable", tags: ["fiber", "filipino"], nutrition: { calories: 31, protein: 2, carbs: 7.5, fat: 0.1 } },
  { id: "eggplant", name: "Eggplant", category: "vegetable", tags: ["filipino"], nutrition: { calories: 25, protein: 1, carbs: 6, fat: 0.2 } },
  { id: "carrot", name: "Carrot", category: "vegetable", tags: ["vitamin-a"], nutrition: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 } },
  { id: "broccoli", name: "Broccoli", category: "vegetable", tags: ["cruciferous"], nutrition: { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4 } },
  { id: "camote", name: "Camote (Sweet Potato)", category: "vegetable", tags: ["root", "fiber", "vitamin-a"], nutrition: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 } },
  { id: "potato", name: "Potato", category: "vegetable", tags: ["root", "carb"], nutrition: { calories: 77, protein: 2, carbs: 17, fat: 0.1 } },
  { id: "banana", name: "Banana", category: "fruit", tags: ["potassium", "affordable"], nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 } },
  { id: "saging-na-saba", name: "Saging na Saba (Cooking Banana)", category: "fruit", tags: ["filipino", "carb"], nutrition: { calories: 122, protein: 1.2, carbs: 32, fat: 0.3 } },
  { id: "papaya", name: "Papaya", category: "fruit", tags: ["vitamin-c", "fiber"], nutrition: { calories: 43, protein: 0.5, carbs: 11, fat: 0.1 } },
  { id: "mango", name: "Mango", category: "fruit", tags: ["vitamin-c", "seasonal"], nutrition: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 } },
  { id: "pineapple", name: "Pineapple", category: "fruit", tags: ["vitamin-c"], nutrition: { calories: 50, protein: 0.5, carbs: 13, fat: 0.1 } },
  { id: "watermelon", name: "Watermelon", category: "fruit", tags: ["hydration"], nutrition: { calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2 } },
  { id: "guyabano", name: "Guyabano (Soursop)", category: "fruit", tags: ["vitamin-c"], nutrition: { calories: 66, protein: 1, carbs: 16, fat: 0.3 } },
  { id: "dalandan", name: "Dalandan (Citrus)", category: "fruit", tags: ["vitamin-c"], nutrition: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 } },
  { id: "milk", name: "Milk", category: "dairy", tags: ["calcium", "protein"], nutrition: { calories: 42, protein: 3.4, carbs: 5, fat: 1 } },
  { id: "yogurt", name: "Yogurt", category: "dairy", tags: ["probiotic", "calcium"], nutrition: { calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3 } },
  { id: "cheese", name: "Cheese", category: "dairy", tags: ["calcium", "protein"], nutrition: { calories: 404, protein: 25, carbs: 1.3, fat: 33 } },
  { id: "coconut-milk", name: "Coconut Milk", category: "fat", tags: ["filipino", "creamer"], nutrition: { calories: 230, protein: 2.3, carbs: 5.5, fat: 24 } },
  { id: "cooking-oil", name: "Cooking Oil", category: "fat", tags: ["frying"], nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
  { id: "olive-oil", name: "Olive Oil", category: "fat", tags: ["healthy-fat"], nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
  { id: "peanut-butter", name: "Peanut Butter", category: "fat", tags: ["protein", "healthy-fat"], nutrition: { calories: 588, protein: 25, carbs: 20, fat: 50 } },
  { id: "salmon", name: "Salmon", category: "protein", tags: ["fish", "omega-3"], nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13 } },
  { id: "corned-beef", name: "Corned Beef", category: "protein", tags: ["canned", "affordable"], nutrition: { calories: 213, protein: 22, carbs: 0, fat: 14 } },
  { id: "ginisang-ampalaya", name: "Ginisang Ampalaya", category: "vegetable", tags: ["filipino", "diabetes"], nutrition: { calories: 45, protein: 2, carbs: 5, fat: 2 } },
  { id: "tinolang-manok", name: "Tinolang Manok", category: "protein", tags: ["filipino", "soup"], nutrition: { calories: 95, protein: 15, carbs: 3, fat: 2.5 } },
  { id: "sinigang-na-bangus", name: "Sinigang na Bangus", category: "protein", tags: ["filipino", "soup"], nutrition: { calories: 110, protein: 16, carbs: 4, fat: 3.5 } },
  { id: "nilagang-baka", name: "Nilagang Baka", category: "protein", tags: ["filipino", "soup"], nutrition: { calories: 135, protein: 18, carbs: 5, fat: 4.5 } },
  { id: "lugaw", name: "Lugaw (Rice Porridge)", category: "grain", tags: ["filipino", "breakfast", "soft"], nutrition: { calories: 75, protein: 1.8, carbs: 15, fat: 0.8 } },
  { id: "goto", name: "Goto (Beef Tripes Porridge)", category: "grain", tags: ["filipino", "breakfast"], nutrition: { calories: 90, protein: 4, carbs: 14, fat: 2 } },
  { id: "champorado", name: "Champorado (Chocolate Rice)", category: "grain", tags: ["filipino", "breakfast"], nutrition: { calories: 120, protein: 2, carbs: 25, fat: 1.5 } },
  { id: "puto", name: "Puto (Rice Cake)", category: "grain", tags: ["filipino", "snack"], nutrition: { calories: 95, protein: 1.5, carbs: 21, fat: 0.5 } },
  { id: "gabi", name: "Gabi (Taro)", category: "vegetable", tags: ["root"], nutrition: { calories: 112, protein: 1.5, carbs: 26, fat: 0.2 } },
  { id: "tokwa", name: "Tokwa (Firm Tofu)", category: "protein", tags: ["vegetarian", "soy"], nutrition: { calories: 145, protein: 16, carbs: 3, fat: 9 } },
  { id: "itlog-na-pula", name: "Itlog na Pula (Salted Egg)", category: "protein", tags: ["filipino", "preserved"], nutrition: { calories: 175, protein: 13, carbs: 1, fat: 13 } },
  { id: "daing-na-bangus", name: "Daing na Bangus (Marinated Milkfish)", category: "protein", tags: ["filipino", "fried"], nutrition: { calories: 230, protein: 18, carbs: 3, fat: 16 } },
  { id: "tuyo", name: "Tuyo (Dried Fish)", category: "protein", tags: ["filipino", "dried"], nutrition: { calories: 280, protein: 32, carbs: 0, fat: 16 } },
  { id: "gulaman", name: "Gulaman (Seaweed Gelatin)", category: "other", tags: ["filipino", "dessert"], nutrition: { calories: 40, protein: 0.5, carbs: 10, fat: 0 } },
  { id: "sago", name: "Sago", category: "other", tags: ["filipino", "dessert"], nutrition: { calories: 80, protein: 0.1, carbs: 20, fat: 0 } },
  { id: "macaroni", name: "Macaroni", category: "grain", tags: ["pasta"], nutrition: { calories: 131, protein: 4.7, carbs: 27, fat: 0.6 } },
  { id: "whole-wheat-bread", name: "Whole Wheat Bread", category: "grain", tags: ["whole-grain"], nutrition: { calories: 247, protein: 13, carbs: 41, fat: 3.4 } },
  { id: "oatmeal-cookies", name: "Oatmeal Cookies", category: "grain", tags: ["snack"], nutrition: { calories: 450, protein: 6, carbs: 68, fat: 18 } },
  { id: "corn", name: "Corn", category: "grain", tags: ["whole-grain", "fiber"], nutrition: { calories: 96, protein: 3.4, carbs: 21, fat: 1.5 } },
];

const foodById = new Map<string, CanonicalFood>();
for (const f of FOODS) {
  foodById.set(f.id, f);
}

export function getFoodById(id: string): CanonicalFood | undefined {
  return foodById.get(id);
}

export const FOOD_REFERENCE_LIST = FOODS.map((f) => ({
  id: f.id,
  name: f.name,
  category: f.category,
  nutrition: f.nutrition,
}));
