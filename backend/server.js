import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import authRoutes from "./routes/auth.js";
import codeHistoryRoutes from "./routes/codeHistory.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// PostgreSQL connection
export const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:yourpassword@localhost:5432/yourdbname",
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/codeHistory", codeHistoryRoutes);

// Dynamic port handling
const startServer = (port = 8001) => {
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
