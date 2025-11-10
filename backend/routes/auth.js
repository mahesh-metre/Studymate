import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
const router = express.Router();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Utilities
const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Verification Code",
    text: `Thank you for choosing Decipher. Your OTP for Decipher registration is ${otp}. It expires in 10 minutes.`,
  });
};

// -------------------- REGISTER --------------------
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    if (!isStrongPassword(password))
      return res.status(400).json({
        error: "Password must have 8+ chars, uppercase, lowercase, number, and special character.",
      });

    // Check existing email/username
    const emailExists = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (emailExists.rows.length)
      return res.status(400).json({ error: "Email already registered" });

    const usernameExists = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
    if (usernameExists.rows.length)
      return res.status(400).json({ error: "Username already taken" });

    // Hash password & generate OTP
    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    // Insert user with is_verified false
    await pool.query(
      "INSERT INTO users (username, email, password, otp, is_verified) VALUES ($1,$2,$3,$4,$5)",
      [username, email, hashed, otp, false]
    );

    await sendOTP(email, otp);

    console.log(`[REGISTER] User created: ${email}`);
    res.status(201).json({
      success: true,
      message: "OTP sent to email! Verify to continue.",
      redirectTo: "/OTPVerification",
      email,
    });
  } catch (err) {
    console.error("[REGISTER ERROR]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------- VERIFY OTP --------------------
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

    const user = (await pool.query("SELECT * FROM users WHERE email=$1", [email])).rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.is_verified) return res.status(400).json({ error: "Account already verified" });
    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    await pool.query("UPDATE users SET is_verified=true, otp=NULL WHERE email=$1", [email]);

    console.log(`[VERIFY OTP] User verified: ${email}`);
    res.json({
      success: true,
      message: "Account verified!",
      redirectTo: "/Codepage", // redirect after verification
    });
  } catch (err) {
    console.error("[VERIFY OTP ERROR]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("🔹 Login attempt:", { username, password });

  try {
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username/email and password required" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1 OR email=$1",
      [username]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (!user.is_verified) {
      return res.status(400).json({ success: false, error: "Account not verified. Check email OTP." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ success: false, error: "Incorrect password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // ✅ Return a clear success object with user info
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      redirectTo: "/Codepage",
    });
  } catch (err) {
    console.error("🔥 Login error caught:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});



// -------------------- FORGOT PASSWORD --------------------
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = (await pool.query("SELECT * FROM users WHERE email=$1", [email])).rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = generateOTP();
    await pool.query("UPDATE users SET otp=$1 WHERE email=$2", [otp, email]);
    await sendOTP(email, otp);

    console.log(`[FORGOT PASSWORD] OTP sent to: ${email}`);
    res.json({ success: true, message: "OTP sent for password reset" });
  } catch (err) {
    console.error("[FORGOT PASSWORD ERROR]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------- RESET PASSWORD --------------------
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    if (!email || !otp || !newPassword)
      return res.status(400).json({ error: "All fields required" });

    const user = (await pool.query("SELECT * FROM users WHERE email=$1", [email])).rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (!isStrongPassword(newPassword))
      return res.status(400).json({ error: "Weak password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password=$1, otp=NULL WHERE email=$2", [hashed, email]);

    console.log(`[RESET PASSWORD] Password updated: ${email}`);
    res.json({ success: true, message: "Password reset successful!" });
  } catch (err) {
    console.error("[RESET PASSWORD ERROR]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
