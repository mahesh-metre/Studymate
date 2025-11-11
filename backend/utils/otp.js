// backend/utils/otp.js
// import nodemailer from "nodemailer";
import brevo from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

// OTP expiry time in minutes
const OTP_EXPIRY_MINUTES = 10;

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

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

  const htmlContent =
    type === "reset"
      ? `
      <div style="font-family: 'Segoe UI', sans-serif; background: #f8f9fa; padding: 20px; border-radius: 10px;">
        <h2 style="color:#2563eb;">Password Reset Request</h2>
        <p>We received a request to reset your password for your <b>Decipher</b> account.</p>
        <p>Please use the OTP below to reset your password:</p>
        <h3 style="color:#2563eb; letter-spacing: 3px; font-size: 24px;">${otp}</h3>
        <p>This OTP is valid for ${OTP_EXPIRY_MINUTES} minutes. If you didn’t request this, you can safely ignore this email.</p>
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
        <p>This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes. Enter it in the verification page to activate your account.</p>
        <br/>
        <p style="font-size: 12px; color: #777;">— The Decipher Team</p>
      </div>
    `;

  const textContent = `Your OTP for ${type === "reset" ? "password reset" : "account verification"} is: ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;

  const sendSmtpEmail = {
    sender: { email: process.env.BREVO_USER, name: "Decipher" },
    to: [{ email }],
    subject,
    htmlContent,
    textContent,
  };

  try {
    const info = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ ${type.toUpperCase()} OTP sent to ${email}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Error sending OTP via Brevo:", error.response || error);
    throw new Error("Failed to send OTP email");
  }
};
