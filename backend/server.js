import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import authRoutes from "./routes/auth.js";
import codeHistoryRoutes from "./routes/codeHistory.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

// --- CORS FIX: Allow Vercel Frontend to talk to Render Backend ---
const allowedOrigins = [
  // Your live Vercel domain where the frontend is hosted
  "https://decipher-omega.vercel.app", 
  // Add other subdomains or local testing origin
  "http://localhost:5173" 
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204
}));
// -----------------------------------------------------------------

app.use(express.json());


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