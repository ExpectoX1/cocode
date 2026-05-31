
from fastapi import APIRouter, FastAPI, WebSocket, WebSocketDisconnect
import os 
import jwt

router = APIRouter()


rooms: dict[str, list[WebSocket]] = {}

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(room_id: str, websocket: WebSocket, token: str):
    await websocket.accept()
    
    try:
        secret = os.getenv("JWT_SECRET")
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        user_id = payload["user_id"]
    except Exception:
        await websocket.close(code=4001)
        return

    rooms.setdefault(room_id, []).append(websocket)
    
    for ws in rooms[room_id]:
        if ws != websocket:
            await ws.send_json({"type": "user_joined", "user_id": user_id})

    try:
        while True:
            data = await websocket.receive_json()
            for ws in rooms[room_id]:
                if ws != websocket:
                    await ws.send_json(data)
    except WebSocketDisconnect:
        rooms[room_id].remove(websocket)
        for ws in rooms[room_id]:
            await ws.send_json({"type": "user_left", "user_id": user_id})