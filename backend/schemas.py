from typing import Literal
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    username: str
    email:EmailStr
    password: str

class UserLogin(BaseModel):
    email:EmailStr
    password:str

class CreateRoomRequest(BaseModel):
    room_name: str
    language: Literal["python", "cpp", "java"] | None = None

class JoinRoomRequest(BaseModel):
    room_id: str