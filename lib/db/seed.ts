import { db } from "@/lib/db";
import { users, patients, patientDocuments, mealPlans } from "@/lib/db/schema/schema";
import { FEEDING_METHODS, type DocumentAnalysis, type FoodRecommendation, type DayMeal } from "@/types/domain";

const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";
const TEST_PATIENT_1 = "00000000-0000-0000-0000-000000000010";
const TEST_PATIENT_2 = "00000000-0000-0000-0000-000000000011";
const TEST_PATIENT_3 = "00000000-0000-0000-0000-000000000012";

async function seed() {
  console.log("Seeding database...");

  await db.insert(users).values([
    {
      id: TEST_USER_ID,
      email: "test@example.com",
      name: "Maria Test",
    },
  ]).onConflictDoNothing();

  await db.insert(patients).values([
    {
      id: TEST_PATIENT_1,
      userId: TEST_USER_ID,
      name: "Juan Dela Cruz",
      age: 65,
      heightCm: "165.0",
      weightKg: "72.5",
      diagnoses: ["diabetes", "hypertension"],
      feedingMethod: FEEDING_METHODS[0],
      allergies: [],
      intolerances: ["lactose"],
      monthlyBudgetPhp: "5000",
    },
    {
      id: TEST_PATIENT_2,
      userId: TEST_USER_ID,
      name: "Maria Santos",
      age: 78,
      heightCm: "155.0",
      weightKg: "58.0",
      diagnoses: ["stroke", "ckd"],
      feedingMethod: FEEDING_METHODS[2],
      allergies: ["peanuts"],
      intolerances: [],
      monthlyBudgetPhp: "8000",
    },
    {
      id: TEST_PATIENT_3,
      userId: TEST_USER_ID,
      name: "Pedro Reyes",
      age: 55,
      heightCm: "172.0",
      weightKg: "90.0",
      diagnoses: ["high-cholesterol"],
      feedingMethod: FEEDING_METHODS[0],
      allergies: [],
      intolerances: [],
      monthlyBudgetPhp: "4000",
    },
  ]).onConflictDoNothing();

  const analysis: DocumentAnalysis = {
    documentType: "lab-results",
    summary: "Patient shows elevated blood glucose and creatinine levels, indicating poor glycemic control and reduced kidney function.",
    findings: "Fasting glucose at 180 mg/dL suggests diabetes management needs adjustment. Creatinine at 1.8 mg/dL indicates stage 3 CKD.",
    extractedValues: [
      {
        name: "Fasting Glucose",
        value: "180",
        unit: "mg/dL",
        referenceRange: "70-100",
        isAbnormal: true,
        interpretation: "Elevated — poor glycemic control",
      },
      {
        name: "Creatinine",
        value: "1.8",
        unit: "mg/dL",
        referenceRange: "0.6-1.2",
        isAbnormal: true,
        interpretation: "Above normal range — monitor kidney function",
      },
      {
        name: "Hemoglobin",
        value: "13.5",
        unit: "g/dL",
        referenceRange: "12.0-16.0",
        isAbnormal: false,
        interpretation: "Within normal range",
      },
    ],
    concerns: [
      "Uncontrolled blood sugar increases risk of diabetic complications",
      "Elevated creatinine warrants renal function monitoring",
    ],
    relevantDiagnoses: ["Diabetes Type 2", "Chronic Kidney Disease"],
    dietaryConsiderations: "Low glycemic index foods, reduced sodium, moderate protein restriction. Avoid high-potassium foods.",
  };

  await db.insert(patientDocuments).values([
    {
      patientId: TEST_PATIENT_1,
      fileName: "lab-results-march-2026.png",
      fileType: "image/png",
      storagePath: `${TEST_USER_ID}/${TEST_PATIENT_1}/doc-1.png`,
      analysis,
      analyzedAt: new Date(),
    },
  ]).onConflictDoNothing();

  const recommendations: FoodRecommendation[] = [
    {
      name: "Oatmeal",
      description: "Steel-cut oats with low-fat milk",
      estimatedCost: 25,
      nutrients: "Fiber, complex carbs",
      reason: "Low glycemic index helps manage blood sugar",
    },
    {
      name: "Grilled Fish",
      description: "Dagupan-style grilled bangus",
      estimatedCost: 80,
      nutrients: "Protein, Omega-3",
      reason: "Lean protein source, heart-healthy fats",
    },
  ];

  const meals: DayMeal[] = [
    {
      day: "Monday",
      breakfast: "Oatmeal with sliced banana",
      lunch: "Grilled bangus with steamed rice and pinakbet",
      dinner: "Chicken tinola with malunggay",
      snacks: ["Fresh papaya"],
      totalCost: 185,
    },
    {
      day: "Tuesday",
      breakfast: "Scrambled eggs with whole wheat toast",
      lunch: "Beef nilaga with vegetables",
      dinner: "Steamed fish with garlic rice",
      snacks: ["Graham crackers"],
      totalCost: 210,
    },
    {
      day: "Wednesday",
      breakfast: "Champorado with evaporated milk",
      lunch: "Pork sinigang with kangkong",
      dinner: "Grilled chicken breast with ensalada",
      snacks: ["Fresh guava"],
      totalCost: 195,
    },
    {
      day: "Thursday",
      breakfast: "Taho (silken tofu, sago, arnibal)",
      lunch: "Fish fillet with sweet potato fries",
      dinner: "Chicken afritada with brown rice",
      snacks: ["Cucumber sticks"],
      totalCost: 200,
    },
    {
      day: "Friday",
      breakfast: "Rice porridge (lugaw) with egg",
      lunch: "Beef mechado with vegetables",
      dinner: "Steamed lapu-lapu with ginger",
      snacks: ["Ripe mango"],
      totalCost: 220,
    },
    {
      day: "Saturday",
      breakfast: "Pandesal with cheese and fresh milk",
      lunch: "Chicken adobo with steamed rice",
      dinner: "Vegetable stir-fry with tofu",
      snacks: ["Popcorn"],
      totalCost: 175,
    },
    {
      day: "Sunday",
      breakfast: "Pan de coco with hot chocolate",
      lunch: "Roasted chicken with mashed potatoes",
      dinner: "Fish sinigang with labanos",
      snacks: ["Fresh buko juice"],
      totalCost: 230,
    },
  ];

  await db.insert(mealPlans).values([
    {
      patientId: TEST_PATIENT_1,
      weekStart: "2026-06-01",
      recommendations,
      meals,
      totalDailyCost: "202",
    },
  ]).onConflictDoNothing();

  console.log("Seed complete ✓");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
