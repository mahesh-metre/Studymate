import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, LogIn, UserPlus } from "lucide-react";

const LoginRegister = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(false); // false = login, true = register
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleInputChange = (setter) => (e) => {
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // ✅ Redirect to Codepage
    navigate("/codepage");
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // ✅ Redirect to Codepage after signing up
    navigate("/codepage");
  };

  const inputClass =
    "w-full py-3 pl-5 pr-10 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none shadow-sm transition-all duration-300";

  const buttonPrimaryClass =
    "w-full py-3 bg-violet-600 text-white rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-violet-700 shadow-xl shadow-violet-200/50 flex justify-center items-center";

  const SocialIcons = () => (
    <div className="flex justify-center gap-5 text-2xl mt-4">
      {["google", "facebook-f", "github", "linkedin-in"].map((icon, i) => (
        <a
          key={i}
          href="#"
          className="text-gray-700 hover:text-violet-600 transform hover:scale-125 transition-all duration-300"
        >
          <i className={`fab fa-${icon}`}></i>
        </a>
      ))}
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 font-sans">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      <div className="relative w-full max-w-[850px] h-[550px] rounded-[30px] shadow-2xl overflow-hidden">
        {/* Sliding Blue Panel */}
        <div
          className={`absolute top-0 w-1/2 h-full bg-gradient-to-br from-indigo-700 to-violet-700 rounded-[30px] z-20 flex flex-col justify-center items-center text-white p-12 transition-all duration-700 ease-in-out`}
          style={{ left: active ? "0%" : "50%" }}
        >
          <h1 className="text-3xl font-bold mb-4 text-center animate-fadeIn">
            {active ? "Welcome Back!" : "Hello, Friend!"}
          </h1>
          <p className="mb-6 text-center text-md font-semibold animate-fadeIn delay-100">
            {active
              ? "To keep connected with us, please login with your personal info."
              : "Enter your personal details and start your journey with us."}
          </p>
          <button
            onClick={() => setActive(!active)}
            className="px-8 py-2 border-2 border-white rounded-full font-semibold bg-transparent hover:bg-white hover:text-violet-600 transition-all shadow-lg transform hover:scale-110 animate-pulse"
          >
            {active ? "Login" : "Sign up"}
          </button>
        </div>

        {/* Forms Container */}
        <div className="absolute top-0 w-full h-full flex">
          {/* LOGIN Form */}
          <div
            className={`w-1/2 h-full bg-white p-12 flex flex-col justify-center items-center transition-all duration-700 ease-in-out z-10 ${
              active
                ? "translate-x-full opacity-0 pointer-events-none"
                : "translate-x-0 opacity-100 pointer-events-auto"
            }`}
          >
            <form onSubmit={handleLogin} className="w-full max-w-xs text-center">
              <h1 className="text-3xl font-bold mb-8 text-violet-700 animate-slideDown">
                Log In
              </h1>
              <div className="relative mb-6">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={loginData.username}
                  onChange={handleInputChange(setLoginData)}
                  className={inputClass}
                />
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>
              <div className="relative mb-10">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={handleInputChange(setLoginData)}
                  className={inputClass}
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>
              <button type="submit" className={buttonPrimaryClass}>
                <LogIn className="inline h-5 w-5 mr-2 -mt-1" /> Login
              </button>
              <p className="text-sm mt-4 mb-3 text-gray-500">
                or use social platforms
              </p>
              <SocialIcons />
            </form>
          </div>

          {/* REGISTER Form */}
          <div
            className={`w-1/2 h-full bg-white p-12 flex flex-col justify-center items-center transition-all duration-700 ease-in-out z-10 ${
              active
                ? "translate-x-0 opacity-100 pointer-events-auto"
                : "-translate-x-full opacity-0 pointer-events-none"
            }`}
          >
            <form onSubmit={handleSignup} className="w-full max-w-xs text-center">
              <h1 className="text-3xl font-bold mb-8 text-violet-700 animate-slideDown">
                Create Account
              </h1>
              <div className="relative mb-4">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={registerData.username}
                  onChange={handleInputChange(setRegisterData)}
                  className={inputClass}
                />
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>
              <div className="relative mb-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={handleInputChange(setRegisterData)}
                  className={inputClass}
                />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>
              <div className="relative mb-10">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={handleInputChange(setRegisterData)}
                  className={inputClass}
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>
              <button type="submit" className={buttonPrimaryClass}>
                <UserPlus className="inline h-5 w-5 mr-2 -mt-1" /> Sign Up
              </button>
              <p className="text-sm mt-4 mb-3 text-gray-500">
                or use social platforms
              </p>
              <SocialIcons />
            </form>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.7s ease forwards; }

          @keyframes slideDown {
            0% { opacity: 0; transform: translateY(-20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-slideDown { animation: slideDown 0.7s ease forwards; }
        `}
      </style>
    </div>
  );
};

export default LoginRegister;
