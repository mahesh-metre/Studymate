import React, { useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom"; // ✅ import navigate

const API = "http://localhost:8001/api/auth";

const ForgotPassword = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate(); // ✅ initialize navigate

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/forgot-password`, { email });
      setMsg(res.data.message);
      setStep(2);
    } catch (err) {
      setMsg(err.response?.data?.error || "Error sending OTP");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/reset-password`, {
        email,
        otp,
        newPassword,
      });
      setMsg(res.data.message);

      // ✅ Redirect to login after success
      if (res.data.message.toLowerCase().includes("success")) {
        setTimeout(() => {
          onClose(); // Close modal
          navigate("/"); // Go to login page
        }, 1500);
      }
    } catch (err) {
      setMsg(err.response?.data?.error || "Reset failed");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Forgot Password</h2>

      {step === 1 ? (
        <form onSubmit={handleSendOTP}>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 15px",
              marginBottom: 20,
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "none",
              backgroundColor: "#667eea",
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 15px",
              marginBottom: 15,
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
              outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 15px",
              marginBottom: 20,
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "none",
              backgroundColor: "#667eea",
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Reset Password
          </button>
        </form>
      )}

      {msg && (
        <p
          style={{
            marginTop: 20,
            color: msg.toLowerCase().includes("success") ? "green" : "red",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {msg}
        </p>
      )}
    </Modal>
  );
};

export default ForgotPassword;
