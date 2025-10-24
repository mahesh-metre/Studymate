import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "/public/logo.png";

const NavLink = ({ text, icon, isPrimary = false }) => {
  const base =
    "flex items-center space-x-2 text-sm md:text-base font-semibold px-4 py-2 rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap";

  if (isPrimary) {
    return (
      <motion.a
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 25px rgba(139,92,246,0.6)",
        }}
        transition={{ type: "spring", stiffness: 200 }}
        className={`${base} bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-md shadow-indigo-800/40`}
      >
        {icon && <span>{icon}</span>}
        <span>{text}</span>
      </motion.a>
    );
  }

  return (
    <motion.a
      whileHover={{
        scale: 1.05,
        backgroundColor: "rgba(45,55,72,0.9)",
        color: "#fff",
      }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`${base} text-gray-300 bg-gray-800/50 border border-gray-700 hover:border-violet-500 hover:text-white`}
    >
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </motion.a>
  );
};

const Navbar = () => (
  <motion.nav
    className="flex justify-between items-center p-4 md:p-6 text-white max-w-7xl mx-auto relative z-20 w-full"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1.2, ease: "easeInOut" }}
  >
    <motion.div
      className="flex items-center space-x-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: 0.3,
        duration: 1.2,
        type: "spring",
        stiffness: 100,
      }}
    >
      <motion.img
        src={logo}
        alt="Logo"
        className="w-28 h-28 sm:w-36 sm:h-36 object-contain rounded-full shadow-lg shadow-indigo-900/50"
        animate={{
          rotate: [0, 4, -4, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
        }}
      />
    </motion.div>

    <div className="flex items-center space-x-3 sm:space-x-5 md:space-x-8">
      <NavLink text="Help" icon="❓" />
      <Link to="/login">
        <NavLink text="Log In" icon="👤" />
      </Link>
      <Link to="/login">
        <NavLink text="Sign Up" icon="📝" isPrimary={true} />
      </Link>
    </div>
  </motion.nav>
);

const App = () => {
  const title = "Decipher";

  const letterContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const letterVariant = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#0f1025] to-[#1a1a3d] overflow-hidden font-sans relative flex flex-col justify-between select-none">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2a2a72_0%,_#000_100%)] z-0"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 25,
          ease: "easeInOut",
        }}
      ></motion.div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <Navbar />

        <header className="py-20 text-center max-w-4xl mx-auto px-4 flex-grow flex flex-col justify-center overflow-hidden">
          <motion.h1
            className="text-5xl sm:text-6xl md:text-8xl font-extrabold mb-5 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-fuchsia-400 leading-[1.2]"
            variants={letterContainer}
            initial="hidden"
            animate="visible"
            whileHover={{
              scale: 1.03,
              textShadow:
                "0 0 20px rgba(139,92,246,0.5), 0 0 40px rgba(79,70,229,0.4)",
            }}
          >
            {title.split("").map((char, i) => (
              <motion.span
                key={i}
                variants={letterVariant}
                className="transition-all duration-700 hover:text-indigo-300"
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.h2
            className="text-lg sm:text-xl md:text-2xl font-bold mt-6 text-gray-300 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 1 }}
          >
            Your AI-powered Code companion for smarter learning.
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg font-bold text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 1 }}
          >
            Visualize algorithms and code logic beautifully — understand faster and learn deeper.
          </motion.p>

          <Link to="/login">
            <motion.button
              className="relative px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-full text-white shadow-lg shadow-violet-900/50 transition-all duration-700 bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 1 }}
              whileHover={{
                scale: 1.1,
                background:
                  "linear-gradient(120deg, #8b5cf6, #6366f1, #d946ef)",
                boxShadow:
                  "0 0 30px rgba(139,92,246,0.6), 0 0 80px rgba(79,70,229,0.5)",
              }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="relative z-10">START Visual Creation</span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0"
                whileHover={{
                  opacity: 1,
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeInOut",
                }}
              ></motion.span>
            </motion.button>
          </Link>
        </header>

        <footer className="w-full py-3 text-center text-xs text-gray-500 mb-2">
          © 2025 Decipher. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default App;
