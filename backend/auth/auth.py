from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from passlib.context import CryptContext

router = APIRouter()

# --- Конфігурація та Інструменти Безпеки ---
# Для хешування паролів (безпечно!)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Імітація бази даних (У реальному проєкті це був би PostgreSQL)
FAKE_USERS_DB = [
    # Admin
    {"username": "admin", "hashed_password": pwd_context.hash("adminpass"), "role": "admin"},
    # Персонал
    {"username": "doctor_ivan", "hashed_password": pwd_context.hash("docpass123"), "role": "personnel"},
]

# --- Pydantic Схеми (як React Native надсилає дані) ---
class UserLogin(BaseModel):
    username: str
    password: str

# --- Pydantic Схеми (як FastAPI відповідає) ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str # Додаємо роль у відповідь!

# --- Функції Безпеки ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(username: str):
    for user in FAKE_USERS_DB:
        if user["username"] == username:
            return user
    return None

# --- Роутер для Входу ---
@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: UserLogin):
    user = get_user(form_data.username)
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # *** УВАГА! ЦЕ ПРИКЛАД БЕЗ СТВОРЕННЯ РЕАЛЬНОГО JWT-ТОКЕНА! ***
    # Для MVP ми просто повернемо статичний токен та роль.
    # У реальному проєкті тут має бути логіка створення JWT (через `python-jose`).
    
    # Імітуємо створення токена, щоб React Native міг його отримати
    access_token = f"fake-jwt-token-for-{user['username']}" 
    
    return {
        "access_token": access_token,
        "token_type": "Bearer",
        "role": user["role"] # Головний елемент для фронтенду!
    }