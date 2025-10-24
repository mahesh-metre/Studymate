import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// --- Default Python code shown in the editor ---
const defaultBFSCode = `
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if node not in visited:
            print(node, end=' ')
            visited.add(node)
            for neighbor in graph[node]:
                if neighbor not in visited:
                    queue.append(neighbor)

graph = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [],
    'E': ['F'],
    'F': []
}
bfs(graph, 'A')
`;

export default function PythonVisualizer() {
  const [code, setCode] = useState(defaultBFSCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const containerRef = useRef(null);
  const [editorWidth, setEditorWidth] = useState(50); // percentage width

  // --- Handle code execution (simulated) ---
  const runPythonCode = async () => {
    setIsRunning(true);
    setOutput("Running BFS traversal...\n");

    try {
      await new Promise((res) => setTimeout(res, 1000));
      const traversalOrder = ["A", "B", "C", "D", "E", "F"];
      let simulatedOutput = "";
      for (let i = 0; i < traversalOrder.length; i++) {
        await new Promise((res) => setTimeout(res, 600));
        simulatedOutput += traversalOrder[i] + " ";
        setOutput(simulatedOutput);
      }
    } catch (err) {
      setOutput("Error executing code");
    }

    setIsRunning(false);
  };

  // --- Graph visualization ---
  const nodes = ["A", "B", "C", "D", "E", "F"];
  const edges = [
    ["A", "B"],
    ["A", "C"],
    ["B", "D"],
    ["B", "E"],
    ["C", "F"],
    ["E", "F"],
  ];

  // --- Resizing logic ---
  const isResizing = useRef(false);
  const handleMouseDown = () => (isResizing.current = true);
  const handleMouseUp = () => (isResizing.current = false);
  const handleMouseMove = (e) => {
    if (!isResizing.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    if (newWidth < 20) newWidth = 20;
    if (newWidth > 80) newWidth = 80;
    setEditorWidth(newWidth);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center py-8 px-4 overflow-hidden">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
      >
        Python BFS Visualizer
      </motion.h1>

      {/* --- Editor and Output Horizontal Section --- */}
      <div
        ref={containerRef}
        className="w-full max-w-6xl flex gap-2 flex-1"
        style={{ minHeight: "400px" }}
      >
        {/* Code Editor */}
        <div
          style={{ width: `${editorWidth}%` }}
          className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-4 shadow-lg flex flex-col"
        >
          <h2 className="text-lg font-semibold mb-2">Python Code</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full flex-1 bg-gray-900 text-sm text-green-300 p-3 rounded-lg font-mono resize-none focus:outline-none border border-gray-700 overflow-auto scrollbar-hide"
          />
          <button
            onClick={runPythonCode}
            disabled={isRunning}
            className={`mt-4 px-5 py-2.5 rounded-full font-semibold transition-all ${
              isRunning
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90"
            }`}
          >
            {isRunning ? "Running..." : "Run Code"}
          </button>
        </div>

        {/* Resizer */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1 cursor-col-resize bg-gray-600 hover:bg-gray-500"
        ></div>

        {/* Output */}
        <div
          style={{ width: `${100 - editorWidth}%` }}
          className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-4 shadow-lg flex flex-col overflow-hidden"
        >
          <h2 className="text-lg font-semibold mb-2">Output</h2>
          <div className="flex-1 bg-gray-900 p-3 rounded-lg text-green-300 font-mono text-sm whitespace-pre-wrap overflow-auto scrollbar-hide">
            {output || "Output will appear here..."}
          </div>
        </div>
      </div>

      {/* --- Graph Visualization --- */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="mt-10 w-full max-w-4xl flex justify-center items-center overflow-auto"
      >
        <svg className="graph-svg" viewBox="0 0 600 300">
          {/* Edges */}
          {edges.map(([from, to], i) => (
            <line
              key={i}
              x1={nodePosition(from).x}
              y1={nodePosition(from).y}
              x2={nodePosition(to).x}
              y2={nodePosition(to).y}
              stroke="#38bdf8"
              strokeWidth="2"
              strokeOpacity="0.7"
            />
          ))}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <motion.g
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="graph-node"
            >
              <circle
                cx={nodePosition(node).x}
                cy={nodePosition(node).y}
                r="22"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <text
                x={nodePosition(node).x}
                y={nodePosition(node).y + 5}
                textAnchor="middle"
                fill="#fff"
                fontSize="14"
                fontWeight="bold"
              >
                {node}
              </text>
            </motion.g>
          ))}
        </svg>
      </motion.div>
    </div>
  );
}

// --- Helper: Node coordinates ---
function nodePosition(node) {
  const map = {
    A: { x: 300, y: 50 },
    B: { x: 200, y: 130 },
    C: { x: 400, y: 130 },
    D: { x: 150, y: 220 },
    E: { x: 250, y: 220 },
    F: { x: 400, y: 220 },
  };
  return map[node];
}
