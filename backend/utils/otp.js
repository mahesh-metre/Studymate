// backend/utils/otp.js
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an OTP email for verification or password reset
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {"register" | "reset"} type - Type of email ("register" or "reset")
 */
export const sendOTP = async (email, otp, type = "register") => {
  const subject =
    type === "reset"
      ? "Reset Your Password - Decipher"
      : "Your OTP Verification Code - Decipher";

  const message =
    type === "reset"
      ? `
      <p>We received a request to reset your password for your <b>Decipher</b> account.</p>
      <p>Your password reset OTP is:</p>
    `
      : `
      <p>Thank you for choosing <b>Decipher</b>!</p>
      <p>Your verification OTP is:</p>
    `;

  try {
    await resend.emails.send({
      from: "Decipher <onboarding@resend.dev>",
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 15px;">
          <h2 style="color: #4f46e5;">Decipher</h2>
          ${message}
          <h3 style="color: #4f46e5; letter-spacing: 3px;">${otp}</h3>
          <p>This OTP will expire in 10 minutes.</p>
          <br/>
          <p style="font-size: 12px; color: #888;">If you didn’t request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log(`✅ ${type.toUpperCase()} OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP via Resend:", error);
    throw new Error("Failed to send OTP email");
  }
};
