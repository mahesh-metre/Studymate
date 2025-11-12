import httpx
from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# --- Import algorithm and AI helpers ---
from algorithms.wavearray import wavearray_steps
from algorithms.bfs import bfs_steps
from algorithms.dfs import dfs_steps
from tracer import trace_python_code
from ai_explainer import get_ai_explanation, get_ai_summary, get_ai_variable_map

# --- Project setup ---
PROJECT_ROOT = Path(__file__).resolve().parent
CPP_DIR = PROJECT_ROOT / "cpp"

app = FastAPI(title="Algorithms API", version="1.0.0")

# --- CORS middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for demo; tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------
# ✅ Request Models
# ---------------------------------------------------------------------
class WaveArrayRequest(BaseModel):
    numbers: List[int]

class GraphRequest(BaseModel):
    graph: Dict[str, List[int]]
    start: int

class CodeExecutionRequest(BaseModel):
    code: str
    inputs: List[str] = []  # Handles user input if provided

class ExplainCodeRequest(BaseModel):
    code_line: str

class SummarizeCodeRequest(BaseModel):
    code: str
    trace: List[Dict[str, Any]]

# ---------------------------------------------------------------------
# ✅ Algorithm Endpoints
# ---------------------------------------------------------------------
@app.post("/wavearray")
def wavearray_py(req: WaveArrayRequest) -> Dict[str, Any]:
    """Runs the wave array algorithm."""
    return wavearray_steps(req.numbers)

@app.post("/bfs")
def bfs_py(req: GraphRequest) -> Dict[str, Any]:
    """Runs the BFS algorithm."""
    graph_int_keys = {int(k): v for k, v in req.graph.items()}
    return bfs_steps(graph_int_keys, req.start)

@app.post("/dfs")
def dfs_py(req: GraphRequest) -> Dict[str, Any]:
    """Runs the DFS algorithm."""
    graph_int_keys = {int(k): v for k, v in req.graph.items()}
    return dfs_steps(graph_int_keys, req.start)

# ---------------------------------------------------------------------
# ✅ AI-Powered Endpoints
# ---------------------------------------------------------------------
@app.post("/visualize")
async def visualize_py(req: CodeExecutionRequest) -> Dict[str, Any]:
    print("🔹 visualize_py() called")
    print("🔹 Running trace_python_code()")
    
    result = None
    try:
        result = trace_python_code(req.code, req.inputs)
        print("✅ trace_python_code returned successfully")
    except Exception as e:
        print(f"⚠️ trace_python_code raised: {e}")
        return {"error": f"Trace failed: {e}"}

    return {"status": "ok", "result": result}


@app.post("/explain")
async def explain_py(req: ExplainCodeRequest) -> Dict[str, str]:
    """Returns a Gemini-generated explanation of a single line of Python code."""
    explanation = await get_ai_explanation(req.code_line)
    return {"explanation": explanation}


@app.post("/summarize")
async def summarize_py(req: SummarizeCodeRequest) -> Dict[str, str]:
    """Generates a summary of the given code and its final execution trace."""
    if not req.trace:
        return {"summary": "Execution trace is empty, cannot generate summary."}

    final_step = req.trace[-1]
    summary = await get_ai_summary(req.code, final_step)
    return {"summary": summary}

# ---------------------------------------------------------------------
# ✅ Diagnostic / Utility Routes
# ---------------------------------------------------------------------
@app.get("/check-network")
async def check_network():
    """Check if the backend can reach the internet."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get("https://www.google.com")
            return {"status": r.status_code}
    except Exception as e:
        return {"error": str(e)}

@app.get("/test-gemini")
async def test_gemini():
    import time
    import httpx

    start = time.time()
    try:
        # ✅ All four timeout parameters defined
        timeout = httpx.Timeout(connect=5.0, read=5.0, write=5.0, pool=5.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.get("https://generativelanguage.googleapis.com")
            return {
                "status": r.status_code,
                "elapsed": round(time.time() - start, 2)
            }
    except Exception as e:
        return {
            "error": str(e),
            "elapsed": round(time.time() - start, 2)
        }

@app.get("/")
def root() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}