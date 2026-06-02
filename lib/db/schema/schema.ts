import {
  index,
  integer,
  jsonb,
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
  heightCm: numeric("height_cm", { precision: 5, scale: 1 }),
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

export const patientDocuments = pgTable("patient_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  storagePath: text("storage_path").notNull(),
  analysis: jsonb("analysis"),
  analyzedAt: timestamp("analyzed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id").references(() => patients.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull().default("Chat with AI"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_chat_sessions_user_id").on(table.userId),
    index("idx_chat_sessions_user_updated").on(table.userId, table.updatedAt),
  ],
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_chat_messages_session_id").on(table.sessionId)],
);

export const medications = pgTable("medications", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  route: text("route").notNull().default("oral"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const visitNotes = pgTable("visit_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  type: text("type").notNull().default("checkup"),
  notes: text("notes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const mealPlans = pgTable("meal_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  weekStart: text("week_start").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  meals: jsonb("meals").notNull(),
  totalDailyCost: numeric("total_daily_cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
