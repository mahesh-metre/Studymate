import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Start from "./frontend/Start";
import Login from "./frontend/Login";
import Codepage from "./frontend/Codepage";
import Python from "./frontend/python";
import ForgotPassword from "./frontend/ForgotPassword";
import VerifyOTP from "./frontend/OTPVerification";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<Login />} />
        <Route path="/codepage" element={<Codepage />} />
        <Route path="/python" element={<Python />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
