import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import authRoutes from "./routes/auth.js";
import codeHistoryRoutes from "./routes/codeHistory.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// --- POSTGRESQL CONNECTION (FIXED) ---
// We now rely 100% on the environment variable, which comes from Render or a local .env
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ FATAL ERROR: DATABASE_URL is not set in environment variables.");
  // Exit the process so the server doesn't start with a null database connection
  process.exit(1); 
}

export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/codeHistory", codeHistoryRoutes);

// Dynamic port handling
const startServer = (port = process.env.PORT || 8001) => { // Use Render's PORT env var if available
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("Server error:", err);
    }
  });
};

startServer();


