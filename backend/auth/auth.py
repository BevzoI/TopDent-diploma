from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()

FAKE_USERS_DB = [
    {"username": "admin", "password": "adminpass", "role": "admin"},
    {"username": "user",  "password": "userpass",  "role": "staff"},
]

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(data: LoginRequest):
    user = next((u for u in FAKE_USERS_DB if u["username"] == data.username), None)
    if not user or data.password != user["password"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    return {
        "access_token": f"fake-jwt-token-for-{user['username']}",
        "token_type": "Bearer",
        "role": user["role"],
    }