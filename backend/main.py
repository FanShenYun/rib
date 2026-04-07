import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import init_db
from auth import verify_password, create_token
from schemas import AuthRequest, AuthResponse
from routes import cards, parse
from ws import ws_endpoint

import uvicorn
from fastapi import WebSocket


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Radio Intel Board", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auth", response_model=AuthResponse)
async def auth(body: AuthRequest):
    if not verify_password(body.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="密碼錯誤",
        )
    if not body.display_name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="顯示名稱不得為空",
        )
    token = create_token(body.display_name.strip())
    return AuthResponse(token=token)


app.include_router(cards.router, prefix="/api/cards", tags=["cards"])
app.include_router(parse.router, prefix="/api/parse", tags=["parse"])


@app.websocket("/ws")
async def websocket_route(websocket: WebSocket, token: str):
    await ws_endpoint(websocket, token)


# Serve React build in production
frontend_build = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(frontend_build):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_build, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        index = os.path.join(frontend_build, "index.html")
        return FileResponse(index)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
