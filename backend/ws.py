import asyncio
import json
from typing import Dict
from fastapi import WebSocket
from auth import decode_token


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, WebSocket] = {}  # client_id -> websocket
        self.ping_tasks: Dict[str, asyncio.Task] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active[client_id] = websocket
        task = asyncio.create_task(self._heartbeat(client_id))
        self.ping_tasks[client_id] = task

    def disconnect(self, client_id: str):
        self.active.pop(client_id, None)
        task = self.ping_tasks.pop(client_id, None)
        if task:
            task.cancel()

    async def broadcast(self, message: dict):
        data = json.dumps(message, default=str)
        disconnected = []
        for client_id, ws in list(self.active.items()):
            try:
                await ws.send_text(data)
            except Exception:
                disconnected.append(client_id)
        for cid in disconnected:
            self.disconnect(cid)

    async def _heartbeat(self, client_id: str):
        missed = 0
        while client_id in self.active:
            await asyncio.sleep(30)
            ws = self.active.get(client_id)
            if ws is None:
                break
            try:
                await ws.send_text(json.dumps({"type": "ping"}))
                missed = 0
            except Exception:
                missed += 1
                if missed >= 3:
                    self.disconnect(client_id)
                    break


manager = ConnectionManager()


async def ws_endpoint(websocket: WebSocket, token: str):
    display_name = decode_token(token)
    if not display_name:
        await websocket.close(code=4001)
        return

    client_id = f"{display_name}_{id(websocket)}"
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # handle pong
            try:
                msg = json.loads(data)
                if msg.get("type") == "pong":
                    pass  # heartbeat acknowledged
            except Exception:
                pass
    except Exception:
        pass
    finally:
        manager.disconnect(client_id)
