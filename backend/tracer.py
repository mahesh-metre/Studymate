import sys
import copy
import io
import types
from typing import List
from collections import deque # <-- 1. ADD THIS IMPORT

def make_serializable(obj):
    """
    Recursively convert an object into a JSON-serializable format.
    Handles sets, deques, and custom classes.
    """
    # 1. Basic Types
    if isinstance(obj, (int, float, str, bool, type(None))):
        return obj
    
    # 2. Lists, Tuples, AND Deques (Convert all to list)
    if isinstance(obj, (list, tuple, deque)):
        return [make_serializable(item) for item in obj]
    
    # 3. Sets (Convert to list, sorted for consistency)
    if isinstance(obj, set):
        try:
            return [make_serializable(item) for item in sorted(list(obj))]
        except:
            # If items aren't comparable, just convert to list
            return [make_serializable(item) for item in list(obj)]

    # 4. Dictionaries
    if isinstance(obj, dict):
        return {str(k): make_serializable(v) for k, v in obj.items()}
    
    # 5. Custom Objects (The "Catch-All")
    if hasattr(obj, '__dict__'):
        try:
            data = {str(k): make_serializable(v) for k, v in obj.__dict__.items() if not k.startswith('__')}
            data['__type__'] = type(obj).__name__
            return data
        except Exception:
            return repr(obj)
            
    # 6. Fallback
    return repr(obj)

def trace_python_code(code_string: str, inputs: List[str] = []):
    trace = []
    output_capture = io.StringIO()
    
    class MockInput:
        def __init__(self, inputs_list):
            self.inputs = inputs_list
            self.index = 0

        def __call__(self, prompt=""):
            output_capture.write(str(prompt))
            if self.index < len(self.inputs):
                value = self.inputs[self.index]
                self.index += 1
                output_capture.write(f"{value}\n")
                return value
            raise EOFError("End of input. Code requested more input than provided.")

    mock_input_function = MockInput(inputs)

    def tracer(frame, event, arg):
        if event == 'line':
            variables = {}
            # Capture locals
            for name, value in frame.f_locals.items():
                if not name.startswith('__') and not callable(value):
                     if not isinstance(value, (types.ModuleType, types.FunctionType)):
                        variables[name] = make_serializable(value)
            
            # Capture globals (only modified/custom ones)
            for name, value in frame.f_globals.items():
                if not name.startswith('__') and name not in variables and not callable(value):
                    if not isinstance(value, (types.ModuleType, types.FunctionType, types.BuiltinFunctionType)):
                         variables[name] = make_serializable(value)

            current_output = output_capture.getvalue()

            trace.append({
                "line": frame.f_lineno,
                "event": "line",
                "variables": variables,
                "output": current_output
            })
        return tracer

    execution_globals = {
        'input': mock_input_function,
        'list': list, 'dict': dict, 'set': set, 'len': len, 'range': range, # builtins
    }
    
    original_trace = sys.gettrace()
    original_stdout = sys.stdout 
    sys.stdout = output_capture
    sys.settrace(tracer)
    
    try:
        exec(code_string, execution_globals)
    except Exception as e:
        sys.settrace(original_trace)
        sys.stdout = original_stdout 
        error_line = trace[-1]['line'] if trace else 'unknown'
        final_output = output_capture.getvalue()
        return {"steps": trace, "error": f"Error on line {error_line}: {type(e).__name__}: {e}", "final_output": final_output}
    finally:
        sys.settrace(original_trace)
        sys.stdout = original_stdout
    
    # Capture final state
    final_variables = {}
    for name, value in execution_globals.items():
        if not name.startswith('__') and name not in ['input'] and not callable(value):
             if not isinstance(value, (types.ModuleType, types.FunctionType)):
                final_variables[name] = make_serializable(value)

    trace.append({
        "line": None,
        "event": "finished",
        "variables": final_variables,
        "output": output_capture.getvalue()
    })
        
    return {"steps": trace, "error": None}
