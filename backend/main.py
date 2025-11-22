
from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import traceback
import logging

# --- Import AI and tracing functions ---
# NOTE: these imports expect the same backend package layout you already have.
# If running this file from a different working directory, ensure PYTHONPATH is set
# so that 'backend.tracer' and 'backend.ai_explainer' are importable.
from backend.tracer import trace_python_code
from backend.ai_explainer import get_ai_explanation, get_ai_summary, get_ai_variable_map

# Basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("decipher-backend")

PROJECT_ROOT = Path(__file__).resolve().parent
# If your project layout places `backend` one level up, adjust accordingly:
# PROJECT_ROOT = Path(__file__).resolve().parent.parent

app = FastAPI(title="Decipher Algorithms API", version="1.0.0")

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
    trace: List[Dict[str, Any]]  # Send the whole trace

# Utility to create a safe, standard empty response structure
def empty_trace_response() -> Dict[str, Any]:
    return {"steps": [], "variable_map": {}}

# --- Core /python/* endpoints (the "new" organized API) --- #
@app.post("/python/visualize")
async def visualize_py(req: CodeExecutionRequest) -> Dict[str, Any]:
    """
    Traces arbitrary Python code with user inputs.
    Also calls the AI to create a variable map (best-effort).
    Returns the same JSON shape the frontend expects:
    {
      "steps": [ { "line": 1, "event": "line", "variables": {...}, "output": "..." }, ... ],
      "variable_map": { "varName": "stack", ... }
    }
    """
    try:
        logger.info("Visualize requested (python/visualize)")
        trace_data = trace_python_code(req.code, req.inputs) or empty_trace_response()

        # Variable mapping (best-effort)
        variable_map = {}
        try:
            if trace_data.get("steps"):
                final_step_vars = trace_data["steps"][-1].get("variables", {}) or {}
                var_names = list(final_step_vars.keys())
                if var_names:
                    # The AI mapper is async - await it
                    variable_map = await get_ai_variable_map(req.code, var_names)
        except Exception as e:
            logger.exception("Error while computing variable_map: %s", e)
            variable_map = {}

        trace_data["variable_map"] = variable_map or {}
        return trace_data

    except Exception as exc:
        logger.exception("Unhandled error in /python/visualize: %s", exc)
        # Return safe shape that frontend can handle
        return {"steps": [], "variable_map": {}, "error": "Internal server error - check backend logs."}

@app.post("/python/explain")
async def explain_py(req: ExplainCodeRequest) -> Dict[str, str]:
    """
    Accepts a line of Python code and returns an AI-generated explanation.
    """
    try:
        logger.info("Explain requested (python/explain)")
        explanation = await get_ai_explanation(req.code_line)
        return {"explanation": explanation}
    except Exception as exc:
        logger.exception("Unhandled error in /python/explain: %s", exc)
        return {"explanation": f"Failed to explain line: {str(exc)}"}

@app.post("/python/summarize")
async def summarize_py(req: SummarizeCodeRequest) -> Dict[str, str]:
    """
    Accepts the full code and trace, and returns an AI-generated summary.
    """
    try:
        logger.info("Summarize requested (python/summarize)")
        if not req.trace:
            return {"summary": "Execution trace is empty, cannot generate summary."}

        final_step = req.trace[-1]
        summary = await get_ai_summary(req.code, final_step)
        return {"summary": summary}
    except Exception as exc:
        logger.exception("Unhandled error in /python/summarize: %s", exc)
        return {"summary": f"Failed to summarize execution: {str(exc)}"}

# --- LEGACY alias endpoints so older frontends continue to work --- #
@app.post("/visualize")
async def visualize_py_alias(req: CodeExecutionRequest) -> Dict[str, Any]:
    """
    Alias to /python/visualize for backwards compatibility.
    """
    return await visualize_py(req)

@app.post("/explain")
async def explain_py_alias(req: ExplainCodeRequest) -> Dict[str, str]:
    """
    Alias to /python/explain for backwards compatibility.
    """
    return await explain_py(req)

@app.post("/summarize")
async def summarize_py_alias(req: SummarizeCodeRequest) -> Dict[str, str]:
    """
    Alias to /python/summarize for backwards compatibility.
    """
    return await summarize_py(req)

# Health check
@app.get("/")
def root() -> dict:
    """
    Root endpoint for health check.
    """
    return {"status": "ok"}

# Optional: detailed debug endpoint to inspect the tracer output quickly
# (Useful during development; remove or protect in production)
@app.post("/debug/trace")
async def debug_trace(req: CodeExecutionRequest) -> Dict[str, Any]:
    try:
        logger.info("Debug trace requested")
        trace_data = trace_python_code(req.code, req.inputs) or empty_trace_response()
        return trace_data
    except Exception as exc:
        logger.exception("Error in debug/trace: %s", exc)
        return {"steps": [], "error": str(exc)}

