-- Drop old tables from the previous custom-auth schema
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS feeding_method CASCADE;

-- Apply new schema
CREATE TYPE "public"."feeding_method" AS ENUM('oral', 'ngt-soft', 'ngt-pureed');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "name" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "patients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade,
  "name" text NOT NULL,
  "age" integer NOT NULL,
  "weight_kg" numeric(5, 2),
  "diagnoses" text[] DEFAULT '{}' NOT NULL,
  "feeding_method" "feeding_method" NOT NULL,
  "allergies" text[] DEFAULT '{}' NOT NULL,
  "intolerances" text[] DEFAULT '{}' NOT NULL,
  "monthly_budget_php" numeric(10, 2) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "meal_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "patient_id" uuid NOT NULL REFERENCES "public"."patients"("id") ON DELETE cascade,
  "week_start" text NOT NULL,
  "recommendations" jsonb NOT NULL,
  "meals" jsonb NOT NULL,
  "total_daily_cost" numeric(10, 2),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
