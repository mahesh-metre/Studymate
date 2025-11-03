import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";


// --- CSS (GlobalStyles Component) ---
const GlobalStyles = () => (
  <style>{`
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
    }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

    .graph-node text {
      font-size: 15px;
      font-weight: bold;
      text-anchor: middle;
      dominant-baseline: middle;
      fill: #fff;
      pointer-events: none;
    }
    .graph-edge {
      stroke: #38bdf8;
      stroke-width: 2.5px;
      stroke-opacity: 0.8;
    }
    .state-display, .explanation-panel, .output-panel {
      border-radius: 0.75rem;
      padding: 1rem;
      min-height: 8rem;
      overflow-y: auto;
      font-family: 'Courier New', Courier, monospace;
      white-space: pre-wrap;
      word-break: break-all;
      font-size: 0.95rem;
      line-height: 1.6;
    }
  `}</style>
);

// --- GraphVisualizer Component ---
const GraphVisualizer = ({ variables }) => {
  if (!variables || typeof variables.graph !== "object" || variables.graph === null) {
    console.warn("GraphVisualizer received invalid variables:", variables);
    return <div className="text-red-400 text-xs">Invalid graph data received</div>;
  }

  const graphData = variables.graph;
  const currentState = variables;

  const nodePositions = {
    0: { x: 300, y: 50 }, 1: { x: 150, y: 130 }, 2: { x: 450, y: 130 },
    3: { x: 100, y: 220 }, 4: { x: 200, y: 220 }, 5: { x: 400, y: 220 },
  };

  const nodes = Object.keys(graphData)
    .map(id => parseInt(id, 10))
    .filter(id => !isNaN(id))
    .map(id => ({
      id: id,
      ...(nodePositions[id] || { x: (id % 5) * 80 + 50, y: Math.floor(id / 5) * 80 + 50 }),
    }));

  const edges = [];
  Object.entries(graphData).forEach(([sourceId, neighbors]) => {
    const sourceInt = parseInt(sourceId, 10);
    if (!isNaN(sourceInt) && Array.isArray(neighbors)) {
      neighbors.forEach(targetId => {
        const targetInt = typeof targetId === "number" ? targetId : parseInt(targetId, 10);
        if (!isNaN(targetInt) && sourceInt < targetInt && nodePositions[sourceInt] && nodePositions[targetInt]) {
          edges.push({ source: sourceInt, target: targetInt, id: `${sourceId}-${targetId}` });
        }
      });
    }
  });

  const getNodeFill = (nodeId) => {
    const visited = Array.isArray(currentState.visited) ? currentState.visited : [];
    const queue = Array.isArray(currentState.queue) ? currentState.queue : [];
    const stack = Array.isArray(currentState.stack) ? currentState.stack : [];
    const current_node = currentState.current_node;

    if (nodeId === current_node) return "#d62728";
    const frontier = queue.length > 0 ? queue : stack;
    if (Array.isArray(frontier) && frontier.includes(nodeId)) return "#ffd700";
    if (visited.includes(nodeId)) return "#ff7f0e";
    return "#0f172a";
  };

  return (
    <svg className="graph-svg w-full h-[340px] border border-gray-700 rounded bg-gray-900" viewBox="0 0 600 340">
      {edges.map(edge => (
        <line
          key={edge.id}
          className="graph-edge"
          x1={nodePositions[edge.source]?.x}
          y1={nodePositions[edge.source]?.y}
          x2={nodePositions[edge.target]?.x}
          y2={nodePositions[edge.target]?.y}
        />
      ))}
      {nodes.map(node => (
        <g key={node.id} className="graph-node">
          <circle
            cx={node.x}
            cy={node.y}
            r="24"
            fill={getNodeFill(node.id)}
            stroke="#38bdf8"
            strokeWidth="2.5"
          />
          <text x={node.x} y={node.y}>{node.id}</text>
        </g>
      ))}
    </svg>
  );
};

// --- VariableDisplay Component ---
const VariableDisplay = ({ variables }) => {
  if (!variables || typeof variables !== "object") return null;

  const nonGraphVars = Object.entries(variables).filter(([name]) =>
    !["graph", "visited", "queue", "stack", "current_node", "neighbors", "start_node"].includes(name)
  );

  if (nonGraphVars.length === 0 && variables.hasOwnProperty("graph")) return null;
  if (nonGraphVars.length === 0) return <span className="text-gray-500 text-sm italic">(No other variables)</span>;

  return (
    <div>
      {nonGraphVars.map(([name, value]) => {
        if (Array.isArray(value)) {
          return (
            <div key={name} className="mb-5">
              <span className="font-semibold font-mono text-base text-gray-300">{name} =</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {value.map((item, index) => (
                  <div
                    key={index}
                    className="border border-blue-400 bg-blue-100 text-blue-900 px-3 py-1 rounded text-sm min-w-[35px] text-center font-medium"
                  >
                    {String(item)}
                  </div>
                ))}
                {value.length === 0 && (
                  <span className="text-gray-500 text-sm italic">(empty list)</span>
                )}
              </div>
            </div>
          );
        }
        return (
          <div key={name} className="mb-2">
            <span className="font-semibold font-mono text-base text-gray-300">{name} = </span>
            <span className="text-base text-green-300">{String(value)}</span>
          </div>
        );
      })}
    </div>
  );
};

// --- StateVisualizer Component ---
const StateVisualizer = ({ variables, isFinished }) => {
  if (!variables || typeof variables !== "object") {
    return <p className="text-gray-500 text-sm italic">Waiting for state...</p>;
  }

  const isGraphStep = variables.hasOwnProperty("graph") && typeof variables.graph === "object" && variables.graph !== null;

  return (
    <div className="space-y-4">
      {isGraphStep && <GraphVisualizer variables={variables} />}
      <VariableDisplay variables={variables} />
      {isFinished && (
        <div className="mt-4 p-2 text-center text-green-400 bg-green-800/50 rounded border border-green-700 text-md">
          Execution Finished!
        </div>
      )}
    </div>
  );
};

// --- Default Code ---
const defaultCodeWithPrint = `# Example with print statements
print("Starting...")
numbers = [3, 1, 4, 2]
n = len(numbers)
print(f"Initial array: {numbers}")
for i in range(n):
    swapped = False
    print(f"Outer loop iteration (i={i})")
    for j in range(0, n-i-1):
        print(f"  Comparing numbers[{j}]={numbers[j]} and numbers[{j+1}]={numbers[j+1]}")
        if numbers[j] > numbers[j+1]:
            print(f"    Swapping {numbers[j]} and {numbers[j+1]}")
            numbers[j], numbers[j+1] = numbers[j+1], numbers[j]
            swapped = True
    if not swapped:
        print("No swaps in this pass, array is sorted.")
        break

print(f"Final sorted array: {numbers}")
print("Finished!")`;

export default function PythonVisualizer() {
  const [code, setCode] = useState(defaultCodeWithPrint);
  const [trace, setTrace] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [editorWidth, setEditorWidth] = useState(50);
  const containerRef = useRef(null);
  const isResizing = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playInterval = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.code) {
      setCode(location.state.code);
    }
  }, [location.state]);

  const handleVisualize = async () => {
    setIsLoading(true);
    setError(null);
    setTrace([]);
    setCurrentStep(0);
    setExplanation("");
    try {
      const response = await fetch("http://127.0.0.1:8001/python/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();

      const stepsArray = Array.isArray(data.steps) ? data.steps : [];

      const formattedTrace = stepsArray.map(step => {
        const currentVars =
          step && typeof step.variables === "object" && step.variables !== null
            ? { ...step.variables }
            : {};
        const output = typeof step.output === "string" ? step.output : "";
        const line = typeof step.line === "number" ? step.line : null;
        const event = typeof step.event === "string" ? step.event : "line";

        let current_node = undefined;
        if (currentVars.hasOwnProperty("current")) {
          current_node = currentVars.current;
          delete currentVars.current;
        }

        return {
          line: line,
          event: event,
          variables: {
            ...currentVars,
            ...(current_node !== undefined && { current_node: current_node }),
          },
          output: output,
        };
      });

      if (data.error) setError(data.error);
      setTrace(formattedTrace || []);
    } catch (e) {
      setError(`Failed to connect to the server: ${e.message}`);
      setTrace([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplain = async (lineNumber) => {
    const lines = typeof code === "string" ? code.split("\n") : [];
    const lineOfCode = lines[lineNumber - 1];
    if (!lineOfCode || lineOfCode.trim() === "") return;

    setIsExplaining(true);
    setExplanation("");
    try {
      const response = await fetch("http://127.0.0.1:8001/python/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_line: lineOfCode }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setExplanation(
        typeof data.explanation === "string"
          ? data.explanation
          : "Invalid explanation received."
      );
    } catch (e) {
      setExplanation(`Error getting explanation: ${e.message}`);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleNext = () => {
    if (trace && currentStep < trace.length - 1) setCurrentStep(currentStep + 1);
  };
  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    clearInterval(playInterval.current);
  };
  const handlePlay = () => {
    if (!trace || trace.length === 0) return;
    setIsPlaying(true);
    playInterval.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < trace.length - 1) return prev + 1;
        clearInterval(playInterval.current);
        setIsPlaying(false);
        return prev;
      });
    }, 1000);
  };
  const handlePause = () => {
    clearInterval(playInterval.current);
    setIsPlaying(false);
  };

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

  const currentStepData = Array.isArray(trace) && trace.length > currentStep ? trace[currentStep] : null;
  const currentLine = currentStepData?.event === "line" ? currentStepData.line : null;
  const isFinished = currentStepData?.event === "finished";
  const currentOutput = typeof currentStepData?.output === "string" ? currentStepData.output : "";

  const codeLines = typeof code === "string" ? code.split("\n") : [];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center py-10 px-8 overflow-hidden">
      <GlobalStyles />
      <h1 className="text-4xl md:text-5xl font-bold mb-10 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Decipher Code Visualizer
      </h1>
      <div
        ref={containerRef}
        className="w-full max-w-7xl flex gap-4 flex-1 mb-8"
        style={{ minHeight: "600px" }}
      >
        {/* Code Editor Panel */}
        <div
          style={{ width: `${editorWidth}%` }}
          className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg flex flex-col"
        >
          <h2 className="text-xl font-semibold mb-3 text-gray-200">Python Code</h2>
          <div className="flex flex-1 border border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-900 p-2 text-right text-gray-500 text-sm select-none font-mono">
              {codeLines.map((_, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-end h-[23px] ${
                    i + 1 === currentLine ? "text-cyan-400 font-bold" : ""
                  }`}
                >
                  <button
                    onClick={() => handleExplain(i + 1)}
                    className="mr-2 text-gray-600 hover:text-yellow-400"
                    title="Explain line"
                  >
                    💡
                  </button>
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full flex-1 bg-gray-900 text-base text-green-300 p-2 font-mono resize-none focus:outline-none overflow-auto scrollbar-hide leading-[23px]"
              spellCheck="false"
            />
          </div>
          <button
            onClick={handleVisualize}
            disabled={isLoading}
            className={`mt-4 px-6 py-3 rounded-full font-semibold transition-all ${
              isLoading
                ? "bg-gray-700 cursor-not-allowed text-gray-400"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white"
            }`}
          >
            {isLoading ? "Visualizing..." : "Visualize Execution"}
          </button>
        </div>

        {/* Resizer */}
        <div
          onMouseDown={handleMouseDown}
          className="w-2 cursor-col-resize bg-gray-600 hover:bg-cyan-400 rounded-full transition-colors"
        ></div>

        {/* Visualization Panel */}
        <div
          style={{ width: `${100 - editorWidth}%` }}
          className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg flex flex-col overflow-hidden"
        >
          {Array.isArray(trace) && trace.length > 0 && (
            <div className="flex flex-wrap justify-between items-center mb-4 p-3 bg-gray-700/50 rounded-lg gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-4 py-3 bg-blue-600 rounded  hover:bg-blue-800 transition text-md"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={!trace || currentStep >= trace.length - 1}
                  className="px-4 py-2 bg-gray-600 rounded disabled:opacity-50 hover:bg-gray-500 transition text-md"
                >
                  Next
                </button>
                <button
                  onClick={handlePlay}
                  disabled={isPlaying}
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 transition text-md"
                >
                  Start
                </button>
                <button
                  onClick={handlePause}
                  disabled={!isPlaying}
                  className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-500 transition text-md"
                >
                  Pause
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-600 rounded hover:bg-red-500 transition text-md"
                >
                  Reset
                </button>
              </div>
              <span className="font-semibold text-base">
                Step {currentStep + 1} of {trace.length}
              </span>
            </div>
          )}
          {error && (
            <div className="p-3 mb-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-md">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="state-section">
              <h2 className="text-xl font-semibold mb-3 text-gray-200">
                Execution State
              </h2>
              <div className="state-display flex-grow bg-gray-900 p-4 rounded-lg text-base overflow-auto scrollbar-hide">
                {Array.isArray(trace) && trace.length > 0 && currentStepData ? (
                  <StateVisualizer
                    variables={currentStepData.variables || {}}
                    isFinished={isFinished}
                  />
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    Run visualization to see the steps here.
                  </p>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 mt-4">
              <h2 className="text-xl font-semibold mb-3 text-gray-200">
                Output (Print Statements)
              </h2>
              <div className="output-panel h-28 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg p-4 text-sm font-mono overflow-auto scrollbar-hide">
                {currentOutput ||
                  (Array.isArray(trace) && trace.length > 0
                    ? "(No output for this step)"
                    : "Output will appear here...")}
              </div>
            </div>
          </div>

          <div className="mt-4 flex-shrink-0">
            <h2 className="text-xl font-semibold mb-3 text-gray-200">
              AI Explanation
            </h2>
            <div className="h-28 bg-gray-900 p-4 rounded-lg text-cyan-300 font-mono text-sm overflow-auto scrollbar-hide border border-gray-700">
              {isExplaining
                ? "Loading explanation..."
                : typeof explanation === "string"
                ? explanation
                : "Click the 💡 icon next to a line of code..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
