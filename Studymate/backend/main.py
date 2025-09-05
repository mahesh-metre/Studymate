from pathlib import Path
import json
import subprocess
from typing import List, Dict, Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Import the step-by-step functions
from backend.algorithms.wavearray import wavearray_steps
from backend.algorithms.bfs import bfs_steps

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
CPP_DIR = BACKEND_DIR / "cpp"

app = FastAPI(title="Algorithms API", version="1.0.0")

class WaveArrayRequest(BaseModel):
    numbers: List[int]

# This MUST accept a 'graph' dictionary
class BFSRequest(BaseModel):
    graph: Dict[str, List[int]]
    start: int

@app.post("/python/wavearray")
def wavearray_py(req: WaveArrayRequest) -> Dict[str, Any]:
    return wavearray_steps(req.numbers)

@app.post("/python/bfs")
def bfs_py(req: BFSRequest) -> Dict[str, Any]:
    # Convert string keys from JSON to integers
    graph_int_keys = {int(k): v for k, v in req.graph.items()}
    # Call the correct function
    return bfs_steps(graph_int_keys, req.start)

# --- (The rest of your file can stay the same, but this simplified version is safer) ---
@app.get("/")
def root() -> dict:
    return {"status": "ok"}