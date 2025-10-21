from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import json

app = FastAPI()

class CodeRequest(BaseModel):
    code: str

@app.post("/python/visualize")
async def visualize_code(request: CodeRequest):
    try:
        # Save the user's code to a temp file
        with open("temp_script.py", "w") as f:
            f.write(request.code)
        
        # Run the script safely and capture the output
        result = subprocess.run(
            ["python", "temp_script.py"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        # Return stdout as JSON (must be valid JSON from the script)
        output = result.stdout.strip()
        return {"stdout": output, "stderr": result.stderr}

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Execution timed out.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
