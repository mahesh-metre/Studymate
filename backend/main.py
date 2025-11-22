from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# --- Import AI and tracing functions ---
from backend.tracer import trace_python_code
from backend.ai_explainer import get_ai_explanation, get_ai_summary, get_ai_variable_map

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
CPP_DIR = BACKEND_DIR / "cpp"

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
    inputs: List[str] = []  # For handling user input

class ExplainCodeRequest(BaseModel):
    code_line: str

class SummarizeCodeRequest(BaseModel):
    code: str
    trace: List[Dict[str, Any]]

# -----------------------------------------------------
# NEW — Main Visualization Endpoint (Async)
# -----------------------------------------------------
@app.post("/python/visualize")
async def visualize_py(req: CodeExecutionRequest) -> Dict[str, Any]:

    # Run tracer
    trace_data = trace_python_code(req.code, req.inputs)

    variable_map = {}
    try:
        if trace_data.get("steps"):
            final_vars = trace_data["steps"][-1].get("variables", {})
            var_names = list(final_vars.keys())

            if var_names:
                variable_map = await get_ai_variable_map(req.code, var_names)

    except Exception as e:
        print(f"Variable mapping failed: {e}")

    trace_data["variable_map"] = variable_map
    return trace_data

# -----------------------------------------------------
# NEW — Explain Endpoint
# -----------------------------------------------------
@app.post("/python/explain")
async def explain_py(req: ExplainCodeRequest) -> Dict[str, str]:
    explanation = await get_ai_explanation(req.code_line)
    return {"explanation": explanation}

# -----------------------------------------------------
# NEW — Summary Endpoint
# -----------------------------------------------------
@app.post("/python/summarize")
async def summarize_py(req: SummarizeCodeRequest) -> Dict[str, str]:
    if not req.trace:
        return {"summary": "Execution trace is empty, cannot generate summary."}

    final_step = req.trace[-1]
    summary = await get_ai_summary(req.code, final_step)
    return {"summary": summary}

# -----------------------------------------------------
# ❤️ LEGACY ENDPOINTS (Required for your frontend)
# -----------------------------------------------------
@app.post("/visualize")
async def visualize_alias(req: CodeExecutionRequest):
    return await visualize_py(req)

@app.post("/explain")
async def explain_alias(req: ExplainCodeRequest):
    return await explain_py(req)

@app.post("/summarize")
async def summarize_alias(req: SummarizeCodeRequest):
    return await summarize_py(req)

# -----------------------------------------------------
# Health check
# -----------------------------------------------------
@app.get("/")
def root() -> dict:
    return {"status": "ok"}
