from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter()

# --- Pydantic Схеми ---

# Модель для створення нового оголошення (вхідні дані)
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    # Можна додати: image_url: Optional[str]

# Модель для оголошення (вихідні дані)
class Announcement(AnnouncementCreate):
    id: int
    author_role: str
    published_at: datetime
    
# --- Імітація Бази Даних ---
# Початкові дані
ANNOUNCEMENTS_DB = [
    {
        "id": 1,
        "title": "Вітаємо у TopDentTeam!",
        "content": "Будь ласка, ознайомтеся з новим графіком роботи на наступний тиждень. Він доступний у розділі 'Графік'.",
        "author_role": "admin",
        "published_at": datetime.now(),
    },
]
current_id = 2

# --- Роутери ---

# 1. Отримати всі оголошення (для всіх користувачів)
@router.get("/", response_model=List[Announcement])
async def get_all_announcements():
    # Повертаємо оголошення у зворотному хронологічному порядку
    return sorted(ANNOUNCEMENTS_DB, key=lambda x: x["published_at"], reverse=True)

# 2. Створити нове оголошення (тільки для Admin)
# У реальному проєкті тут має бути перевірка токена на роль 'admin'
@router.post("/", response_model=Announcement)
async def create_new_announcement(announcement: AnnouncementCreate):
    global current_id
    
    new_announcement = {
        "id": current_id,
        "title": announcement.title,
        "content": announcement.content,
        "author_role": "admin", # Завжди створюється адміністратором
        "published_at": datetime.now(),
    }
    ANNOUNCEMENTS_DB.append(new_announcement)
    current_id += 1
    
    return new_announcement