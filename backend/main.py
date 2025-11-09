from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware # <-- 1. Import CORS

from backend.algorithms.wavearray import wavearray_steps
from backend.algorithms.bfs import bfs_steps
from backend.algorithms.dfs import dfs_steps
from backend.tracer import trace_python_code

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
CPP_DIR = BACKEND_DIR / "cpp"

app = FastAPI(title="Algorithms API", version="1.0.0")

# --- 2. Add the CORS Middleware ---
# This block allows your frontend (running on any address) to communicate with the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- Request Models (No changes here) ---
class WaveArrayRequest(BaseModel):
    numbers: List[int]

class GraphRequest(BaseModel):
    graph: Dict[str, List[int]]
    start: int

class CodeExecutionRequest(BaseModel):
    code: str

# --- Endpoints (No changes here) ---
@app.post("/python/wavearray")
def wavearray_py(req: WaveArrayRequest) -> Dict[str, Any]:
    return wavearray_steps(req.numbers)

@app.post("/python/bfs")
def bfs_py(req: GraphRequest) -> Dict[str, Any]:
    graph_int_keys = {int(k): v for k, v in req.graph.items()}
    return bfs_steps(graph_int_keys, req.start)

@app.post("/python/dfs")
def dfs_py(req: GraphRequest) -> Dict[str, Any]:
    graph_int_keys = {int(k): v for k, v in req.graph.items()}
    return dfs_steps(graph_int_keys, req.start)

@app.post("/python/visualize")
def visualize_py(req: CodeExecutionRequest) -> Dict[str, Any]:
    return trace_python_code(req.code)

@app.get("/")
def root() -> dict:
    return {"status": "ok"}
