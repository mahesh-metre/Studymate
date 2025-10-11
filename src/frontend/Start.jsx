import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { link } from 'framer-motion/client';
// --- Gemini API Constants ---
const API_KEY = ""; // Injected at runtime
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";

// --- Utility: Retry Fetch ---
const retryFetch = async (url, options, maxRetries = 5) => {
  let lastError = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      if (i < maxRetries - 1) await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
};

// --- Components ---
const NavLink = ({ text, icon, isPrimary = false }) => {
  const baseClasses = "flex items-center space-x-2 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap";

  if (isPrimary) {
    return (
      <motion.a
        href="#"
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(236,72,153,0.9)" }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`${baseClasses} bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-800/50`}
      >
        {icon && <span>{icon}</span>}
        <span>{text}</span>
      </motion.a>
    );
  }

  return (
    <motion.a
      href="#"
      whileHover={{ scale: 1.05, backgroundColor: "rgba(55,65,85,0.9)", color: "#fff" }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`${baseClasses} text-gray-300 bg-gray-900/50 border border-purple-900 hover:border-purple-600 hover:text-white`}
    >
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </motion.a>
  );
};

const Navbar = () => (
  <nav className="flex justify-between items-center p-4 md:p-6 text-white max-w-7xl mx-auto relative z-20">
    <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
      PixlrAI
    </div>
    <div className="flex items-center space-x-6 md:space-x-8">
     <NavLink text="Help" icon="❓" />
     <Link to="/login"><NavLink text="Log In" icon="👤" /></Link>
      <Link to="/login"><NavLink text="Sign Up" icon="📝" isPrimary={true} /></Link>
    </div>
  </nav>
);

const FeatureCard = ({ title, icon, isHighlighted = false }) => {
  const baseClasses = "flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-500 cursor-pointer w-full max-w-[280px]";

  if (isHighlighted) {
    return (
      
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168,85,247,0.7)" }}
        className={`${baseClasses} bg-gradient-to-r from-purple-600 to-pink-500 border-transparent shadow-lg shadow-purple-900`}
      >
        <span className="text-3xl mb-2">{icon}</span>
        <h3 className="text-white text-lg font-semibold">{title}</h3>
      </motion.button>
      
    );
  }

  return (
    <Link to="/login">
    <motion.button
      whileHover={{ scale: 1.03, borderColor: "#A855F7", color: "#fff" }}
      className={`${baseClasses} bg-gray-900/50 border-purple-900 text-gray-200 hover:bg-gray-800/70`}
    >
      <span className="text-3xl mb-2 text-purple-400">{icon}</span>
      <h3 className="text-lg font-semibold">{title}</h3>
    </motion.button>
  </Link>
  );
};

// --- Main App ---
const App = () => {
  const mainTitleClass =
    "text-6xl md:text-8xl font-extrabold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400";

  const [inputConcept, setInputConcept] = useState('An ethereal portrait of a fox in a deep forest');
  const [marketingCopy, setMarketingCopy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateCopy = useCallback(async () => {
    if (!inputConcept.trim()) {
      setError("Please enter a creative concept.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMarketingCopy('');

    const systemPrompt =
      "You are a world-class marketing copywriter specializing in digital media. Create a catchy, three-line blurb for a newly generated image or video, including a powerful one-sentence slogan and two bullet points describing its key features or emotional impact. Respond only with the copy, formatted using Markdown for bullet points and strong text.";

    const userQuery = `Generate marketing copy for this creative concept: "${inputConcept}"`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      tools: [{ google_search: {} }],
    };

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };

    try {
      const result = await retryFetch(`${API_URL}?key=${API_KEY}`, options);
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

      let formattedText = generatedText.replace(/^\* (.*)$/gm, '<li>$1</li>');
      if (formattedText.includes('<li>')) formattedText = `<ul>${formattedText}</ul>`;
      formattedText = formattedText.replace(/\n/g, '<br />');

      setMarketingCopy(formattedText);
    } catch (err) {
      console.error(err);
      setError('Failed to generate copy. Please check your concept or try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputConcept]);

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden font-sans relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-color-purple-950)_0%,_#000000_100%)] opacity-80 z-0"></div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <header className="py-20 text-center max-w-4xl  mx-auto px-4">
          <h1 className='text-6xl md:text-8xl font-extrabold mb-5 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400 leading-[1.3]'>Decipher</h1>
          <h2 className="text-xl md:text-3xl font-bold mt-6 text-gray-300 mb-6">
           Your AI-powered Code companion for smarter learning.
          </h2>
          <p className="text-lg font-bold text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            code visualization which helps you to understand code better and faster.
          </p>

          <Link to="/login">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(236,72,153,0.9)' }}
            className="mb-20 px-10 py-4 text-lg font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-800/60 transition-all duration-300"
          >
            START visual creation
          </motion.button>
          </Link>
          </header>

        <footer className="w-full py-4 text-center text-xs text-gray-500 ">
          © 2025 Studymate. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default App;
