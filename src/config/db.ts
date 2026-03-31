import { Pool } from "pg";
import { DB_URL } from "./env"; // ✅ We only need DB_URL now

export const db = new Pool({
  connectionString: DB_URL,
  ssl: {
    rejectUnauthorized: false // ✅ This is REQUIRED to connect to Neon securely
  }
});