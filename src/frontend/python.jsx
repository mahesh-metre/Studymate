// PythonVisualizer.js
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GraphVisualizer = ({ variables }) => {
  if (!variables?.graph) return null;

  const nodePositions = {
    0: { x: 350, y: 80 },
    1: { x: 150, y: 200 },
    2: { x: 550, y: 200 },
    3: { x: 100, y: 340 },
    4: { x: 250, y: 340 },
    5: { x: 450, y: 340 },
  };

  const nodes = Object.keys(variables.graph).map((id) => ({
    id: parseInt(id, 10),
    ...(nodePositions[id] || { x: 50, y: 50 }),
  }));

  const edges = [];
  Object.entries(variables.graph).forEach(([sourceId, neighbors]) => {
    const s = parseInt(sourceId, 10);
    neighbors.forEach((t) => {
      const tid = parseInt(t, 10);
      if (s !== tid) edges.push({ source: s, target: tid, id: `${s}->${tid}` });
    });
  });

  const getNodeFill = (id) => {
    if (id === variables.current_node) return "url(#yellowGlow)";
    if (variables.visited?.includes(id)) return "url(#blueGradient)";
    return "url(#greenGradient)";
  };

  return (
    <svg className="w-full h-[480px] mb-10 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#1e1e3f] rounded-2xl shadow-2xl p-4 border border-gray-700/40 transition-all duration-500">
      <defs>
        <radialGradient id="blueGradient" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>
        <radialGradient id="greenGradient" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#166534" />
        </radialGradient>
        <radialGradient id="yellowGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="#38bdf8" />
        </marker>
      </defs>
      <AnimatePresence>
        {edges.map((edge) => {
          const start = nodePositions[edge.source];
          const end = nodePositions[edge.target];
          return (
            <motion.line
              key={edge.id}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeOpacity="0.7"
              markerEnd="url(#arrow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          );
        })}
      </AnimatePresence>
      <AnimatePresence>
        {nodes.map((node) => (
          <motion.g
            key={node.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="28"
              fill={getNodeFill(node.id)}
              stroke="#e0f2fe"
              strokeWidth="3"
              className="cursor-pointer drop-shadow-md hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.9)] transition-all duration-300"
              whileHover={{ scale: 1.15 }}
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize="15"
              fontWeight="bold"
            >
              {node.id}
            </text>
          </motion.g>
        ))}
      </AnimatePresence>
    </svg>
  );
};

const Typewriter = ({ text }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [text]);
  return <>{displayed}</>;
};

const PythonVisualizer = ({ trace }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const autoplayRef = useRef(null);

  const current = trace[currentStep] || {};
  const currentOutput = current.output || "";
  const isFinished = current?.event === "finished";

  const fetchAIExplanation = async () => {
    if (!current?.code_line) return;
    try {
      const res = await fetch("http://127.0.0.1:8001/python/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_line: current.code_line }),
      });
      const data = await res.json();
      setAiExplanation(data.explanation || "No explanation available.");
    } catch {
      setAiExplanation("Error fetching AI explanation.");
    }
  };

  useEffect(() => {
    if (isPlaying) {
      autoplayRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < trace.length - 1) return prev + 1;
          clearInterval(autoplayRef.current);
          setIsPlaying(false);
          return prev;
        });
      }, 1300);
    }
    return () => clearInterval(autoplayRef.current);
  }, [isPlaying, trace.length]);

  // Only show 3 steps at a time, centered on current step if possible
  const windowSize = 3;
  let start = Math.max(0, currentStep - 1);
  let end = Math.min(trace.length, start + windowSize);
  if (end - start < windowSize && end === trace.length) start = Math.max(0, end - windowSize);

  const visibleSteps = trace.slice(start, end);

  return (
    <div className="flex flex-col w-full min-h-0 overflow-y-auto p-4 bg-gradient-to-br from-[#0f172a] via-[#151528] to-[#1e1e3f] rounded-2xl shadow-2xl border border-gray-700/40 transition-all duration-700">
      {/* Controls */}
      <div className="flex flex-wrap justify-center items-center gap-3 mb-5">
        {["Start", "Play/Pause", "Prev", "Next", "Replay", "AI Explain"].map(
          (label) => {
            const actions = {
              Start: () => setCurrentStep(0),
              "Play/Pause": () => setIsPlaying((p) => !p),
              Prev: () => setCurrentStep((p) => Math.max(p - 1, 0)),
              Next: () => setCurrentStep((p) => Math.min(p + 1, trace.length - 1)),
              Replay: () => {
                setCurrentStep(0);
                setIsPlaying(false);
              },
              "AI Explain": fetchAIExplanation,
            };
            return (
              <button
                key={label}
                onClick={actions[label]}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium rounded-lg shadow-md hover:shadow-violet-700/40 transform hover:scale-105 transition-all duration-300"
              >
                {label}
              </button>
            );
          }
        )}
      </div>

      <div className="text-sm font-medium text-cyan-300 mb-4 text-center">
        Step {currentStep + 1} / {trace.length}
      </div>

      {/* Graph */}
      {current.variables && <GraphVisualizer variables={current.variables} />}

      {/* Only 3 Step Explanations */}
      <div className="bg-gray-900/80 border border-violet-700 rounded-xl p-4 text-yellow-300 font-mono shadow-lg mb-4 animate-fadeIn">
        <h2 className="text-violet-400 font-semibold mb-2">🪜 Step Explanations</h2>
        {visibleSteps.map((item, i) => {
          const stepNum = start + i;
          return (
            <p
              key={stepNum}
              className={`transition-all mb-1 ${
                stepNum === currentStep
                  ? "text-yellow-400 font-semibold"
                  : "text-gray-400"
              }`}
            >
              Step {stepNum + 1}: {item.explanation || "No explanation available"}
            </p>
          );
        })}
      </div>

      {/* AI Explanation */}
      {aiExplanation && (
        <div className="bg-yellow-300/90 text-gray-900 p-4 rounded-lg font-medium shadow-lg border border-yellow-400 animate-fadeIn">
          🤖 <b>AI Explanation:</b> <Typewriter text={aiExplanation} />
        </div>
      )}

      {/* Output */}
      <div className="bg-gray-800/70 mt-6 p-4 rounded-lg shadow-inner border border-gray-700/40">
        <h2 className="text-gray-200 font-semibold mb-2">Output</h2>
        <pre className="whitespace-pre-wrap text-cyan-300">
          {currentOutput || "(No output yet)"}
        </pre>
      </div>

      {isFinished && (
        <div className="text-green-400 font-semibold mt-6 text-center text-lg animate-fadeIn">
          ✅ Execution Finished!
        </div>
      )}
    </div>
  );
};

export default PythonVisualizer;
