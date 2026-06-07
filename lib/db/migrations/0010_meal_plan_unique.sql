ALTER TABLE meal_plans ADD CONSTRAINT meal_plans_patient_week_unique UNIQUE (patient_id, week_start);
