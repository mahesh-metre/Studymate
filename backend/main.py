from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# --- Import AI and tracing functions ---
from backend.tracer import trace_python_code
# --- 1. Import the new variable mapper function ---
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
    inputs: List[str] = [] # For handling user input

class ExplainCodeRequest(BaseModel): 
    code_line: str

# --- NEW: Request Model for Summary ---
class SummarizeCodeRequest(BaseModel):
    code: str
    trace: List[Dict[str, Any]] # Send the whole trace


# --- 2. Make the /visualize endpoint 'async def' ---
@app.post("/python/visualize")
async def visualize_py(req: CodeExecutionRequest) -> Dict[str, Any]:
    """
    Traces arbitrary Python code with user inputs.
    Now also calls the AI to create a variable map.
    """
    # 1. Run the tracer (this is synchronous)
    trace_data = trace_python_code(req.code, req.inputs)
    
    variable_map = {}
    try:
        # 2. Get the final variables from the trace
        if trace_data.get("steps"):
            final_step_vars = trace_data["steps"][-1].get("variables", {})
            var_names = list(final_step_vars.keys())
            
            # 3. Call the new async AI function
            if var_names:
                variable_map = await get_ai_variable_map(req.code, var_names)
                
    except Exception as e:
        print(f"Error during variable mapping: {e}")
        # Continue anyway, just with an empty map
    
    # 4. Add the map to the response
    trace_data["variable_map"] = variable_map
    
    return trace_data

@app.post("/python/explain") 
async def explain_py(req: ExplainCodeRequest) -> Dict[str, str]: 
    """
    Accepts a line of Python code and returns an AI-generated explanation.
    """
    explanation = await get_ai_explanation(req.code_line)
    return {"explanation": explanation}

# --- NEW: Endpoint for Summary ---
@app.post("/python/summarize")
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


@app.get("/")
def root() -> dict:
    """
    Root endpoint for health check.
    """
    return {"status": "ok"}
