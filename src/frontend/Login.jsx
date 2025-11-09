import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, LogIn, UserPlus, X } from "lucide-react";
import axios from "axios";

const API = "http://localhost:8001/api/auth";

const LoginRegister = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // For modals
  const [showForgot, setShowForgot] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  // Forgot password fields
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  // OTP verification
  const [otp, setOtp] = useState("");
  const [otpMsg, setOtpMsg] = useState("");

  const handleInputChange = (setter) => (e) =>
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // 🔐 Password Strength Checker
  useEffect(() => {
    const { password } = registerData;
    if (!password) setPasswordStrength("");
    else if (password.length < 6) setPasswordStrength("Weak");
    else if (/[A-Z]/.test(password) && /\d/.test(password) && /[@$!%*?&#]/.test(password))
      setPasswordStrength("Strong");
    else setPasswordStrength("Medium");
  }, [registerData.password]);

const handleLogin = async (e) => {
  e.preventDefault();
  console.log("Login button clicked");

  try {
    const res = await axios.post(`${API}/login`, loginData);

    if (res.data.success) {
      // ✅ Store userId and other details
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("username", res.data.user.username);
      localStorage.setItem("email", res.data.user.email);

      alert("Login successful!");
      navigate("/Codepage");
    } else {
      alert(res.data.error || res.data.message || "Invalid credentials");
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    alert(error.response?.data?.error || "Error logging in");
  }
};

  // 🔹 Register Handler
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/register`, registerData);
      if (res.data.success) {
        setShowOTP(true); // open OTP modal
      } else {
        alert(res.data.error || res.data.message || "Registration failed");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Error during registration");
    }
  };

  // 🔹 OTP Verify
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/verify-otp`, {
        email: registerData.email,
        otp,
      });
      setOtpMsg(res.data.message);
      if (res.data.message.toLowerCase().includes("success")) {
        setTimeout(() => {
          setShowOTP(false);
          navigate("/Codepage");
        }, 1500);
      }
    } catch (err) {
      setOtpMsg(err.response?.data?.error || "Verification failed");
    }
  };

  // 🔹 Forgot Password Handlers
  const handleSendForgotOTP = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/forgot-password`, { email: forgotEmail });
      setForgotMsg(res.data.message);
      setForgotStep(2);
    } catch (err) {
      setForgotMsg(err.response?.data?.error || "Error sending OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/reset-password`, {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword,
      });
      setForgotMsg(res.data.message);
      if (res.data.message.toLowerCase().includes("success")) {
        setTimeout(() => setShowForgot(false), 1500);
      }
    } catch (err) {
      setForgotMsg(err.response?.data?.error || "Reset failed");
    }
  };

  const inputClass =
    "w-full py-3 pl-5 pr-10 rounded-xl border border-gray-600 bg-gray-900 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none shadow-md shadow-gray-800 transition-all duration-300";

  const buttonPrimaryClass =
    "w-full py-3 bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 text-white rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-violet-700/40 shadow-xl flex justify-center items-center";

  const renderStrengthBar = (strength) => {
    const colorMap = {
      Weak: "bg-red-500 w-1/3",
      Medium: "bg-yellow-500 w-2/3",
      Strong: "bg-green-500 w-full",
    };
    return (
      strength && (
        <div className="w-full h-2 bg-gray-700 rounded-full mt-2">
          <div className={`h-2 rounded-full transition-all ${colorMap[strength]}`}></div>
          <p className="text-sm mt-1 text-gray-400">Strength: {strength}</p>
        </div>
      )
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#151528] to-[#1e1e3f] font-sans p-4 relative overflow-hidden">
      {/* --- Login/Register Card --- */}
      <div className="relative w-full max-w-[850px] h-[550px] rounded-[30px] shadow-2xl overflow-hidden backdrop-blur-lg bg-gray-900/60 border border-gray-700/60">
        {/* Sliding Gradient Panel */}
        <div
          className={`absolute top-0 w-1/2 h-full bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 rounded-[30px] z-20 flex flex-col justify-center items-center text-white p-12 transition-all duration-700`}
          style={{ left: active ? "0%" : "50%" }}
        >
          <h1 className="text-3xl font-bold mb-4">
            {active ? "Welcome Back!" : "Hello, Friend!"}
          </h1>
          <p className="mb-6 text-center text-md font-semibold">
            {active
              ? "To keep connected with us, please login with your info."
              : "Enter your personal details and start your journey with us."}
          </p>
          <button
            onClick={() => setActive(!active)}
            className="px-8 py-2 border-2 border-white rounded-full font-semibold bg-transparent hover:bg-white hover:text-violet-600 transition-all shadow-lg transform hover:scale-110"
          >
            {active ? "Login" : "Sign up"}
          </button>
        </div>

        {/* Forms */}
        <div className="absolute top-0 w-full h-full flex">
          {/* Login Form */}
          <div
  className={`w-1/2 h-full bg-gray-950 p-12 flex flex-col justify-center items-center transition-all duration-700 ${
    active ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
  }`}
>

            <form onSubmit={handleLogin} className="w-full max-w-xs text-center">
              <h1 className="text-3xl font-bold mb-8 text-violet-400">Log In</h1>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={loginData.username}
                onChange={handleInputChange(setLoginData)}
                className={`${inputClass} mb-5`}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleInputChange(setLoginData)}
                className={`${inputClass} mb-3`}
              />
              <p
                onClick={() => {
                  setShowForgot(true);
                  setForgotStep(1);
                }}
                className="text-sm text-violet-400 hover:text-violet-300 cursor-pointer text-right mb-6"
              >
                Forgot password?
              </p>
              <button type="submit" className={buttonPrimaryClass}>
                <LogIn className="inline h-5 w-5 mr-2 -mt-1" /> Login
              </button>
            </form>
          </div>

          {/* Register Form */}
          <div
  className={`w-1/2 h-full bg-gray-950 p-12 flex flex-col justify-center items-center transition-all duration-700 ${
    active ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
  }`}
>

            <form onSubmit={handleSignup} className="w-full max-w-xs text-center">
              <h1 className="text-3xl font-bold mb-8 text-violet-400">Create Account</h1>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={registerData.username}
                onChange={handleInputChange(setRegisterData)}
                className={`${inputClass} mb-4`}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={registerData.email}
                onChange={handleInputChange(setRegisterData)}
                className={`${inputClass} mb-4`}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={registerData.password}
                onChange={handleInputChange(setRegisterData)}
                className={`${inputClass} mb-2`}
              />
              {renderStrengthBar(passwordStrength)}
              <button type="submit" className={`${buttonPrimaryClass} mt-6`}>
                <UserPlus className="inline h-5 w-5 mr-2 -mt-1" /> Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* --- OTP Modal --- */}
      {showOTP && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-96 relative shadow-2xl text-center">
            <button
              onClick={() => setShowOTP(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">OTP Verification</h2>
            <p className="mb-4 text-gray-600">
              Enter OTP sent to <strong>{registerData.email}</strong>
            </p>
            <form onSubmit={handleVerifyOTP}>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-violet-500 outline-none"
              />
              <button type="submit" className="w-full bg-violet-600 text-white p-3 rounded-lg font-semibold hover:bg-violet-700 transition-all">
                Verify
              </button>
            </form>
            {otpMsg && (
              <p className={`mt-3 font-semibold ${otpMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {otpMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- Forgot Password Modal --- */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-96 relative shadow-2xl text-center">
            <button
              onClick={() => setShowForgot(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Forgot Password</h2>
            {forgotStep === 1 ? (
              <form onSubmit={handleSendForgotOTP}>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-violet-500 outline-none"
                />
                <button type="submit" className="w-full bg-violet-600 text-white p-3 rounded-lg font-semibold hover:bg-violet-700 transition-all">
                  Send OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-violet-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-violet-500 outline-none"
                />
                <button type="submit" className="w-full bg-violet-600 text-white p-3 rounded-lg font-semibold hover:bg-violet-700 transition-all">
                  Reset Password
                </button>
              </form>
            )}
            {forgotMsg && (
              <p className={`mt-3 font-semibold ${forgotMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {forgotMsg}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginRegister;
