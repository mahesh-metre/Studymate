import sys
import copy

def make_serializable(obj):
    """
    Recursively convert an object into a JSON-serializable format.
    """
    if isinstance(obj, (int, float, str, bool, type(None))):
        return obj
    if isinstance(obj, (list, tuple)):
        # It's a list, so convert each item
        return [make_serializable(item) for item in obj]
    if isinstance(obj, dict):
        # It's a dict, so convert each key and value
        return {str(k): make_serializable(v) for k, v in obj.items()}
    # For any other type of object, just return its string representation
    return repr(obj)

def trace_python_code(code_string: str):
    """
    Executes and traces arbitrary Python code, capturing the state of local
    variables at each step in a JSON-friendly format.
    """
    trace = []
    
    def tracer(frame, event, arg):
        if event == 'line':
            # Create a serializable version of the local variables
            variables = {}
            for name, value in frame.f_locals.items():
                if not name.startswith('__'):
                    variables[name] = make_serializable(value)

            trace.append({
                "line": frame.f_lineno,
                "variables": variables
            })
        return tracer

    execution_globals = {}
    original_trace = sys.gettrace()
    sys.settrace(tracer)
    
    try:
        exec(code_string, execution_globals)
    except Exception as e:
        # Stop tracing on error and report it
        sys.settrace(original_trace)
        # Get the line number from the last successful trace step
        error_line = trace[-1]['line'] if trace else 'an early'
        return {"steps": trace, "error": f"Execution Error near line {error_line}: {type(e).__name__}: {e}"}
    finally:
        sys.settrace(original_trace)
        
    return {"steps": trace, "error": None}

