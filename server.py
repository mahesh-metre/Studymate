from fastapi import FastAPI
from pydantic import BaseModel
import subprocess
import sys
import tempfile
import json

app = FastAPI()

class CodeRequest(BaseModel):
    code: str

@app.post("/python/visualize")
def visualize_code(request: CodeRequest):
    try:
        # Save user code to temp file
        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".py") as f:
            f.write(request.code)
            temp_file = f.name

        # Run the code and capture stdout
        result = subprocess.run(
            [sys.executable, temp_file],
            capture_output=True,
            text=True,
            timeout=5
        )

        # Try parsing output as JSON (your DFS/Bubble Sort should print JSON)
        try:
            output = json.loads(result.stdout)
        except:
            output = {"steps": [], "final_order": result.stdout.strip()}

        return output

    except Exception as e:
        return {"steps": [], "final_order": str(e)}
