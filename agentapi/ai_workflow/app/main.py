from fastapi import FastAPI
from app.api import workflow
import uvicorn

app = FastAPI(title="Disaster AI Workflow API")
app.include_router(workflow.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)