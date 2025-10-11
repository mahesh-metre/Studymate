from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class GraphData(BaseModel):
    graph: Dict[str, List[int]]
    start: int

@app.post("/python/bfs")
def bfs_endpoint(data: GraphData):
    graph = {int(k): v for k, v in data.graph.items()}
    start = data.start

    visited = set()
    queue = []
    steps = []
    order_so_far = []

    queue.append(start)

    while queue:
        current = queue.pop(0)
        if current not in visited:
            visited.add(current)
            order_so_far.append(current)
            for neighbor in graph.get(current, []):
                if neighbor not in visited and neighbor not in queue:
                    queue.append(neighbor)

        steps.append({
            "current": current,
            "queue": queue.copy(),
            "visited": list(visited),
            "order_so_far": order_so_far.copy()
        })

    return {"steps": steps, "final_order": order_so_far}
