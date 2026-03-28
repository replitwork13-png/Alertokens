import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL is not set — database queries will fail at runtime.");
}

const client = connectionString
  ? postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  : (null as unknown as ReturnType<typeof postgres>);

export const db = client ? drizzle(client, { schema }) : (null as unknown as ReturnType<typeof drizzle>);
