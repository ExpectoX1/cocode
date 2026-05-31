import datetime
import jwt
import os
from fastapi import HTTPException, Request

def gen_jwt(user_id:str):
    secret = os.getenv("JWT_SECRET")
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, secret, algorithm="HS256")

def get_current_user(request:Request):
    secret = os.getenv("JWT_SECRET")
    try:
        auth:str = request.headers.get("Authorization")
        if not auth:
            raise HTTPException(status_code=401, detail="No token provided")
        token = auth.split(" ")[1]
        res = jwt.decode(token, secret, algorithms=["HS256"])
        return res
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")
