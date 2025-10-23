from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import subprocess, sys, tempfile, json

app = FastAPI()

# --- Allow frontend to connect ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (safe for local dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str

@app.post("/python/visualize")
def visualize_code(request: CodeRequest):
    try:
        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".py") as f:
            f.write(request.code)
            temp_file = f.name

        result = subprocess.run(
            [sys.executable, temp_file],
            capture_output=True,
            text=True,
            timeout=5
        )

        try:
            output = json.loads(result.stdout)
        except:
            output = {"steps": [], "final_order": result.stdout.strip()}

        return output

    except Exception as e:
        return {"steps": [], "final_order": str(e)}
