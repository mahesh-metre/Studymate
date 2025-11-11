// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import codeHistoryRoutes from "./routes/codeHistory.js";
import { pool } from "./db.js"; // our updated db.js

dotenv.config();

const app = express();

// -------------------- CORS CONFIG --------------------
const allowedOrigins = [
  "https://decipher-delta.vercel.app", // Vercel frontend
  "http://localhost:5173",             // local frontend testing
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow mobile apps, curl
    if (!allowedOrigins.includes(origin)) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204
}));

// Explicitly handle preflight requests
app.options("*", cors());

// -------------------- MIDDLEWARE --------------------
app.use(express.json()); // parse JSON

// -------------------- ROUTES --------------------
app.use("/api/auth", authRoutes);
app.use("/api/codeHistory", codeHistoryRoutes);

// -------------------- HEALTH CHECK --------------------
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend is running 🚀" });
});

// -------------------- SERVER START --------------------
const startServer = async () => {
  const port = process.env.PORT || 8001;

  try {
    // Test DB connection before starting server
    await pool.connect();
    console.log("✅ PostgreSQL connection OK");

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

  } catch (err) {
    console.error("❌ Cannot start server, PostgreSQL connection failed:", err);
    setTimeout(startServer, 5000); // Retry after 5 seconds
  }
};

// Start the server
startServer();
