import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "./Modal";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

const OTPVerification = ({ isOpen, onClose }) => {
  const { state } = useLocation();
  const email = state?.email;
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/verify-otp`, { email, otp });
      const message = res.data.message?.toLowerCase() || "";

      setMsg(res.data.message);

      if (message.includes("success")) {
        // ✅ Optional: Save user info or token
        // localStorage.setItem("token", res.data.token);

        // ✅ Show success message briefly, then navigate
        setTimeout(() => {
          if (onClose) onClose(); // close modal
          navigate("/Codepage", { replace: true }); // go directly to coding page
        }, 1000);
      }
    } catch (err) {
      setMsg(err.response?.data?.error || "Verification failed");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>OTP Verification</h2>
      <p style={{ textAlign: "center", marginBottom: 15 }}>
        OTP sent to: <strong>{email}</strong>
      </p>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px 15px",
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
            backgroundColor: "#4facfe",
            color: "white",
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Verify
        </button>
      </form>

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

export default OTPVerification;
