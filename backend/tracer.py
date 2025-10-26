import sys
import copy
import io # Import the io module to handle output streams

def make_serializable(obj):
    # ... (this function remains the same) ...
    if isinstance(obj, (int, float, str, bool, type(None))):
        return obj
    if isinstance(obj, (list, tuple)):
        return [make_serializable(item) for item in obj]
    if isinstance(obj, dict):
        return {str(k): make_serializable(v) for k, v in obj.items()}
    return repr(obj)

def trace_python_code(code_string: str):
    """
    Executes and traces arbitrary Python code, capturing variable states
    and standard output (print statements) at each step.
    """
    trace = []
    # --- 1. Use io.StringIO to capture print output ---
    output_capture = io.StringIO()
    
    def tracer(frame, event, arg):
        if event == 'line':
            variables = {}
            for name, value in frame.f_locals.items():
                if not name.startswith('__'):
                    variables[name] = make_serializable(value)
            
            # --- 2. Get the output printed *up to this line* ---
            current_output = output_capture.getvalue()

            trace.append({
                "line": frame.f_lineno,
                "event": "line",
                "variables": variables,
                "output": current_output # Add captured output to the trace step
            })
        return tracer

    execution_globals = {}
    original_trace = sys.gettrace()
    original_stdout = sys.stdout # Store original stdout

    # --- 3. Redirect stdout before execution ---
    sys.stdout = output_capture
    sys.settrace(tracer)
    
    try:
        exec(code_string, execution_globals)
    except Exception as e:
        sys.settrace(original_trace)
        sys.stdout = original_stdout # Restore stdout on error
        error_line = trace[-1]['line'] if trace else 'an early'
        # Include any output captured before the error
        final_output = output_capture.getvalue()
        return {"steps": trace, "error": f"Execution Error near line {error_line}: {type(e).__name__}: {e}", "final_output": final_output}
    finally:
        # --- 4. Always restore stdout and the tracer ---
        sys.settrace(original_trace)
        sys.stdout = original_stdout
    
    # --- Capture final state and output after successful execution ---
    final_output = output_capture.getvalue()
    final_variables = {}
    for name, value in execution_globals.items():
        if not name.startswith('__'):
            final_variables[name] = make_serializable(value)

    trace.append({
        "line": None,
        "event": "finished",
        "variables": final_variables,
        "output": final_output # Include final output in the finished step
    })
        
    return {"steps": trace, "error": None, "final_output": final_output} # Also return final output separately

