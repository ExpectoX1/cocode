import bcrypt
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from jwtauth import gen_jwt
from database import connection_pool
from schemas import UserRegister, UserLogin

router = APIRouter()

@router.post("/register")
def register(user:UserRegister):
    salt = bcrypt.gensalt(rounds=12)
    hashed_pass = bcrypt.hashpw(user.password.encode("utf-8"), salt)
    conn = connection_pool.getconn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",(user.username, user.email, hashed_pass.decode())
    )
    conn.commit()
    cur.close()
    connection_pool.putconn(conn)
    return JSONResponse(
        content={"message":"success"},
        status_code=status.HTTP_201_CREATED,
    )

@router.post("/login")
def login(user:UserLogin):
    conn = connection_pool.getconn()
    cur = conn.cursor()
    cur.execute("SELECT id,password_hash from users WHERE email=%s",(user.email,))
    res = cur.fetchone()
    try:
        if not res:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail= "User does not exist please register"
            )
        elif res:
            isCorrectPassword = bcrypt.checkpw(user.password.encode() , res[1].encode())
            if isCorrectPassword:
                token = gen_jwt(str(res[0]))
                return JSONResponse(
                    content={"message":"login successful", "token":token},
                    status_code=status.HTTP_200_OK,
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail= "Wrong Password"
                )
    finally:
        cur.close()
        connection_pool.putconn(conn)
