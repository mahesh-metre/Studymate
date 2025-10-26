// Codepage.js
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Upload, Play } from "lucide-react";
import PythonVisualizer from "./python";

const Codepage = () => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(`# Write your code here...\nprint("Hello, world!")`);
  const [history, setHistory] = useState([]);
  const [trace, setTrace] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- File Upload ---
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setCode(event.target.result);
    reader.readAsText(file);
  };

  // --- Run Code ---
  const handleRun = async () => {
    if (language === "python") {
      setIsLoading(true);
      setError(null);
      setTrace([]);
      setCurrentStep(0);

      try {
        const res = await fetch("http://127.0.0.1:8001/python/visualize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTrace(data.steps || []);
        setOutputOpen(true);
        setHistory((prev) => [{ code, language }, ...prev]);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // JS / C simulation
    setTrace([]);
    setOutputOpen(true);
    let simulatedOutput = "";
    if (language === "javascript") simulatedOutput = "✅ JS executed: Hello, world!";
    else if (language === "c" || language === "cpp")
      simulatedOutput = "⚙ C/C++ simulated: Hello, world!";
    else simulatedOutput = `Execution for ${language} not integrated.`;
    setHistory((prev) => [{ code, language }, ...prev]);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Left Sidebar: History */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto z-20 scrollbar-hide"
          >
            <h2 className="text-lg font-semibold mb-3">History</h2>
            {history.length === 0 ? (
              <p className="text-sm text-gray-400">No history yet</p>
            ) : (
              <ul className="space-y-2">
                {history.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setCode(item.code);
                      setLanguage(item.language);
                    }}
                    className="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer text-sm transition"
                  >
                    <div className="font-semibold text-blue-400">
                      {item.language.toUpperCase()}
                    </div>
                    {item.code.slice(0, 30)}...
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editor */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 bg-gray-800 border-b border-gray-700 flex-wrap">
          <button
            onClick={() => setHistoryOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            <History className="w-5 h-5" />
            <span className="hidden sm:inline">History</span>
          </button>

          <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition">
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Upload</span>
            <input
              type="file"
              accept=".txt,.js,.py,.cpp,.c"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm focus:outline-none"
            >
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <button
            onClick={handleRun}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-md"
          >
            <Play className="w-5 h-5" />
            <span className="hidden sm:inline">Run</span>
          </button>
        </div>

        {/* Editor + Output */}
        <div className="flex flex-1 min-h-0 transition-all duration-500">
          {/* Code Editor */}
          <div className={`p-4 transition-all duration-500 min-h-0 ${outputOpen ? "w-1/2" : "w-full"}`}>
            <textarea
              className="w-full h-full font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          {/* Output / Visualization */}
          <AnimatePresence>
            {outputOpen && (
              <motion.div
                initial={{ opacity: 0, x: 200 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 200 }}
                transition={{ duration: 0.4 }}
                className="w-1/2 p-4 border-l border-gray-700 bg-gray-900 overflow-y-auto min-h-0 scrollbar-hide"
              >
                {error && <div className="text-red-400 mb-2">{error}</div>}
                {language === "python" && trace.length > 0 ? (
                  <PythonVisualizer trace={trace} />
                ) : (
                  <div className="bg-gray-800 rounded-lg p-3 text-sm min-h-[100px] whitespace-pre-line">
                    Output will appear here...
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Codepage;
