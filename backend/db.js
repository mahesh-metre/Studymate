// In db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ FATAL ERROR: DATABASE_URL is not set in environment variables.");
  process.exit(1); 
}

// Use a NAMED EXPORT (export const)
export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));