import React from "react";

const PasswordStrengthBar = ({ password }) => {
  const getStrength = () => {
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();
  const colors = ["gray", "red", "orange", "yellow", "lightgreen", "green"];
  const texts = ["", "Very Weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <div style={{ marginTop: "5px" }}>
      <div
        style={{
          width: `${(strength / 5) * 100}%`,
          height: "6px",
          backgroundColor: colors[strength],
          transition: "width 0.3s",
        }}
      ></div>
      <p style={{ fontSize: "0.8rem", color: colors[strength] }}>
        {texts[strength]}
      </p>
    </div>
  );
};

export default PasswordStrengthBar;
