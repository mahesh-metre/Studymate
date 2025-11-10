import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Upload, Play, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Codepage = () => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // 🟢 Fetch history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) {
        console.warn("⚠️ No userId found — redirecting to login");
        navigate("/");
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/codeHistory/${userId}`);
        const data = await res.json();
        if (data.success) setHistory(data.data);
      } catch (err) {
        console.error("❌ Error fetching history:", err);
      }
    };

    fetchHistory();
  }, [userId, navigate]);

  // 🟢 Handle running and saving code
  const handleRun = async () => {
    if (code.trim() === "") {
      alert("Enter your code to run!");
      return;
    }

    const timestamp = new Date().toLocaleString();
    const id = Date.now();
    const newEntry = { id, code, timestamp, language };

    setHistory((prev) => [newEntry, ...prev]);

    try {
      const res = await fetch("${import.meta.env.VITE_API_BASE_URL}/api/codeHistory/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code, language, timestamp }),
      });

      const data = await res.json();
      if (!data.success) throw new Error("Failed to save history");
      console.log("✅ Saved to DB:", data.data);
    } catch (err) {
      console.error("❌ Error saving to backend:", err);
    }

    if (language === "python") {
      navigate("/python", { state: { code, id } });
    } else {
      alert("Currently only Python visualization is supported!");
    }
  };

  // 🟢 Upload handler
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setCode(event.target.result);
    reader.readAsText(file);
  };

  // 🟢 Clear user history
  const clearHistory = async () => {
    if (window.confirm("Clear all history?")) {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/codeHistory/${userId}`, {
          method: "DELETE",
        });
        setHistory([]);
        console.log("✅ History cleared from DB");
      } catch (err) {
        console.error("❌ Failed to clear history:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex overflow-hidden relative">
      {/* Background animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-cyan-900/20 to-purple-900/20"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        animate={{ marginLeft: historyOpen ? 320 : 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="flex flex-col flex-1 relative z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="flex flex-wrap items-center justify-between gap-3 p-6 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-20 shadow-lg"
        >
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
            <motion.button
              whileHover={{
                scale: 1.1,
                background: "linear-gradient(135deg, #06b6d4, #2563eb)",
                boxShadow: "0 0 20px rgba(6,182,212,0.7)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setHistoryOpen(!historyOpen)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 rounded-2xl font-medium transition text-lg shadow-md hover:text-white"
            >
              <History className="w-6 h-6 text-cyan-300" />
              History
            </motion.button>

            <motion.label
              whileHover={{
                scale: 1.1,
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                boxShadow: "0 0 20px rgba(34,197,94,0.6)",
              }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 rounded-2xl font-medium cursor-pointer text-lg shadow-md hover:text-white transition-all duration-300"
            >
              <Upload className="w-6 h-6 text-green-400 transition-colors duration-300 group-hover:text-white" />
              Upload
              <input type="file" accept="*" onChange={handleUpload} className="hidden" />
            </motion.label>

            <motion.select
              whileHover={{
                scale: 1.05,
                borderColor: "#06b6d4",
                boxShadow: "0 0 12px rgba(6,182,212,0.5)",
              }}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 px-5 py-3 rounded-2xl text-lg border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition shadow-md"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="javascript">JavaScript</option>
            </motion.select>

            <motion.button
              whileHover={{
                scale: 1.1,
                background: "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)",
                boxShadow: "0 0 25px rgba(59,130,246,0.8)",
              }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              onClick={handleRun}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-lg font-semibold shadow-lg text-white transition"
            >
              <Play className="w-6 h-6" />
              Run Code
            </motion.button>
          </div>
        </motion.div>

        {/* Code Editor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 bg-gray-900 border-t border-gray-800"
        >
          <textarea
            className="w-full h-full font-mono text-base bg-gray-950 text-green-300 border-none outline-none resize-none p-6 focus:ring-0 placeholder:text-gray-500"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            placeholder="💡 Write or upload your code here..."
          />
        </motion.div>
      </motion.div>

      {/* Sidebar */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-800 p-5 flex flex-col z-30 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-cyan-400 tracking-wide">
                Code Run History
              </h2>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.2 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => setHistoryOpen(false)}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
              >
                <X className="w-5 h-5 text-red-400" />
              </motion.button>
            </div>

            {history.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No code runs yet. Try running your first program!
              </p>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {history.map((entry) => (
                  <motion.div
                    key={entry.id}
                    whileHover={{
                      scale: 1.03,
                      borderColor: "#06b6d4",
                      backgroundColor: "rgba(17,24,39,0.9)",
                    }}
                    className="bg-gray-800 rounded-xl p-3 border border-gray-700 transition cursor-pointer"
                    onClick={() =>
                      navigate("/python", {
                        state: { code: entry.code, id: entry.id },
                      })
                    }
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 mb-1">{entry.timestamp}</p>
                    </div>
                    <p className="text-xs line-clamp-3 text-green-300 font-mono">
                      {entry.code}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {history.length > 0 && (
              <motion.button
                whileHover={{
                  scale: 1.05,
                  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                  boxShadow: "0 0 15px rgba(239,68,68,0.7)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={clearHistory}
                className="mt-4 w-full px-5 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-medium transition text-white"
              >
                Clear History
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Codepage;
