import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const feedingMethodEnum = pgEnum("feeding_method", [
  "oral",
  "ngt-soft",
  "ngt-pureed",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
  diagnoses: text("diagnoses").array().notNull().default([]),
  feedingMethod: feedingMethodEnum("feeding_method").notNull(),
  allergies: text("allergies").array().notNull().default([]),
  intolerances: text("intolerances").array().notNull().default([]),
  monthlyBudgetPhp: numeric("monthly_budget_php", {
    precision: 10,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
