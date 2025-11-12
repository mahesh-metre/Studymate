import httpx
from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# --- Import AI and tracing functions ---
from algorithms.wavearray import wavearray_steps
from algorithms.bfs import bfs_steps
from algorithms.dfs import dfs_steps
from tracer import trace_python_code
# --- Import the AI helper functions ---
from ai_explainer import get_ai_explanation, get_ai_summary, get_ai_variable_map

PROJECT_ROOT = Path(__file__).resolve().parent
CPP_DIR = PROJECT_ROOT / "cpp"

app = FastAPI(title="Algorithms API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request Models ---
class WaveArrayRequest(BaseModel):
    numbers: List[int]

class GraphRequest(BaseModel):
    graph: Dict[str, List[int]]
    start: int

class CodeExecutionRequest(BaseModel):
    code: str
    inputs: List[str] = [] # For handling user input

class ExplainCodeRequest(BaseModel): 
    code_line: str

# --- NEW: Request Model for Summary ---
class SummarizeCodeRequest(BaseModel):
    code: str
    trace: List[Dict[str, Any]] # Send the whole trace

# --- Endpoints ---
@app.post("/wavearray")
def wavearray_py(req: WaveArrayRequest) -> Dict[str, Any]:
    """
    Runs the wave array algorithm (pre-defined).
    """
    return wavearray_steps(req.numbers)

@app.post("/bfs")
def bfs_py(req: GraphRequest) -> Dict[str, Any]:
    """
    Runs the BFS algorithm (pre-defined).
    """
    graph_int_keys = {int(k): v for k, v in req.graph.items()}
    return bfs_steps(graph_int_keys, req.start)

@app.post("/dfs")
def dfs_py(req: GraphRequest) -> Dict[str, Any]:
    """
    Runs the DFS algorithm (pre-defined).
    """
    graph_int_keys = {int(k): v for k, v in req.graph.items()}
    return dfs_steps(graph_int_keys, req.start)

# --- 2. Make the /visualize endpoint 'async def' ---
@app.post("/visualize")
async def visualize_py(req: CodeExecutionRequest) -> Dict[str, Any]:
    print("🔹 visualize_py() called with:", req.code[:80], "...")
    trace_data = trace_python_code(req.code, req.inputs)
    print("🔹 trace_python_code finished")
    
    variable_map = {}
    try:
        if trace_data.get("steps"):
            print("🔹 extracting variables")
            final_step_vars = trace_data["steps"][-1].get("variables", {})
            var_names = list(final_step_vars.keys())

            if var_names:
                print("🔹 calling get_ai_variable_map")
                variable_map = await get_ai_variable_map(req.code, var_names)
                print("🔹 got variable map")

    except Exception as e:
        print(f"⚠️ Error during variable mapping: {e}")

    trace_data["variable_map"] = variable_map
    print("✅ returning trace data")
    return trace_data
    
    return trace_data

@app.post("/explain") 
async def explain_py(req: ExplainCodeRequest) -> Dict[str, str]: 
    """
    Accepts a line of Python code and returns an AI-generated explanation.
    """
    explanation = await get_ai_explanation(req.code_line)
    return {"explanation": explanation}

# --- NEW: Endpoint for Summary ---
@app.post("/summarize")
async def summarize_py(req: SummarizeCodeRequest) -> Dict[str, str]:
    """
    Accepts the full code and trace, and returns an AI-generated summary.
    """
    if not req.trace:
        return {"summary": "Execution trace is empty, cannot generate summary."}
        
    # Send only the final step to the AI to save tokens
    final_step = req.trace[-1]
    summary = await get_ai_summary(req.code, final_step)
    return {"summary": summary}

@app.get("/check-network")
async def check_network():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get("https://www.google.com")
            return {"status": r.status_code}
    except Exception as e:
        return {"error": str(e)}


@app.get("/")
def root() -> dict:
    """
    Root endpoint for health check.
    """
    return {"status": "ok"}