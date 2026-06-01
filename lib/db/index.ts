import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

const globalClient = globalThis as unknown as { _budgetbiteDb?: ReturnType<typeof drizzle> };

function createDb() {
  const client = postgres(connectionString!, {
    prepare: false,
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
  });
  return drizzle(client);
}

const db = globalClient._budgetbiteDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalClient._budgetbiteDb = db;
}

export { db };
