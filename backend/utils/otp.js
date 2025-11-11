// backend/utils/otp.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configure Brevo SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

/**
 * Send OTP Email (for register or reset)
 * @param {string} email - recipient email
 * @param {string} otp - generated OTP
 * @param {"register" | "reset"} type - email type
 */
export const sendOTP = async (email, otp, type = "register") => {
  const subject =
    type === "reset"
      ? "🔒 Reset Your Password - Decipher"
      : "✅ Verify Your Account - Decipher";

  const html =
    type === "reset"
      ? `
      <div style="font-family: 'Segoe UI', sans-serif; background: #f8f9fa; padding: 20px; border-radius: 10px;">
        <h2 style="color:#2563eb;">Password Reset Request</h2>
        <p>We received a request to reset your password for your <b>Decipher</b> account.</p>
        <p>Please use the OTP below to reset your password:</p>
        <h3 style="color:#2563eb; letter-spacing: 3px; font-size: 24px;">${otp}</h3>
        <p>This OTP is valid for 10 minutes. If you didn’t request this, you can safely ignore this email.</p>
        <br/>
        <p style="font-size: 12px; color: #777;">— The Decipher Security Team</p>
      </div>
    `
      : `
      <div style="font-family: 'Segoe UI', sans-serif; background: #f9fafb; padding: 20px; border-radius: 10px;">
        <h2 style="color:#2563eb;">Welcome to Decipher 🎉</h2>
        <p>Thank you for signing up, <b>Explorer!</b></p>
        <p>To verify your account, please use the OTP below:</p>
        <h3 style="color:#2563eb; letter-spacing: 3px; font-size: 24px;">${otp}</h3>
        <p>This OTP will expire in 10 minutes. Enter it in the verification page to activate your account.</p>
        <br/>
        <p style="font-size: 12px; color: #777;">— The Decipher Team</p>
      </div>
    `;

  try {
    await transporter.sendMail({
      from: `"Decipher" <${process.env.BREVO_USER}>`,
      to: email,
      subject,
      html,
    });

    console.log(`✅ ${type.toUpperCase()} OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP via Brevo:", error);
    throw new Error("Failed to send OTP email");
  }
};
