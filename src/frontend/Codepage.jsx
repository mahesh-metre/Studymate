import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Upload, Play } from "lucide-react";

const Codepage = () => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [code, setCode] = useState("// Write your code here...");
  const [output, setOutput] = useState("");
  const [history, setHistory] = useState([]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      setCode(text);
    };
    reader.readAsText(file);
  };

  // Handle run (simulate execution)
  const handleRun = () => {
    setOutput("✅ Code executed successfully!\nOutput: Hello, world!");
    setHistory((prev) => [code, ...prev]);
    setOutputOpen(true); // Show output panel
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* ===== Left Sidebar (History) ===== */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto z-20"
          >
            <h2 className="text-lg font-semibold mb-3">History</h2>
            {history.length === 0 ? (
              <p className="text-sm text-gray-400">No history yet</p>
            ) : (
              <ul className="space-y-2">
                {history.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => setCode(item)}
                    className="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer text-sm transition"
                  >
                    {item.slice(0, 30)}...
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Main Editor Area ===== */}
      <div className="flex flex-col flex-1">
        {/* ==== Top Toolbar ==== */}
        <div className="flex items-center gap-3 p-4 bg-gray-800 border-b border-gray-700">
          {/* History Button */}
          <button
            onClick={() => setHistoryOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            <History className="w-5 h-5" />
            <span className="hidden sm:inline">History</span>
          </button>

          {/* Upload Button */}
          <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition">
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Upload</span>
            <input
              type="file"
              accept=".txt,.js,.py,.cpp,.java,.ts"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Run Button */}
          <button
            onClick={handleRun}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-md"
          >
            <Play className="w-5 h-5" />
            <span className="hidden sm:inline">Run</span>
          </button>
        </div>

        {/* ==== Editor & Output Area ==== */}
        <div className="flex flex-1 relative overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 p-4">
            <textarea
              className="w-full h-full font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          {/* Animated Output Panel */}
          <AnimatePresence>
            {outputOpen && (
              <motion.div
                initial={{ x: 500, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 500, opacity: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                className="absolute right-0 top-0 h-full w-full md:w-1/3 bg-gray-850 border-l border-gray-700 p-4 backdrop-blur-xl shadow-2xl z-10"
              >
                <h3 className="font-semibold mb-2">Output:</h3>
                <motion.div
                  key={output}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 rounded-lg p-3 text-sm min-h-[100px] whitespace-pre-line"
                >
                  {output || <span className="text-gray-500">No output yet...</span>}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Codepage;
