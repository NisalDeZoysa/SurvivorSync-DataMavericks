from fastapi import FastAPI
from api import tips_routes
import uvicorn

app = FastAPI(title="Tips Agent server")
app.include_router(tips_routes.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
