import sys
import io
import copy
import json
import types
import multiprocessing
from collections import deque
from typing import List

MAX_DEPTH = 10

def make_serializable(obj, seen=None, current_depth=0):
    """Recursively convert objects to JSON-safe representations."""
    if current_depth > MAX_DEPTH:
        return "repr(Object too deep)"
    if isinstance(obj, (int, float, str, bool, type(None))):
        return obj
    if seen is None:
        seen = set()
    obj_id = id(obj)
    if obj_id in seen:
        return f"repr(Circular ref {obj_id})"
    seen.add(obj_id)
    if isinstance(obj, (list, tuple, deque)):
        return [make_serializable(i, seen, current_depth + 1) for i in obj]
    if isinstance(obj, set):
        return [make_serializable(i, seen, current_depth + 1) for i in list(obj)]
    if isinstance(obj, dict):
        return {str(k): make_serializable(v, seen, current_depth + 1) for k, v in obj.items()}
    if hasattr(obj, "__dict__"):
        return {
            "__type__": obj.__class__.__name__,
            **{
                k: make_serializable(v, seen, current_depth + 1)
                for k, v in obj.__dict__.items()
                if not k.startswith("__")
            },
        }
    return repr(obj)


INTERNAL_VARS_TO_HIDE = [
    "MockInput", "tracer", "mock_input_function", "output_capture",
    "trace_python_code", "make_serializable", "sys", "copy", "io",
    "types", "deque", "MAX_DEPTH", "INTERNAL_VARS_TO_HIDE",
    "input", "__builtins__"
]


def trace_python_code(code_string: str, inputs: List[str] = []):
    """Execute and trace Python code line-by-line."""
    trace = []
    output_capture = io.StringIO()

    class MockInput:
        def __init__(self, inputs_list):
            self.inputs = [v for v in inputs_list if v.strip() != "" or v == ""]
            self.index = 0
        def __call__(self, prompt=""):
            output_capture.write(str(prompt))
            if self.index < len(self.inputs):
                value = self.inputs[self.index]
                self.index += 1
                output_capture.write(f"{value}\n")
                return value
            raise EOFError("End of input")

    mock_input_function = MockInput(inputs)

    def tracer(frame, event, arg):
        if event == "line":
            variables = {}
            all_vars = {**frame.f_globals, **frame.f_locals}
            for name, value in all_vars.items():
                if (
                    not name.startswith("__")
                    and name not in INTERNAL_VARS_TO_HIDE
                    and not isinstance(value, (types.ModuleType, types.FunctionType, type))
                ):
                    try:
                        variables[name] = make_serializable(value, seen=set())
                    except Exception:
                        variables[name] = "repr(Unsupported)"
            current_output = output_capture.getvalue()
            trace.append({
                "line": frame.f_lineno,
                "event": "line",
                "variables": variables,
                "output": current_output
            })
        return tracer

    sys.settrace(tracer)
    original_stdout = sys.stdout
    sys.stdout = output_capture

    try:
        exec(code_string, {"__builtins__": __builtins__, "input": mock_input_function})
    except Exception as e:
        sys.settrace(None)
        sys.stdout = original_stdout
        err_line = trace[-1]["line"] if trace else "start"
        final_out = output_capture.getvalue()
        return {"steps": trace, "error": f"Error near line {err_line}: {type(e).__name__}: {e}", "final_output": final_out}
    finally:
        sys.settrace(None)
        sys.stdout = original_stdout

    final_out = output_capture.getvalue()
    trace.append({"line": None, "event": "finished", "variables": {}, "output": final_out})
    return {"steps": trace, "error": None, "final_output": final_out}


def _trace_worker(code, inputs, result_queue):
    try:
        result = trace_python_code(code, inputs)
        result_queue.put(result)
    except Exception as e:
        result_queue.put({
            "steps": [],
            "error": f"Worker failed: {type(e).__name__}: {e}",
            "final_output": ""
        })


def safe_trace_python_code(code: str, inputs: List[str] = [], timeout_seconds: int = 5):
    """Run tracing safely in a subprocess to prevent Uvicorn hang."""

    # Use a multiprocessing.Queue for inter-process communication
    result_queue = multiprocessing.Queue()
    proc = multiprocessing.Process(target=_trace_worker, args=(code, inputs, result_queue))
    proc.daemon = True
    proc.start()
    proc.join(timeout_seconds)

    if proc.is_alive():
        try:
            proc.terminate()
        except Exception:
            pass
        return {
            "steps": [],
            "error": f"Execution timed out after {timeout_seconds}s",
            "final_output": ""
        }

    # Try to get result with a small timeout to avoid indefinite blocking
    try:
        result = result_queue.get(timeout=1)
    except Exception:
        # Nothing received — return a clear error to caller
        return {"steps": [], "error": "No output from subprocess", "final_output": ""}

    # Safety: ensure result shape, and truncate huge traces
    try:
        steps = result.get("steps", [])
        if isinstance(steps, list) and len(steps) > 5000:
            # defensive truncate (should be handled by main as well)
            result["steps"] = steps[:2000]
            result["truncated"] = True
    except Exception:
        pass

    return result
