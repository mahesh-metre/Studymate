import os
import json
import httpx
from typing import List

# ---------------------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------------------

# Use ENV key if available on Render, otherwise fallback to your working local key
API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyD9FKMcEI5wWgx3Gc3cZ3G4YimR4G-lkr4")

API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash-preview-09-2025:generateContent?key=" + API_KEY
)

# ---------------------------------------------------------------------
# SYSTEM PROMPTS
# ---------------------------------------------------------------------

SYSTEM_PROMPT = (
    "You are an expert Python tutor. Explain the following line of code to a "
    "beginner in one or two simple sentences, in a friendly and encouraging tone. "
    "Do not be overly technical."
)

SUMMARY_SYSTEM_PROMPT = """
You are an expert Python tutor. You will be given a user's Python code and the
final step of its execution trace. Provide a clear 2–4 sentence summary of what
the code accomplished. If the result is an error, explain it simply. Be friendly.
"""

VARIABLE_MAPPER_SYSTEM_PROMPT = """
You are a Python code analyzer. Map each variable to its most likely data
structure type.

Valid types:
- graph
- stack
- queue
- binary_tree
- linked_list
- dictionary
- set
- heap (or priority_queue)
- other

Return ONLY valid JSON. No text. No explanation.
"""

# ---------------------------------------------------------------------
#  GENERIC CALL FUNCTION
# ---------------------------------------------------------------------

async def call_gemini(payload: dict):
    """Safe wrapper around the Gemini API."""
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(API_URL, json=payload)
            r.raise_for_status()
            return r.json()
    except Exception as e:
        print("Gemini API error:", e)
        return {"error": str(e)}

# ---------------------------------------------------------------------
# 1. Explain a single line
# ---------------------------------------------------------------------

async def get_ai_explanation(code_line: str) -> str:
    payload = {
        "contents": [{"parts": [{"text": code_line}]}],
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]}
    }

    result = await call_gemini(payload)
    if "error" in result:
        return result["error"]

    try:
        return (
            result["candidates"][0]["content"]["parts"][0]["text"]
            .strip()
        )
    except:
        return "Explanation unavailable."

# ---------------------------------------------------------------------
# 2. Summary of full execution
# ---------------------------------------------------------------------

async def get_ai_summary(code: str, final_step: dict) -> str:
    user_prompt = f"""
Here is the code:
---
{code}
---

Here is the final step of execution:
---
{json.dumps(final_step, indent=2)}
---

Provide a simple summary.
"""

    payload = {
        "contents": [{"parts": [{"text": user_prompt}]}],
        "systemInstruction": {"parts": [{"text": SUMMARY_SYSTEM_PROMPT}]}
    }

    result = await call_gemini(payload)
    if "error" in result:
        return result["error"]

    try:
        return (
            result["candidates"][0]["content"]["parts"][0]["text"]
            .strip()
        )
    except:
        return "Summary unavailable."

# ---------------------------------------------------------------------
# 3. Variable Mapper
# ---------------------------------------------------------------------

async def get_ai_variable_map(code: str, var_names: List[str]) -> dict:
    if not var_names:
        return {}

    user_prompt = f"""
Code:
{code}

Variables: {var_names}

ONLY return valid JSON mapping variables to types.
"""

    payload = {
        "contents": [{"parts": [{"text": user_prompt}]}],
        "systemInstruction": {"parts": [{"text": VARIABLE_MAPPER_SYSTEM_PROMPT}]},
        "generationConfig": {"responseMimeType": "application/json"}
    }

    result = await call_gemini(payload)
    if "error" in result:
        print("Variable map error:", result["error"])
        return {}

    try:
        text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
        return json.loads(text)
    except Exception as e:
        print("Variable map JSON parse failed:", e)
        return {}
