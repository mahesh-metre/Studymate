import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// 🟢 GET user’s code history
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM code_history WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching code history:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// 🟢 POST: Save new code entry
router.post("/save", async (req, res) => {
  const { userId, code, language, timestamp } = req.body;
  if (!userId || !code)
    return res.status(400).json({ success: false, error: "Missing fields" });

  try {
    const result = await pool.query(
      "INSERT INTO code_history (user_id, code, language, timestamp) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, code, language, timestamp]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error saving history:", error);
    res.status(500).json({ success: false, error: "Failed to save" });
  }
});

// 🟢 DELETE all history for a user
router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.query("DELETE FROM code_history WHERE user_id = $1", [userId]);
    res.json({ success: true, message: "History cleared" });
  } catch (error) {
    console.error("Error deleting history:", error);
    res.status(500).json({ success: false, error: "Failed to delete history" });
  }
});

export default router;
