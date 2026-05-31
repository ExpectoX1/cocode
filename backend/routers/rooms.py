from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse
from jwtauth import get_current_user
from database import connection_pool
from schemas import CreateRoomRequest, JoinRoomRequest
from enums import Role, Status
import uuid

router = APIRouter()

@router.post("/create-room")
def create_room_add_host(request:Request, userReq:CreateRoomRequest):
    #protected route
    conn = None
    cur = None 
    try:
        id = get_current_user(request)["user_id"]
        room_name = userReq.room_name
        language = userReq.language or "python"
        conn = connection_pool.getconn()
        cur = conn.cursor()
        cur.execute("INSERT INTO rooms (language,room_name,status) VALUES (%s,%s,%s) RETURNING id",(language,room_name,Status.CREATED))
        room_id = cur.fetchone()[0] 
        cur.execute("INSERT INTO room_participants (role,room_id,user_id) VALUES (%s,%s,%s)",(Role.INTER,room_id,id))
        conn.commit()
        return JSONResponse(
            content={"message":"success", "room_id" : room_id },
            status_code=status.HTTP_201_CREATED,
        )
    finally:
        if cur : cur.close()
        if conn : connection_pool.putconn(conn)

@router.post("/join-room")
def join_room(request:Request, userReq:JoinRoomRequest):
    conn = None
    cur = None  
    #protected route
    try:
        try:
            uuid.UUID(str(userReq.room_id))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid room ID format")
        id = get_current_user(request)["user_id"]
        conn = connection_pool.getconn()
        cur = conn.cursor()
        cur.execute("SELECT room_name,status FROM rooms where id = %s",(userReq.room_id,))
        room_res = cur.fetchone()
        if not room_res:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room Not found"
            )
        if room_res[1] == Status.ENDED:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Room Ended :("
            )
        cur.execute("SELECT user_id FROM room_participants where room_id = %s and user_id = %s",(userReq.room_id,id))
        p_res = cur.fetchone()
        if p_res:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already in the Room"
            )
        else:
            cur.execute("INSERT INTO room_participants (role,user_id,room_id) VALUES (%s,%s,%s)",(Role.CAND, id, userReq.room_id))
            conn.commit()
            return JSONResponse(
                content={"message":"success"},
                status_code=status.HTTP_201_CREATED
            )
    finally:
        if cur :cur.close()
        if conn :connection_pool.putconn(conn)




    
