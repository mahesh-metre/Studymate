import os
import json
import httpx
from typing import List

# ---------------------------------------------------------------------
# ✅ CONFIGURATION
# ---------------------------------------------------------------------
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("⚠️ Warning: GEMINI_API_KEY not set in environment variables.")

AI_CONNECT_TIMEOUT = float(os.getenv("AI_CONNECT_TIMEOUT", "10"))
AI_READ_TIMEOUT    = float(os.getenv("AI_READ_TIMEOUT", "60"))
AI_WRITE_TIMEOUT   = float(os.getenv("AI_WRITE_TIMEOUT", "10"))
AI_POOL_TIMEOUT    = float(os.getenv("AI_POOL_TIMEOUT", "10"))

API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

# ---------------------------------------------------------------------
# ✅ PROMPTS
# ---------------------------------------------------------------------

SYSTEM_PROMPT = (
    "You are an expert Python tutor. Explain the following line of code to a "
    "beginner in one or two simple sentences, in a friendly and encouraging tone. "
    "Do not be overly technical."
)

SUMMARY_SYSTEM_PROMPT = """
You are an expert Python tutor. You will be given a user's Python code and the final step of its execution trace.
Your job is to provide a high-level, concise summary (2-4 sentences) explaining the final outcome of the code.

- Explain what the code accomplished (e.g., "The code successfully built a list...").
- Use the 'variables' and 'output' from the final trace step to describe the result.
- If there was an error, briefly explain the error.
- Be friendly, encouraging, and easy to understand. Do not just repeat the code line by line.
"""

VARIABLE_MAPPER_SYSTEM_PROMPT = """
You are a Python code analyzer. You will be given a user's Python code and a list of its variables.
Based on how the variables are used, map each variable to its most likely data structure type.
The valid types are: 'graph', 'stack', 'queue', 'binary_tree', 'linked_list', 'dictionary',
'set', 'heap' (or 'priority_queue'), or 'other'.
Respond in JSON format ONLY. Do not include any other text, explanations, or markdown.

Example:
Code:
'''
g = {0: [1], 1: [0]}
q = [0]
q.pop(0)
'''
Variables: ['g', 'q']

Your JSON response:
{
  "g": "graph",
  "q": "queue"
}
"""

# ---------------------------------------------------------------------
# ✅ Helper for Safe Gemini API Calls
# ---------------------------------------------------------------------
async def call_gemini(payload: dict) -> dict:
    """
    Safely call Gemini API with timeout and error handling.
    Always returns either a dict with 'candidates' or an {'error': str}.
    """
    if not API_KEY:
        return {"error": "GEMINI_API_KEY not configured"}

    # Explicitly set connect/read/write/pool timeouts
    timeout = httpx.Timeout(
        connect=AI_CONNECT_TIMEOUT,
        read=AI_READ_TIMEOUT,
        write=AI_WRITE_TIMEOUT,
        pool=AI_POOL_TIMEOUT
    )

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                API_URL,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
    except httpx.RequestError as e:
        print(f"🌐 Network error while calling Gemini: {e}")
        return {"error": "Network error while contacting Gemini"}

    # Handle non-200 responses gracefully
    if response.status_code != 200:
        # Log full details for debugging
        try:
            text = response.text
        except Exception:
            text = "<could not read response.text>"
        print(f"❌ Gemini API Error {response.status_code}: {text}")
        try:
            data = response.json()
            message = data.get("error", {}).get("message", "Unknown error")
        except Exception:
            message = text
        return {"error": f"Gemini returned {response.status_code}: {message}"}

    try:
        return response.json()
    except Exception as e:
        print(f"⚠️ JSON parsing error from Gemini: {e}")
        return {"error": "Invalid JSON from Gemini"}

# ---------------------------------------------------------------------
# ✅ 1. Explain Single Line
# ---------------------------------------------------------------------
async def get_ai_explanation(code_line: str) -> str:
    payload = {
        "contents": [{"parts": [{"text": code_line}]}],
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
    }

    result = await call_gemini(payload)

    if "error" in result:
        return result["error"]

    try:
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        return text.strip()
    except Exception as e:
        print(f"⚠️ Parsing AI explanation failed: {e}")
        return "Error: Could not parse explanation."

# ---------------------------------------------------------------------
# ✅ 2. Generate Code Summary
# ---------------------------------------------------------------------
async def get_ai_summary(code: str, final_step: dict) -> str:
    user_prompt = f"""
Here is my Python code:
---
{code}
---

Here is the final step of the execution trace, which shows the final variables, output, and any errors:
---
{json.dumps(final_step, indent=2)}
---

Please provide a summary of what this code did, based on its final state.
"""

    payload = {
        "contents": [{"parts": [{"text": user_prompt}]}],
        "systemInstruction": {"parts": [{"text": SUMMARY_SYSTEM_PROMPT}]},
    }

    result = await call_gemini(payload)

    if "error" in result:
        return result["error"]

    try:
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        return text.strip()
    except Exception as e:
        print(f"⚠️ Parsing AI summary failed: {e}")
        return "Error: Could not parse summary."

# ---------------------------------------------------------------------
# ✅ 3. Variable Mapper
# ---------------------------------------------------------------------
async def get_ai_variable_map(code: str, var_names: List[str]) -> dict:
    if not var_names:
        return {}

    user_prompt = f"""
Code:
---
{code}
---
Variables: {var_names}

Your JSON response:
"""

    payload = {
        "contents": [{"parts": [{"text": user_prompt}]}],
        "systemInstruction": {"parts": [{"text": VARIABLE_MAPPER_SYSTEM_PROMPT}]},
        "generationConfig": {"responseMimeType": "application/json"},
    }

    result = await call_gemini(payload)

    if "error" in result:
        print(f"⚠️ Gemini Variable Map Error: {result['error']}")
        return {}

    try:
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        # Some responses may include leading/trailing whitespace — strip before JSON load
        return json.loads(text.strip())
    except Exception as e:
        print(f"⚠️ Parsing variable map failed: {e}")
        return {}
