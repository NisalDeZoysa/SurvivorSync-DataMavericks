from fastapi import FastAPI
from api import api_routes
import uvicorn

app = FastAPI(title="Gateway Agent")
app.include_router(api_routes.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
